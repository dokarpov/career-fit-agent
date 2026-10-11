import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ui=fs.readFileSync('telegram_miniapp/index.html','utf8');
const bot=fs.readFileSync('telegram_bot/bot.py','utf8');

test('primary UI does not ask user to find or paste a vacancy link',()=>{
  assert.equal(ui.includes('jobUrl'),false);
  assert.equal(ui.includes('Check any vacancy'),false);
  assert.equal(ui.includes('Analyse link'),false);
});
test('bot owns discovery and has no check-url command',()=>{
  assert.equal(bot.includes('"command":"check"'),false);
  assert.equal(bot.includes('Send me any vacancy link'),false);
  assert.equal(bot.includes("I search, deduplicate and match them automatically"),true);
});
test('pack does not ask for evidence IDs or manual verification toggles',()=>{
  assert.equal(ui.includes('placeholder="Evidence ID"'),false);
  assert.equal(ui.includes('Verified for outward use'),false);
  assert.equal(ui.includes('Add proof card'),false);
});
test('UI exposes weekly funnel and original vacancy links',()=>{
  assert.equal(ui.includes('Weekly funnel'),true);
  assert.equal(ui.includes('Open original vacancy'),true);
  assert.equal(ui.includes('Today’s batch'),true);
});
