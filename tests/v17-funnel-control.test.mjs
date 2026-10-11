import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const ui=fs.readFileSync("telegram_miniapp/index.html","utf8");
test("strategy controls include urgent 45 and custom range",()=>{assert.ok(ui.includes("Urgent"));assert.ok(ui.includes("target:45"));assert.ok(ui.includes('id="weeklyTarget"'));assert.ok(ui.includes('max="60"'));});
test("estimated conversion is always visible",()=>{assert.ok(ui.includes("Estimated screening conversion"));assert.ok(ui.includes('id="forecastRate"'));assert.ok(ui.includes('id="strategyForecastRate"'));});
test("breadth controls explain hard constraints",()=>{assert.ok(ui.includes("Precise"));assert.ok(ui.includes("Wider"));assert.ok(ui.includes("Broad"));assert.ok(ui.includes("Hard constraints"));});
