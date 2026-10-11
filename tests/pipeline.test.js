import test from "node:test";
import assert from "node:assert/strict";
import { extractRequirements } from "../src/extract.js";
import { classifyMatch } from "../src/matching.js";
import { analyzeVacancy } from "../src/pipeline.js";

const vault = [
  {
    id:"e1", title:"Agent workflow", claim:"Agentic workflow orchestration",
    evidence:"Working routed system", status:"verified", direct:true,
    tags:["agentic workflows","orchestration"]
  },
  {
    id:"e2", title:"RAG note", claim:"Retrieval", evidence:"Unverified note",
    status:"needs-review", direct:false, tags:["retrieval","rag"]
  }
];

test("extracts named requirement", () => {
  const out = extractRequirements("Need agentic workflow design and human-in-the-loop approval.");
  assert.ok(out.some(x=>x.label==="agentic workflows"));
  assert.ok(out.some(x=>x.label==="human-in-the-loop"));
});

test("unverified evidence never becomes verified", () => {
  const m = classifyMatch({id:"r1",label:"retrieval"}, {...vault[1], retrievalScore:.8});
  assert.equal(m.status,"needs_review");
});

test("missing evidence becomes a gap", () => {
  const out = analyzeVacancy("Tool calling and MCP experience is required.", vault);
  assert.ok(out.gaps.length >= 1);
});

test("verified evidence can enter proof cards", () => {
  const out = analyzeVacancy("Agentic workflows are required.", vault);
  assert.ok(out.proofCards.length >= 1);
});

test("review evidence does not enter proof cards", () => {
  const out = analyzeVacancy("Retrieval / RAG experience is required.", vault);
  assert.equal(out.proofCards.length,0);
  assert.ok(out.reviewQueue.length >= 1);
});
