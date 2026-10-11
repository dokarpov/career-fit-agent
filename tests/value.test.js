import test from "node:test";
import assert from "node:assert/strict";
import { estimateApplicationValue } from "../src/value.js";

const prefs={salaryFloorAnnual:120000};

test("reusable proof reduces estimated application effort",()=>{
  const base={role:{constraints:{applicationMinutes:60,roleInterest:80,domainAppetite:80,salaryMin:150000}},preferences:prefs};
  const low=estimateApplicationValue({...base,analysis:{requirements:[1,2,3,4],proofCards:[],reviewQueue:[],gaps:[1,2,3,4]}});
  const high=estimateApplicationValue({...base,analysis:{requirements:[1,2,3,4],proofCards:[1,2,3,4],reviewQueue:[],gaps:[]}});
  assert.ok(high.estimatedMinutes < low.estimatedMinutes);
});

test("value output is not hiring probability",()=>{
  const out=estimateApplicationValue({role:{constraints:{applicationMinutes:30,roleInterest:90,domainAppetite:90,salaryMin:150000}},analysis:{requirements:[1],proofCards:[1],reviewQueue:[],gaps:[]},preferences:prefs});
  assert.match(out.note,/not a hiring probability/i);
});
