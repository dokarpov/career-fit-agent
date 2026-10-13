import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8787','--directory','site'],{stdio:'ignore'});
const browser=await chromium.launch({headless:true});
let fails=0;
try {
 await delay(900);
 for(const width of [320,375,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:820},deviceScaleFactor:1});
  await page.goto('http://127.0.0.1:8787/',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('.rh-preview-role');
  const entry=page.locator('.hero-actions a[href="./workspace.html"]');
  if(await entry.count()!==1){console.error('FAIL workspace entry',width);fails++}
  if(await page.locator('a[href="./install.html"]').count()<1){console.error('FAIL install instructions entry',width);fails++}
  const manifest=await page.request.get('http://127.0.0.1:8787/manifest.webmanifest');
  if(!manifest.ok()||(await manifest.json()).start_url!=='./workspace.html'){console.error('FAIL installed-app start URL',width);fails++}
  const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
  if(overflow.scroll>overflow.viewport+2){console.error('FAIL horizontal overflow',width,overflow);fails++}
  for(const i of [0,1,2]){
   await page.locator('[data-role="'+i+'"]').click();
   const title=await page.locator('#rhPreviewTitle').textContent();
   const expected=['Senior Product Manager','Product Lead','Principal Product Manager'][i];
   if(title!==expected){console.error('FAIL role button',width,i,title);fails++}
  }
  const form=page.locator('#interestForm');
  if(await form.getAttribute('method')!=='POST'||!(await form.getAttribute('action')).includes('formsubmit.co/')){console.error('FAIL form wiring',width);fails++}
  if(await page.locator('a[href="#apply"]').count()<1){console.error('FAIL CTA',width);fails++}
  await page.goto('http://127.0.0.1:8787/privacy.html');
  const legalOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  if(legalOverflow>2){console.error('FAIL privacy overflow',width,legalOverflow);fails++}
  console.log('checked',width+'px');
  await page.close();
 }
}finally{await browser.close();server.kill()}
if(fails){console.error(fails+' release checks failed');process.exit(1)}
console.log('PASS: release layout + behavior checks');
