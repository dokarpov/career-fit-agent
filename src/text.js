export function normalize(text = "") {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+.#\- ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOP = new Set([
  "the","and","for","with","you","your","our","are","from","that","this","will","have","has",
  "into","across","who","what","when","where","how","role","product","team","work","working",
  "experience","strong","build","building","ability","skills","skill","using","use","used",
  "senior","manager","lead","responsible","requirements","required","preferred"
]);

export function tokens(text = "") {
  return normalize(text)
    .split(" ")
    .filter(x => x.length > 2 && !STOP.has(x));
}

export function unique(arr) {
  return [...new Set(arr)];
}

export function overlapScore(a, b) {
  const aa = new Set(tokens(a));
  const bb = new Set(tokens(b));
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const t of aa) if (bb.has(t)) intersection++;
  return intersection / Math.max(aa.size, 1);
}
