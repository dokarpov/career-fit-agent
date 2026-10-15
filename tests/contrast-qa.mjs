import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

// Visual-contract tests with mocked onboarding data. Not a functional E2E test.
const srv=spawn('python3',['-m','http.server','8791'],{stdio:'ignore'});
const browser=await chromium.launch({headless:true});
let failures=0;
async function verify(page,label){
 const items=await page.evaluate(()=>{
  function rgb(s){const m=s.match(/^rgba?\(([^)]+)\)/);if(!m)return null;const x=m[1].split(/[,\s/]+/).filter(Boolean).map(Number);return x.length>=3?[x[0],x[1],x[2],Number.isFinite(x[3])?x[3]:1]:null}
  function overlay(f,b){return f.slice(0,3).map((v,i)=>v*f[3]+b[i]*(1-f[3]))}
  function luminance(c){const v=c.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return .2126*v[0]+.7152*v[1]+.0722*v[2]}
  function background(el){let color=[255,255,255];const chain=[];for(let p=el;p;p=p.parentElement)chain.push(p);for(const p of chain.reverse()){const c=rgb(getComputedStyle(p).backgroundColor);if(c)color=overlay(c,color)}return color}
  const targets=[...document.querySelectorAll('button,a,h1,h2,h3,p,label,.title,.meta,.sub,.eyebrow')];
  return targets.filter(e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&s.opacity!=='0'&&e.textContent.trim().length>0}).map(e=>{const s=getComputedStyle(e),fg=rgb(s.color),bg=background(e);if(!fg)return null;const l1=luminance(fg),l2=luminance(bg);const contrast=(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);return {name:e.tagName.toLowerCase()+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''),text:e.textContent.trim().slice(0,42),contrast:Number(contrast.toFixed(2))}}).filter(Boolean).filter(x=>x.contrast<4.5)
 });
 if(items.length){failures+=items.length;console.error('FAIL contrast',label,items.slice(0,30))}else console.log('PASS contrast',label);
}
try {
 await delay(1100);
 for(const width of [375,768,1440]){
  const page=await browser.newPage({viewport:{width,height:850}});
  for(const path of ['site/','site/pricing.html','site/subscription.html']){
   await page.goto('http://127.0.0.1:8791/'+path,{waitUntil:'domcontentloaded'});
   await verify(page,path+' '+width);
  }
  await page.close();
 }
 for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width:390,height:844}});
  await page.addInitScript(mode=>{
   window.Telegram={WebApp:{initData:'fixture',initDataUnsafe:{user:{first_name:'Test'}},ready(){},expand(){},setBackgroundColor(){},setHeaderColor(){},setBottomBarColor(){},BackButton:{hide(){},show(){}},MainButton:{hide(){},show(){},setParams(){}},HapticFeedback:{impactOccurred(){}},themeParams:mode==='dark'?{bg_color:'#111111',text_color:'#111111'}:{}}};
  },theme);
  await page.route('**/me/bootstrap',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({onboarding:{completed:false},autopilot:{connectors:{}},capabilities:{oauth_google_ready:false,oauth_github_ready:false},preferences:{},funnel:{policy:{pace_preset:'balanced'}}})}));
  await page.goto('http://127.0.0.1:8791/telegram_miniapp/',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(250);
  await verify(page,'Telegram onboarding '+theme);
  await page.close();
 }
}finally{await browser.close();srv.kill()}
if(failures){console.error(failures+' contrast violations');process.exit(1)}
console.log('Contrast check passed: visible text >=4.5:1 in tested screens and viewports.');
