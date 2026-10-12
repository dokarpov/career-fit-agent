/* RoleHint browser preflight. Transparent deterministic checks, not a server AI.
   Everything remains in memory; no API calls, cookies, telemetry, or automatic applications. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const samples={
 product:{role:'Product Manager',company:'Northstar Studio',description:'Senior Product Manager — Northstar Studio (fictional employer)\nRemote role based in Europe. Full-time. Salary €90,000–€110,000 per year.\nRequirements:\n• Lead product discovery and customer interviews to identify unmet needs.\n• Define and communicate a product strategy and roadmap.\n• Collaborate with engineering and design teams to ship improvements.\n• Own commercial metrics and revenue targets.\n• Experience in B2B SaaS environments is preferred.'},
 design:{role:'Product Designer',company:'Mosaic Labs',description:'Senior Product Designer — Mosaic Labs (fictional employer)\nRemote from anywhere. Full-time. Salary €80,000–€100,000 annually.\nRequirements:\n• Lead user research, customer interviews and usability studies.\n• Build interactive prototypes and validate product concepts.\n• Improve and maintain a shared design system.\n• Demonstrate the measurable outcomes of design changes.\n• Partner with product managers and engineering.'},
 engineering:{role:'Software Engineer',company:'Relay Systems',description:'Software Engineer — Relay Systems (fictional employer)\nHybrid in Berlin; office attendance required three days per week. Salary €95,000–€105,000 per year.\nRequirements:\n• Build and maintain production applications.\n• Collaborate through code review and technical planning.\n• Participate in system architecture decisions.\n• Improve automated testing, monitoring and reliability.'},
 marketing:{role:'Marketing Lead',company:'Orbit Works',description:'Marketing Lead — Orbit Works (fictional employer)\nRemote position; hiring countries not specified. Compensation not disclosed.\nRequirements:\n• Plan and deliver multichannel marketing campaigns.\n• Analyze channel performance and campaign results.\n• Manage external partners and internal stakeholders.\n• Take responsibility for marketing budgets and reporting.'}
};
const state={sample:false,role:'',description:'',sourceUrl:'',region:'eu',workMode:'remote',minSalary:0,checks:[],requirements:[],selected:new Set(),notes:'',decision:null};
const screens=['stepRole','stepEligibility','stepFit','stepDecision'];
const common=new Set(('the and with from this that have been will able should must into their your for work years experience role team you are our who has using in of to on at by or an as is a lead build developing developed products tools projects software data design product').split(' '));
const words=t=>(String(t).toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g)||[]).filter(x=>!common.has(x));
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600)}
function showStep(n){
 screens.forEach((id,i)=>$(id).hidden=(i!==n));
 document.querySelectorAll('[data-progress]').forEach((el,i)=>{el.classList.toggle('is-current',i===n);el.classList.toggle('is-done',i<n);i===n?el.setAttribute('aria-current','step'):el.removeAttribute('aria-current')});
 window.scrollTo({top:0,behavior:'instant'});
 let h=$(screens[n]).querySelector('h2');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
}
function checkInput(){
 const title=$('targetRole').value.trim(),description=$('jobDescription').value.trim();
 $('goEligibility').disabled=title.length<2||description.length<80;
 $('jobInputHelp').textContent=description.length>0&&description.length<80?
 'Add more of the original description (at least 80 characters), or load a sample.':
 'No upload or live scraping. The browser checks only the text you provide.';
}
function selectRole(name){
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===name)));
 const s=samples[name];if(s){$('targetRole').value=s.role;if(state.sample)loadSample(name,false)}
 checkInput();
}
function loadSample(name,announce=true){
 const s=samples[name]||samples.product;
 $('jobDescription').value=s.description;
 $('jobUrl').value='';
 state.sample=true;
 if(!$('targetRole').value.trim()){$('targetRole').value=s.role}
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===name)));
 checkInput();if(announce)toast('Fictional example loaded — edit any field');
}
function capture(){
 state.role=$('targetRole').value.trim();
 state.description=$('jobDescription').value.trim();
 state.sourceUrl=$('jobUrl').value.trim();
 state.region=$('targetRegion').value;
 state.workMode=document.querySelector('input[name="workMode"]:checked')?.value||'remote';
 state.minSalary=Math.max(0,Math.min(500000,Number($('minSalary').value)||0));
 state.selected.clear();state.notes='';
}
/* Detect explicit terms. We do not infer work authorization, company legitimacy, or
   the absence of an obligation from a missing keyword. */
function excerpt(text,re){let m=re.exec(text);if(!m)return null;let idx=m.index;let left=Math.max(text.lastIndexOf('\n',idx)+1,text.lastIndexOf('.',idx-1)+1);let right=Math.min(text.length,idx+195);let end=text.indexOf('\n',idx);if(end>=0)right=Math.min(right,end);return text.slice(left,right).trim().replace(/^[-•*]\s*/,'').slice(0,185)}
function checkSetup(text){
 const onSite=excerpt(text,/\b(hybrid|on[- ]site|onsite|office attendance|in[- ]office|days (?:a|per) week (?:in|at) (?:the )?office)\b/i);
 const remote=excerpt(text,/\b(remote|work from anywhere|fully distributed)\b/i);
 if(state.workMode==='remote'&&onSite)return {label:'Work setup',kind:'block',detail:'Office attendance is mentioned: “'+onSite+'”'};
 if(onSite)return {label:'Work setup',kind:'pass',detail:'Office attendance is mentioned: “'+onSite+'”'};
 if(remote)return {label:'Work setup',kind:'pass',detail:'Remote work is mentioned: “'+remote+'”'};
 return {label:'Work setup',kind:'ask',detail:'Work arrangement not found. Confirm remote/hybrid/on-site expectations.'};
}
function checkRegion(text){
 const regionLine=excerpt(text,/\b(Europe(?:an)?|EU|EMEA|worldwide|anywhere|global|United States|USA|U\.S\.|US[- ]only|UK[- ]only|based in (?:the )?(?:UK|US|United Kingdom))\b/i);
 const usOnly=/\b(US[- ]only|United States only|U\.S\. only|only (?:in|from) (?:the )?(?:USA|United States))\b/i.test(text);
 const ukOnly=/\b(UK[- ]only|United Kingdom only)\b/i.test(text);
 if(state.region==='eu'&&(usOnly||ukOnly))return {label:'Hiring geography',kind:'block',detail:'Potential restriction for Europe: “'+(regionLine||'Country-restricted hiring')+'”'};
 if(regionLine)return {label:'Hiring geography',kind:'ask',detail:'Location is mentioned: “'+regionLine+'”. Verify your country and work authorization.'};
 return {label:'Hiring geography',kind:'ask',detail:'Eligible hiring countries not found. Ask the employer before applying.'};
}
function salaryInfo(text){
 const line=excerpt(text,/(?:salary|compensation|pay range|pay|annual|annually|per year|€|\bEUR\b|\bUSD\b|\$)/i);
 if(!line)return null;
 let currency=/€|\bEUR\b/i.test(line)?'EUR':/\$|\bUSD\b/i.test(line)?'USD':null;
 if(!currency)return {line,currency:null};
 const r=currency==='EUR'?/(?:€\s*|\bEUR\s*)(\d[\d,]*(?:\.\d+)?)(\s*[kK])?/g:/(?:\$\s*|\bUSD\s*)(\d[\d,]*(?:\.\d+)?)(\s*[kK])?/g;
 let vals=[...line.matchAll(r)].map(m=>{let v=Number(m[1].replace(/,/g,''));return m[2]?v*1000:v}).filter(v=>v>=1000&&v<2000000);
 // Also support €90,000–110,000 and €90k–110k where currency occurs once.
 const range=line.match(/(?:€|\bEUR\b|\$|\bUSD\b)\s*(\d[\d,.]*\s*k?)\s*(?:-|–|to)\s*(\d[\d,.]*\s*k?)/i);
 if(range){
 const parse=x=>{const k=/k/i.test(x);const n=Number(x.replace(/[,\sk]/gi,''));return k?n*1000:n};
 vals=[parse(range[1]),parse(range[2])].filter(v=>v>=1000&&v<2000000);
 }
 return {line,currency,low:Math.min(...vals),high:Math.max(...vals),valid:vals.length>0};
}
function checkSalary(text){
 const inf=salaryInfo(text),min=state.minSalary;
 if(!inf||!inf.currency||!inf.valid||!Number.isFinite(inf.high))return {label:'Compensation',kind:min?'ask':'pass',detail:'Comparable annual salary not identified'+(min?'; check it against your €'+min.toLocaleString('en-US')+' minimum.':'.')};
 const note='Stated amount: “'+inf.line+'”';
 if(inf.currency!=='EUR')return {label:'Compensation',kind:'ask',detail:note+'. Different currency; no conversion or salary comparison is made.'};
 if(/\b(month|hour|hourly|daily|per day)\b/i.test(inf.line))return {label:'Compensation',kind:'ask',detail:note+'. Pay frequency needs clarification before comparing.'};
 if(!/\b(annual|annually|per year|\/year|\/yr|a year|yearly)\b/i.test(inf.line))return {label:'Compensation',kind:'ask',detail:note+'. The pay period is not explicit. Confirm annual compensation before comparing.'};
 if(min&&inf.high<min)return {label:'Compensation',kind:'block',detail:note+'. Listed maximum is below your €'+min.toLocaleString('en-US')+' annual minimum.'};
 if(min&&inf.low<min)return {label:'Compensation',kind:'ask',detail:note+'. Only part of the range meets your €'+min.toLocaleString('en-US')+' minimum.'};
 return {label:'Compensation',kind:'pass',detail:note+(min?'. Looks above your minimum, subject to employer confirmation.':'. Not verified with the employer.')};
}
function extractRequirements(text){
 const lines=text.split(/\n|(?<=\.)\s+(?=[A-Z])/).map(v=>v.trim().replace(/^[-*•\s]+/,'').replace(/^(requirements?|responsibilities|qualifications?|what you(?:'|’)ll do|we(?:'|’)re looking for):?\s*/i,'')).filter(x=>x.length>=26&&x.length<=350);
 const candidate=lines.filter(x=>
 !/(?:€|\$|\bEUR\b|\bUSD\b|salary|compensation|pay range|remote|hybrid|on-site|onsite|worldwide|based in|hiring countr|annual|per year)/i.test(x) &&
 /\b(experience|skills?|manage|lead|collaborate|deliver|build|design|knowledge|proficiency|responsibilities|develop|strategy|research|implement|testing|customer|project|support|architecture|analyze|analyse|metric|ownership|growth|marketing|communication|degree|required|years?|retention|maintain|roadmap|prototypes|onboarding)\b/i.test(x) &&
 x.toLowerCase()!==state.role.toLowerCase()
);
 const result=[];for(const x of candidate){let clean=x.replace(/\s+/g,' ').slice(0,180);if(!result.some(y=>y.toLowerCase()===clean.toLowerCase()))result.push(clean);if(result.length>=6)break}
 if(!result.length){
 for(const x of lines){if(!/salary|compensation|remote|location|hiring|employer|company|per year|annual|€|\$/i.test(x)&&x.toLowerCase()!==state.role.toLowerCase()){result.push(x.slice(0,180));if(result.length>=4)break}}
 }
 return result;
}
function analyze(){
 state.checks=[checkSetup(state.description),checkRegion(state.description),checkSalary(state.description)];
 state.requirements=extractRequirements(state.description);
}
function showEligibility(){
 const original=state.description.split('\n').map(x=>x.trim()).find(Boolean)||state.role;
 $('sourceType').textContent=state.sample?'FICTIONAL SAMPLE · EDITABLE':'FROM YOUR PASTED JOB DESCRIPTION';
 $('sampleTitle').textContent=state.role;
 $('sampleCompany').textContent=(state.sample?'Example only':original.slice(0,140))+' · Source not verified';
 $('eligibilityChecks').innerHTML=state.checks.map(c=>'<div class="check-row"><span class="check-symbol '+c.kind+'" aria-hidden="true">'+(c.kind==='block'?'×':c.kind==='ask'?'?':'✓')+'</span><div><strong>'+escape(c.label)+'</strong><p>'+escape(c.detail)+'</p></div></div>').join('');
 const blocked=state.checks.some(c=>c.kind==='block'),ask=state.checks.some(c=>c.kind==='ask');
 const title=blocked?'Potential mismatch':ask?'Details worth checking':'No obvious blockers found';
 $('eligibilityVerdict').className='verdict '+(blocked?'block':ask?'ask':'pass');
 $('eligibilityVerdict').innerHTML='<strong>'+title+'</strong><p>Based on this text only. We have not verified the employer, vacancy, or your legal eligibility.</p>';
}
function showFit(){
 const req=state.requirements;
 $('skillOptions').innerHTML=req.length?req.map((line,i)=>
 '<label class="skill-check"><input type="checkbox" data-skill="'+i+'" '+(state.selected.has(i)?'checked':'')+'><span>'+escape(line)+'</span></label>').join(''):
 '<p>No clear requirements were detected. Add responsibilities or qualifications to the job description, then retry.</p>';
 $('experienceNotes').value=state.notes;
 updateFit();
}
function updateFit(){
 const selected=state.selected.size;
 $('fitFeedback').textContent=selected?selected+' of '+state.requirements.length+' requirement'+(state.requirements.length===1?'':'s')+' marked as matching your experience. This is your self-assessment, not verified by RoleHint.':'Nothing selected yet. Choose the requirements you can substantiate; unselected areas remain unknown.';
}
function makeDecision(){
 state.notes=$('experienceNotes').value.trim().slice(0,1800);
 const blocks=state.checks.filter(c=>c.kind==='block'),asks=state.checks.filter(c=>c.kind==='ask');
 let kind='review',title='Potentially worth pursuing',detail='No obvious hard blockers found in the pasted text. Check the official posting and prepare concrete examples.';
 if(blocks.length){kind='block';title='Likely worth skipping';detail='At least one stated condition conflicts with your preferences. Review it before spending more effort.'}
 else if(asks.length){kind='ask';title='Verify before applying';detail='The posting leaves important details unclear. Resolve them before investing time in an application.'}
 else if(!state.selected.size){kind='ask';title='Check your fit first';detail='You have not marked any requirements you can demonstrate. Add real examples before applying.'}
 state.decision={kind,title,detail};
 $('decisionResult').className='decision-result '+kind;
 $('decisionResult').innerHTML='<span class="decision-tag">'+(kind==='block'?'SKIP':kind==='ask'?'VERIFY':'REVIEW')+'</span><h3>'+escape(title)+'</h3><p>'+escape(detail)+'</p>';
 const points=[];
 for(const c of blocks)points.push('Mismatch — '+c.label+': '+c.detail);
 for(const c of asks){
  const question=c.label==='Hiring geography'?'Which countries are eligible for employment, and can you hire someone based in my country?':
    c.label==='Compensation'?'What is the annual base salary, its currency, and the expected range?':
    'Is the role fully remote, hybrid, or on-site, and is office attendance mandatory?';
  points.push('Ask the employer — '+question);
}
 const chosen=[...state.selected].sort().map(i=>state.requirements[i]);
 if(chosen.length)points.push('You marked '+chosen.length+' specific requirement'+(chosen.length!==1?'s':'')+' as relevant: '+chosen.slice(0,2).join(' / '));
 else points.push('Your experience has not been substantiated against the requirements.');
 if(state.notes)points.push('Your note: '+state.notes);
 points.push('Confirm the vacancy on the employer’s own website before taking action.');
 $('decisionPoints').innerHTML=points.map(x=>'<p class="decision-point"><span aria-hidden="true">•</span><span>'+escape(x)+'</span></p>').join('');
}
document.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=>selectRole(button.dataset.example)));
$('loadSample').addEventListener('click',()=>{
 let key=document.querySelector('[data-example][aria-pressed="true"]')?.dataset.example||'product';
 loadSample(key);
});
$('targetRole').addEventListener('input',()=>{
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed','false'));
 if(state.sample)state.sample=false;checkInput();
});
$('jobDescription').addEventListener('input',()=>{state.sample=false;checkInput()});
$('goEligibility').addEventListener('click',()=>{
 checkInput();if($('goEligibility').disabled)return;
 capture();analyze();showEligibility();showStep(1)
});
$('goFit').addEventListener('click',()=>{showFit();showStep(2)});
$('skillOptions').addEventListener('change',e=>{
 if(!e.target.matches('input[type="checkbox"][data-skill]'))return;
 const i=Number(e.target.dataset.skill);if(!Number.isInteger(i))return;
 e.target.checked?state.selected.add(i):state.selected.delete(i);updateFit()
});
$('experienceNotes').addEventListener('input',()=>{state.notes=$('experienceNotes').value});
$('goDecision').addEventListener('click',()=>{makeDecision();showStep(3)});
document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>showStep(Number(button.dataset.back))));
function reset(){
 state.sample=false;state.role='';state.description='';state.sourceUrl='';state.minSalary=0;state.region='eu';state.workMode='remote';state.checks=[];state.requirements=[];state.selected.clear();state.notes='';state.decision=null;
 for(const id of ['targetRole','jobDescription','jobUrl','minSalary','experienceNotes'])$(id).value='';
 $('targetRegion').value='eu';document.querySelector('input[name="workMode"][value="remote"]').checked=true;
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed','false'));
 checkInput();showStep(0)
}
$('resetDemo').addEventListener('click',reset);
$('restartFlow').addEventListener('click',reset);
$('copySummary').addEventListener('click',async()=>{
 if(!state.decision)return;
 const lines=['RoleHint browser checklist — not verified or sent','Job: '+state.role,'Source URL: '+(state.sourceUrl||'Not provided'),
 'Decision: '+state.decision.title,state.decision.detail,...state.checks.map(c=>c.label+' ['+c.kind+']: '+c.detail),
 'Requirements you marked:',...([...state.selected].sort().map(i=>'- '+state.requirements[i])),
 'Your examples: '+(state.notes||'Not added'),'Check the official vacancy and confirm all unknowns before applying.'];
 try{await navigator.clipboard.writeText(lines.join('\n'));toast('Decision notes copied')}catch(e){toast('Clipboard unavailable; use browser copy')}
});
const requested=new URLSearchParams(location.search).get('role');
if(requested&&samples[requested]){selectRole(requested);loadSample(requested,false)}
checkInput();showStep(0);
})();
