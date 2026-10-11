from __future__ import annotations
from typing import Literal, Optional
from pydantic import BaseModel, Field

Visibility = Literal["public", "public-safe", "interview-safe", "private"]
EvidenceStatus = Literal["verified", "needs-review", "missing"]

class EvidenceObject(BaseModel):
    id: str
    source_type: str
    source_ref: str
    title: str
    claim: str
    evidence: str
    tags: list[str] = []
    status: EvidenceStatus = "needs-review"
    direct: bool = False
    visibility: Visibility = "private"
    ownership: Optional[str] = None
    metric: Optional[str] = None
    boundary: Optional[str] = None

class JobPosting(BaseModel):
    id: str
    source: str
    source_url: str
    company: str
    title: str
    location: Optional[str] = None
    remote: Optional[bool] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    description: str = ""
    posted_at: Optional[str] = None
    source_job_id: Optional[str] = None
    occupation_uri: Optional[str] = None
    canonical_key: Optional[str] = None

class SearchQuery(BaseModel):
    query: str
    countries: list[str] = []
    remote_only: bool = False
    sources: list[str] = []

class EvidenceGap(BaseModel):
    requirement: str
    state: Literal["search_more", "ask_user", "build_proof", "accept_gap", "skip_role"]
    reason: str

class AnalysisRequest(BaseModel):
    job: JobPosting
    evidence_ids: list[str] = []
