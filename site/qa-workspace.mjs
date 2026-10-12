import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const server=spawn('python3',['-m','http.server','8788','--directory','site'],{stdio:'ignore'});
let failures=0;const browser=await chromium.launch({headless:true});
try{
 await delay(1000);
 for(const width of [320,375,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8788/workspace.html',{waitUntil:'domcontentloaded'});
  await page.waitForSelector('#obSkip:visible');
  const firstOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(firstOverflow>2){console.error('onboarding horizontal overflow',width,firstOverflow);failures++}
  await page.locator('#obPasteToggle').click();
  await page.locator('#obPaste').fill('Product strategy and customer research. Led product discovery, facilitated interviews, documented delivery plans and coordinated product research.');
  await page.locator('#obPasteNext').click();
  if(!(await page.locator('#obSecond').isVisible())){console.error('evidence review not shown',width);failures++}
  await page.locator('#obConfirm').click();
  if(!(await page.locator('#obThird').isVisible())){console.error('preferences not shown',width);failures++}
  await page.locator('#obFinish').click();
  if(!(await page.locator('#obFinalStatus').textContent()).includes('target role')){console.error('missing role validation',width);failures++}
  await page.locator('#obRole').fill('Senior Product Manager');
  await page.locator('#obFinish').click();
  if(!(await page.locator('#obFinalStatus').textContent()).includes('country')){console.error('missing country validation',width);failures++}
  await page.locator('#obCountry').fill('Spain');
  await page.locator('#obFinish').click();
  if(!(await page.locator('#rhFirstGuideMissing').count()) && !(await page.locator('.rh-first-guide').isVisible())){console.error('first decision guide missing',width);failures++}
  await page.locator('#rhGuideStart').click();
  if(!(await page.locator('#roleTitle').isVisible())){console.error('role inspector not visible',width);failures++}
  if(!(await page.locator('#personalBanner').textContent()).includes('Senior Product Manager')){console.error('profile summary not refreshed',width);failures++}
  const over=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  if(over>2){console.error('workspace horizontal overflow',width,over);failures++}
  if(errors.length){console.error('JS errors',width,errors);failures+=errors.length}
  await page.close();
 }
 // Confirm explicit sample bypass is present on fresh profile.
 const page=await browser.newPage({viewport:{width:375,height:780}});
 await page.goto('http://127.0.0.1:8788/workspace.html');
 await page.locator('#obSkip').click();
 if(!(await page.locator('.rh-first-guide').isVisible())){console.error('skip route not guided');failures++}
 await page.close();
}finally{await browser.close();server.kill()}
if(failures){console.error(failures+' failures');process.exit(1)}
console.log('Onboarding and guided first-decision checks passed');
