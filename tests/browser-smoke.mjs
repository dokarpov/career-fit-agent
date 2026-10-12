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

  // Public RoleHint Pages is static. A live backend is not available on github.io,
  // so the root entry must route into the self-contained workbench instead of showing an API error.
  const rootHtml=await (await fetch(base+'/')).text();
  if(!rootHtml.includes("location.hostname.endsWith('.github.io')")||!rootHtml.includes("./site/workspace.html"))throw new Error(vp.name+': static Pages startup fallback missing');

  // Editorial site: meaningful animation, keyboard-safe controls, no horizontal scrolling.
  await page.goto(base+'/site/',{waitUntil:'domcontentloaded'});
  await page.locator('.hero h1').waitFor();
  await page.waitForFunction(()=>document.querySelector('#signalField')?.width>0);
  const siteWidth=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  if(siteWidth[0]>siteWidth[1]+2)throw new Error(vp.name+': marketing site horizontal overflow '+siteWidth.join('/'));
  const ticker=await page.locator('.rh-ticker-track').evaluate(e=>getComputedStyle(e).animationName);
  if(ticker==='none')throw new Error(vp.name+': motion layer not loaded');
  await page.locator('[data-stage="prove"]').click();
  if(!await page.locator('#stageContent').textContent().then(t=>t.includes('A good match')&&t.includes('substantiate')))throw new Error(vp.name+': proof stage interaction broken');
  if(!await page.locator('a[href="./workspace.html"]').count())throw new Error(vp.name+': missing workspace link');

  // One cohesive master-detail workbench with end-to-end human-reviewed actions.
  await page.goto(base+'/site/workspace.html',{waitUntil:'domcontentloaded'});
  await page.locator('[data-role="atlas"]').waitFor();
  const demoWidth=await page.evaluate(()=>[document.documentElement.scrollWidth,innerWidth]);
  if(demoWidth[0]>demoWidth[1]+2)throw new Error(vp.name+': workbench horizontal overflow '+demoWidth.join('/'));
  await page.locator('[data-role="atlas"]').click();
  await page.locator('#roleTitle').waitFor();
  if(!await page.locator('#roleTitle').textContent().then(t=>t.includes('Senior Product Manager')))throw new Error(vp.name+': role inspector not connected to selection');
  if(!await page.locator('.evidence-item').count())throw new Error(vp.name+': no evidence provenance');
  await page.locator('#approveClaim').check();
  await page.locator('[data-action="prepare"]').click();
  if(!await page.locator('.draft').textContent().then(t=>t.includes('documented project work')))throw new Error(vp.name+': review to draft interaction broken');
  await page.locator('[data-action="save"]').click();
  if(await page.locator('#savedCount').textContent()!=='1')throw new Error(vp.name+': save decision did not update queue');
  if(vp.width<=760)await page.locator('#backToList').click();
  await page.locator('[data-filter="all"]').click();
  await page.locator('[data-role="orbit"]').click();
  if(!await page.locator('.eligibility-band.is-blocked').count())throw new Error(vp.name+': hard constraint not enforced');
  await page.locator('[data-modal="settings"]').click();
  await page.locator('#remoteOnly').uncheck();
  await page.locator('#preferencesDialog [data-close-dialog]').first().click();
  if(await page.locator('.eligibility-band.is-blocked').count())throw new Error(vp.name+': remote preference did not update the blocker');
  await page.locator('[data-modal="results"]').click();
  if(!await page.locator('#resultsDialog').evaluate(d=>d.open))throw new Error(vp.name+': results drawer does not open');
  await page.locator('#resultsDialog [data-close-dialog]').first().click();
  if(errors.length)throw new Error(vp.name+': public experience '+errors.join(' | '));
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
