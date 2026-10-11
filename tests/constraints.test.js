import test from "node:test";
import assert from "node:assert/strict";
import { evaluateConstraints, finalAction } from "../src/constraints.js";

const prefs = {
  remoteOnly:true,
  allowRelocation:false,
  salaryFloorAnnual:120000,
  minRoleInterest:60,
  minDomainAppetite:55,
  maxApplicationMinutes:60
};

test("non-remote role blocks remote-only search", () => {
  const out = evaluateConstraints({constraints:{remote:false,relocationRequired:false,roleInterest:90,domainAppetite:90,applicationMinutes:20}}, prefs);
  assert.equal(out.state,"BLOCKED");
});

test("unknown salary verifies rather than blocks", () => {
  const out = evaluateConstraints({constraints:{remote:true,relocationRequired:false,salaryMin:null,roleInterest:90,domainAppetite:90,applicationMinutes:20}}, prefs);
  assert.equal(out.state,"VERIFY");
});

test("low interest deprioritizes rather than rejects qualification", () => {
  const out = evaluateConstraints({constraints:{remote:true,relocationRequired:false,salaryMin:150000,roleInterest:40,domainAppetite:90,applicationMinutes:20}}, prefs);
  assert.equal(out.state,"LOW_PRIORITY");
});

test("clear constraints can reach apply action", () => {
  const constraints = evaluateConstraints({constraints:{remote:true,relocationRequired:false,salaryMin:150000,roleInterest:90,domainAppetite:90,applicationMinutes:20}}, prefs);
  const action = finalAction({preflight:{state:"CLEAR"},constraints,fit:{verdict:"PURSUE"}});
  assert.equal(action,"APPLY");
});
