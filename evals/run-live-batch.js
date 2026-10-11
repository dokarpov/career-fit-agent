import fs from "node:fs";
import { analyzeRole } from "../src/live-batch.js";

const vault = JSON.parse(fs.readFileSync(new URL("../sample/evidence-vault.json", import.meta.url)));
const roles = JSON.parse(fs.readFileSync(new URL("../sample/live-batch-2026-10-02.json", import.meta.url)));
const expectations = JSON.parse(fs.readFileSync(new URL("./live-batch-expectations.json", import.meta.url)));
const prefs = JSON.parse(fs.readFileSync(new URL("../sample/candidate-preferences.json", import.meta.url)));

let pass = 0;
const rows = roles.map(role => {
  const out = analyzeRole(role, vault, prefs);
  const exp = expectations.find(x=>x.roleId===role.id);
  const ok = out.preflight.state === exp.expectedPreflight;
  if (ok) pass++;
  return {
    company:role.company,
    role:role.role,
    preflight:out.preflight.state,
    expected:exp.expectedPreflight,
    fit:out.fit.verdict,
    action:out.finalAction,
    verified:out.proofCards.length,
    review:out.reviewQueue.length,
    gaps:out.gaps.length,
    pass:ok
  };
});
console.table(rows);
console.log(`\n${pass}/${roles.length} live preflight checks passed`);
if (pass !== roles.length) process.exitCode = 1;
