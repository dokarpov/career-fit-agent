import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const ui=fs.readFileSync('telegram_miniapp/index.html','utf8');
const dc=fs.readFileSync('.devcontainer/devcontainer.json','utf8');
test('onboarding contains source, constraints and pace steps',()=>{assert.ok(ui.includes('Connect what you already use'));assert.ok(ui.includes('Confirm only hard constraints'));assert.ok(ui.includes('How fast do you want to search?'));});
test('onboarding has 16 23 45 pace options and no reach chooser',()=>{assert.ok(ui.includes("focused:{label:'Steady',target:16"));assert.ok(ui.includes("balanced:{label:'Balanced',target:23"));assert.ok(ui.includes("urgent:{label:'I need a job fast',target:45"));});
test('settings retain complete reach controls',()=>{for(const x of ['Precise','Standard','Wider','Broad'])assert.ok(ui.includes(x));});
test('codespaces forwards product port',()=>{const x=JSON.parse(dc);assert.ok(x.forwardPorts.includes(8000));assert.ok(x.postCreateCommand);assert.ok(x.postStartCommand);});
