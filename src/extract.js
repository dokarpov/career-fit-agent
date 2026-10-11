import { normalize, unique } from "./text.js";

const PATTERNS = [
  ["agentic workflows", ["agentic","agents","multi-agent","agent workflows","orchestration"]],
  ["human-in-the-loop", ["human-in-the-loop","human review","approval","fallback","escalation"]],
  ["evaluation", ["evaluation","evals","quality","rubric","benchmark","test cases"]],
  ["tool calling", ["tools","tool calling","function calling","mcp"]],
  ["schemas", ["schema","structured output","json schema","typed output"]],
  ["retrieval", ["retrieval","rag","grounding","context retrieval","knowledge base"]],
  ["product strategy", ["product strategy","roadmap","prioritization","0→1","0-1"]],
  ["experimentation", ["experimentation","a/b","ab test","experiments","hypothesis"]],
  ["stakeholder management", ["stakeholder","cross-functional","cross functional"]],
  ["analytics", ["analytics","metrics","funnel","conversion","retention"]]
];

export function extractRequirements(text) {
  const n = normalize(text);
  const found = [];
  let i = 1;

  for (const [label, variants] of PATTERNS) {
    if (variants.some(v => n.includes(normalize(v)))) {
      found.push({
        id: `r${i++}`,
        label,
        source: variants.find(v => n.includes(normalize(v))) || label,
        mustHave: true,
        extractor: "deterministic-pattern-v0.2"
      });
    }
  }

  // Pull bullet-like sentences as optional requirements when no named pattern catches them.
  const rawLines = String(text).split(/\n|•|\-/).map(x=>x.trim()).filter(Boolean);
  for (const line of rawLines) {
    const lower = line.toLowerCase();
    const looksLikeReq = /(experience|ability|knowledge|familiar|must|should|responsib|you will|you'll)/.test(lower);
    if (!looksLikeReq) continue;
    const short = line.replace(/^\W+/, "").slice(0, 110);
    if (!short || found.some(x => normalize(short).includes(normalize(x.label)))) continue;
    found.push({
      id:`r${i++}`,
      label:short,
      source:line,
      mustHave:/must|required|responsib/.test(lower),
      extractor:"line-heuristic-v0.2"
    });
    if (found.length >= 12) break;
  }

  return found;
}
