import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const fixture={
  onboarding:{completed:true},
  capabilities:{payment_required:false},
  autopilot:{connectors:{google:false,github:false},search_profiles:[]},
  funnel:{
    quotas:{P01:6,P2:10,LOW_COST:7,mode:'baseline',sample:0},
    completed:{P01:0,P2:0,LOW_COST:0},
    target_total:23,
    expected_screenings:{mode:'baseline',low:1,high:2},
    today_batch:[],verify:[],queue:[]
  },
  metrics:{applications:0,signal_rate:null,weekly_applications:0},
  profile:{target:'Principal Product / AI',evidence_health:'demo fixture'},
  conversion_by_tier:{},
  timeline:[],
  jobs:[]
};

const viewports=[
  {name:'mobile-320',width:320,height:700},
  {name:'mobile-390',width:390,height:844},
  {name:'tablet',width:768,height:1024},
  {name:'desktop',width:1440,height:1000}
];

const browser=await chromium.launch({headless:true});
for(const vp of viewports){
  const context=await browser.newContext({viewport:{width:vp.width,height:vp.height}});
  const page=await context.newPage();
  const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
  await page.route('https://telegram.org/**',route=>route.abort());
  await page.route('**/me/bootstrap',route=>route.fulfill({
    status:200,
    contentType:'application/json',
    body:JSON.stringify(fixture)
  }));
  await page.goto(base+'/',{waitUntil:'networkidle'});
  await page.waitForTimeout(150);

  const state=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,
    viewport:innerWidth,
    loadingHidden:document.querySelector('#loading')?.classList.contains('hidden'),
    homeHidden:document.querySelector('#home')?.classList.contains('hidden'),
    headline:document.querySelector('#headline')?.textContent.trim(),
    metrics:[...document.querySelectorAll('.metric')].length
  }));

  if(state.scrollWidth>state.viewport+2) throw new Error(vp.name+': horizontal overflow');
  if(!state.loadingHidden || state.homeHidden) throw new Error(vp.name+': app did not render from API fixture');
  if(!state.headline?.includes('Your search')) throw new Error(vp.name+': empty-state headline incorrect');
  if(state.metrics<3) throw new Error(vp.name+': metrics surface missing');
  if(errors.length) throw new Error(vp.name+': '+errors.join(' | '));
  // Frequency-first navigation keeps daily work uncluttered.
  await page.locator('[data-space-tab="explore"]').click();
  if(await page.locator('#home').getAttribute('data-space')!=='explore')throw new Error(vp.name+': Explore does not open');
  await page.locator('[data-space-tab="progress"]').click();
  if(await page.locator('#home').getAttribute('data-space')!=='progress')throw new Error(vp.name+': Progress does not open');
  await page.locator('[data-space-tab="today"]').click();

  // Public website and deep-linked interactive workspace must work without an account.
  await page.goto(base+'/site/',{waitUntil:'domcontentloaded'});
  await page.locator('.hero h1').waitFor();
  const siteWidth=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  if(siteWidth[0]>siteWidth[1]+2)throw new Error(vp.name+': marketing site horizontal overflow '+siteWidth.join('/'));
  await page.locator('[data-stage="prove"]').click();
  if(!await page.locator('#stageContent').textContent().then(t=>t.includes('Relevant')||t.includes('relevant')||t.includes('evidence')))throw new Error(vp.name+': proof stage interaction broken');
  if(!await page.locator('a[href="./workspace.html"]').count())throw new Error(vp.name+': site missing demo link');
  await page.goto(base+'/site/workspace.html?view=explore',{waitUntil:'domcontentloaded'});
  const demoWidth=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  if(demoWidth[0]>demoWidth[1]+2)throw new Error(vp.name+': workspace horizontal overflow '+demoWidth.join('/'));
  await page.waitForFunction(()=>document.querySelector('#crumb')?.textContent==='EXPLORE');
  await page.locator('[data-role="product"]').first().click();
  if(!await page.locator('#roleDialog').evaluate(el=>el.open))throw new Error(vp.name+': role detail did not open');
  await page.locator('[data-pack]').click();
  await page.locator('#approveClaim').check();
  if(!await page.locator('#recruiterNote').textContent().then(t=>t.includes('documented case study')))throw new Error(vp.name+': approved proof not in preview');
  await page.locator('[data-close]').first().click();
  await page.locator('[data-view="setup"]:visible').first().click();
  await page.locator('#remoteOnly').uncheck();
  await page.locator('[data-view="explore"]').click();
  await page.locator('[data-role="hybrid"]').first().click();
  if(await page.locator('#roleDialog .callout').count())throw new Error(vp.name+': remote preference toggle did not update eligibility');
  await page.locator('[data-close]').first().click();
  if(errors.length)throw new Error(vp.name+': site/demo '+errors.join(' | '));
  // The actual Telegram mini-app entry point must retain onboarding-aware navigation.
  await page.goto(base+'/telegram_miniapp/',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#home')&&!document.querySelector('#home').classList.contains('hidden')&&document.querySelector('[data-cf-tab="today"]'));
  await page.locator('[data-cf-tab="explore"]').click();
  if(await page.locator('#home').getAttribute('data-cf-active')!=='explore')throw new Error(vp.name+': Telegram Explore unavailable');
  await page.locator('[data-cf-tab="setup"]').click();
  if(await page.locator('#home').getAttribute('data-cf-active')!=='setup')throw new Error(vp.name+': Telegram Setup unavailable');
  await page.locator('[data-cf-tab="today"]').click();
  if(errors.length)throw new Error(vp.name+': Telegram mini-app '+errors.join(' | '));
  console.log('PASS',vp.name);
  await context.close();
}
await browser.close();
