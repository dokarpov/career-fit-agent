import fs from "node:fs";
import { analyzeVacancy } from "../src/pipeline.js";

const vault = JSON.parse(fs.readFileSync(new URL("../sample/evidence-vault.json", import.meta.url)));
const cases = JSON.parse(fs.readFileSync(new URL("./cases.json", import.meta.url)));

let pass = 0;
const rows = [];

for (const c of cases) {
  const result = analyzeVacancy(c.vacancy, vault);
  const req = result.requirements.find(r => r.label === c.expected.requirement);
  const match = req ? result.matches.find(m => m.requirementId === req.id) : null;

  const routeOk = (match?.route || "missing") === c.expected.route;
  // Decision is informative; route is the stricter policy check in this tiny batch.
  const ok = Boolean(req) && routeOk;
  if (ok) pass++;

  rows.push({
    id:c.id,
    name:c.name,
    requirementFound:Boolean(req),
    actualRoute:match?.route || "missing",
    expectedRoute:c.expected.route,
    actualDecision:result.decision.verdict,
    expectedDecision:c.expected.decision,
    pass:ok
  });
}

console.table(rows);
console.log(`\n${pass}/${cases.length} routing evals passed`);
if (pass !== cases.length) process.exitCode = 1;
