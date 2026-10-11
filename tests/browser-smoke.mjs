import { chromium } from 'playwright';

const base=process.env.BASE_URL||'http://127.0.0.1:4173';
const fixture={
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
  if(!state.headline?.includes('searching')) throw new Error(vp.name+': empty-state headline incorrect');
  if(state.metrics<3) throw new Error(vp.name+': metrics surface missing');
  if(errors.length) throw new Error(vp.name+': '+errors.join(' | '));
  console.log('PASS',vp.name);
  await context.close();
}
await browser.close();
