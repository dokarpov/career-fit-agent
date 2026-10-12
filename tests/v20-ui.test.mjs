import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=(p)=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');

test('v2 UI preserves original app entry points and loads its enhancement once',()=>{
 for(const path of ['index.html','telegram_miniapp/index.html']){
  const h=read(path);
  assert.equal(h.split('ux-v2.css').length-1,1);
  assert.equal(h.split('ux-v2.js').length-1,1);
  assert.match(h,/\/me\/bootstrap/);
  assert.match(h,/pack\/proposal\/approve/);
 }
});

test('app enhancement keeps proof approval and canonical pipeline separate',()=>{
 const js=read('telegram_miniapp/ux-v2.js');
 const css=read('telegram_miniapp/ux-v2.css');
 assert.match(js,/originalRender\(data\)/);
 assert.match(js,/originalView\(name\)/);
 assert.match(js,/pipelineMode/);
 assert.match(css,/body\.pipelineMode \.ux-nav/);
 assert.match(css,/\.ux-nav\[hidden\]/);
});

test('website is readable without JavaScript and discloses illustrative data',()=>{
 const html=read('site/index.html');
 const js=read('site/demo.js');
 assert.match(html,/<h1[^>]*>Stop applying/);
 assert.match(html,/application\/ld\+json/);
 assert.match(html,/WORKING PROTOTYPE/);
 assert.match(html,/illustrative/i);
 assert.match(html,/role="tablist"/);
 assert.match(js,/samples =/);
 assert.match(js,/role-level approval/i);
 for(const path of ['site/styles.css','site/favicon.svg','site/llms.txt'])assert.ok(read(path).length>50);
});
