from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import Normalizer

def evidence_text(item: dict) -> str:
    return " ".join([
        item.get("title",""),
        item.get("claim",""),
        item.get("evidence",""),
        " ".join(item.get("tags") or []),
        item.get("boundary") or ""
    ])

@dataclass
class SearchHit:
    item: dict
    score: float

class LocalLSIRetriever:
    """Local vector retrieval using TF-IDF -> latent semantic projection.

    This is a real vector index and useful offline, but it is not claimed to be
    equivalent to large neural embedding models.
    """
    def __init__(self, max_features: int = 12000, dimensions: int = 128):
        self.max_features=max_features
        self.dimensions=dimensions
        self.vectorizer=None
        self.svd=None
        self.normalizer=None
        self.matrix=None
        self.items=[]

    def fit(self, items: list[dict]):
        self.items=list(items)
        docs=[evidence_text(x) for x in self.items]
        if not docs:
            self.matrix=np.zeros((0,1))
            return self
        self.vectorizer=TfidfVectorizer(
            lowercase=True, ngram_range=(1,2), min_df=1, max_features=self.max_features,
            sublinear_tf=True
        )
        X=self.vectorizer.fit_transform(docs)
        max_dim=max(1,min(self.dimensions, X.shape[0]-1 if X.shape[0]>1 else 1, X.shape[1]-1 if X.shape[1]>1 else 1))
        if X.shape[0] > 2 and X.shape[1] > 2 and max_dim >= 2:
            self.svd=TruncatedSVD(n_components=max_dim, random_state=42)
            dense=self.svd.fit_transform(X)
        else:
            self.svd=None
            dense=X.toarray()
        self.normalizer=Normalizer(copy=False)
        self.matrix=self.normalizer.fit_transform(dense)
        return self

    def encode_query(self, query: str):
        if self.vectorizer is None:
            return np.zeros((1,1))
        q=self.vectorizer.transform([query])
        dense=self.svd.transform(q) if self.svd is not None else q.toarray()
        return self.normalizer.transform(dense)

    def search(self, query: str, limit: int = 10):
        if not self.items:
            return []
        q=self.encode_query(query)[0]
        scores=self.matrix @ q
        order=np.argsort(-scores)[:limit]
        return [SearchHit(self.items[int(i)], float(scores[int(i)])) for i in order if scores[int(i)] > 0]

class HybridRetriever:
    def __init__(self, evidence_store, vector_retriever: LocalLSIRetriever):
        self.store=evidence_store
        self.vector=vector_retriever

    def rebuild(self):
        self.vector.fit(self.store.all())

    def search(self, query: str, limit: int = 10):
        lexical={x["id"]:x for x in self.store.search(query,limit*2)}
        vector={h.item["id"]:(h.item,h.score) for h in self.vector.search(query,limit*2)}
        ids=set(lexical)|set(vector)
        out=[]
        for i in ids:
            item=(vector.get(i) or (lexical[i],0))[0]
            v=vector.get(i,(None,0))[1]
            # FTS bm25 lower is better; convert presence to a conservative bonus.
            l=1.0 if i in lexical else 0.0
            score=0.68*v+0.32*l
            out.append({**item,"hybrid_score":round(float(score),4),"vector_score":round(float(v),4),"lexical_hit":bool(l)})
        return sorted(out,key=lambda x:x["hybrid_score"],reverse=True)[:limit]
