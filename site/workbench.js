/* RoleHint simulated opportunity agent.
 * Browser-only demo. All employers, opportunities and outcomes are fictional.
 * No real vacancies retrieved; no profile information leaves this browser.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const euro=n=>n==null?'Not disclosed':'€'+Math.round(n).toLocaleString('en-US');
const roleSets={
 product:{
  name:'Product',target:'Senior Product Manager',
  skills:[
   ['Customer discovery','I have led customer interviews and shaped product decisions from findings.'],
   ['Product strategy','I have prioritized a roadmap around a clear product goal.'],
   ['Cross-functional delivery','I have led product work with design and engineering through release.'],
   ['Commercial ownership','I can demonstrate direct revenue or P&L ownership.'],
   ['B2B SaaS','I have built or led a B2B software product.'],
   ['Product metrics','I have used adoption or conversion data to guide product decisions.']
  ],
  chosen:[0,1,2,5],
  titles:['Senior Product Manager','Principal Product Manager','Product Lead','Product Manager','Director of Product','Head of Product','Group Product Manager']
 },
 design:{
  name:'Design',target:'Senior Product Designer',
  skills:[
   ['User research','I have planned interviews or usability studies with users.'],
   ['Interaction design','I have designed and tested interactive product flows.'],
   ['Design systems','I have created or maintained shared interface components.'],
   ['Measured outcomes','I can describe measurable results of design improvements.'],
   ['Team leadership','I have coached designers or led design decisions across teams.'],
   ['Product collaboration','I have worked directly with product and engineering to ship.']
  ],
  chosen:[0,1,2,5],
  titles:['Senior Product Designer','Principal Product Designer','Design Lead','Product Designer','Head of Product Design','Design Director','Staff Product Designer']
 },
 engineering:{
  name:'Engineering',target:'Software Engineer',
  skills:[
   ['Production delivery','I have shipped and maintained working software.'],
   ['Technical design','I have made architecture or technology decisions.'],
   ['Collaboration','I have collaborated through code review and technical planning.'],
   ['Cloud infrastructure','I can demonstrate deployment and operational ownership.'],
   ['Leadership','I have led technical delivery or mentored engineers.'],
   ['Reliability','I have improved tests, observability or reliability.']
  ],
  chosen:[0,1,2,5],
  titles:['Senior Software Engineer','Staff Engineer','Engineering Lead','Software Engineer','Engineering Manager','Principal Engineer','Backend Engineer']
 },
 marketing:{
  name:'Marketing',target:'Growth Marketing Lead',
  skills:[
   ['Campaign strategy','I have planned and delivered multichannel marketing campaigns.'],
   ['Performance analysis','I have measured and improved campaign performance.'],
   ['Cross-team execution','I have delivered initiatives with commercial and creative teams.'],
   ['Budget ownership','I can demonstrate responsibility for marketing budgets.'],
   ['Lifecycle marketing','I have managed retention or lifecycle programs.'],
   ['Experimentation','I have tested and iterated creative or channel strategies.']
  ],
  chosen:[0,1,2,5],
  titles:['Growth Marketing Lead','Head of Growth','Marketing Lead','Growth Marketer','VP of Marketing','Marketing Director','Lifecycle Marketing Lead']
 }
};
const mockTemplates=[
 {id:'01',company:'Northstar Studio',mode:'remote',region:'eu',from:90000,to:115000,source:'employer',keys:[0,1,2,3],effort:35,context:'Discovery, roadmap and cross-functional product delivery.'},
 {id:'02',company:'Mosaic Labs',mode:'remote',region:'unknown',from:122000,to:145000,source:'employer',keys:[0,1,3],effort:70,context:'International remit, but hiring countries are not listed.'},
 {id:'03',company:'Forge Works',mode:'hybrid',region:'eu',from:130000,to:155000,source:'employer',keys:[0,1,2],effort:40,context:'Three days per week at the Berlin office.'},
 {id:'04',company:'Luma Studio',mode:'remote',region:'eu',from:49000,to:60000,source:'employer',keys:[0,1],effort:25,context:'Remote role at a lower published compensation band.'},
 {id:'05',company:'Aster Group',mode:'remote',region:'eu',from:98000,to:122000,source:'employer',keys:[3,4,5],effort:90,context:'Broad functional and commercial responsibilities.'},
 {id:'06',company:'Thrive Ventures',mode:'remote',region:'us',from:145000,to:180000,source:'employer',keys:[1,2,5],effort:50,context:'Fully remote but hiring limited to the United States.'},
 {id:'07',company:'Nova Collective',mode:'remote',region:'eu',from:108000,to:132000,source:'repost',keys:[0,1,5],effort:30,context:'The sample has a repost but no original employer posting attached.'},
 {id:'01-repost',duplicateOf:'01',company:'Northstar Studio',mode:'remote',region:'eu',from:90000,to:115000,source:'repost',keys:[0,1,2,3],effort:35,context:'Duplicate sample repost.'}
];
const state={role:'product',chosen:new Set(roleSets.product.chosen),remote:'remote',region:'eu',floor:75000,budget:45,items:[],filter:'all',selected:null,saved:new Set(),passed:new Set(),revealed:new Set(),progressTimers:[],runToken:0,phase:'setup'};
const getRole=()=>roleSets[state.role];
const selectedSkills=()=>getRole().skills.filter((x,i)=>state.chosen.has(i)).map(x=>x[0]);
function toast(msg){let e=$('toast');e.textContent=msg;e.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.classList.remove('visible'),2600)}
function setPhase(p){state.phase=p;for(let [name,id] of [['setup','setupScreen'],['running','runScreen'],['results','resultsScreen']])$(id).hidden=name!==p;window.scrollTo({top:0,behavior:'instant'})}
function changeRole(role){
 if(!roleSets[role])return;
 state.role=role;state.chosen=new Set(roleSets[role].chosen);
 document.querySelectorAll('[data-role]').forEach(el=>{let selected=el.dataset.role===role;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',String(selected))});
 renderProfile();
}
function renderProfile(){
 $('profileEditor').innerHTML=getRole().skills.map(([label],i)=>'<label class="profile-chip"><input type="checkbox" data-skill="'+i+'" '+(state.chosen.has(i)?'checked':'')+'><span class="chip-symbol" aria-hidden="true"></span><span>'+safe(label)+'</span></label>').join('');
}
function readSettings(){
 state.remote=$('remoteRule').value;
 state.region=$('regionRule').value;
 state.floor=Math.max(0,Math.min(500000,Number($('salaryRule').value)||0));
 state.budget=Number($('timeRule').value)||45;
}
function makeJobs(){
 // 8 illustrative raw postings; one deliberate duplicate removed.
 let base=mockTemplates.filter(t=>!t.duplicateOf);
 return base.map((job,i)=>({...job,title:getRole().titles[i],key:state.role+'-'+job.id}));
}
function decide(job){
 let blockers=[],unknowns=[],notes=[],fits=[],unshown=[];
 if(state.remote==='remote'&&job.mode==='hybrid')blockers.push('Office attendance conflicts with remote only');
 if(state.region==='eu'&&job.region==='us')blockers.push('Hiring is limited to the United States');
 if(state.floor&&job.to!=null&&job.to<state.floor)blockers.push('Maximum listed salary is below your minimum');
 if(job.region==='unknown')unknowns.push('Ask which countries the employer can hire from');
 else if(job.region==='eu')notes.push('Europe listed; exact country and work authorization still need confirmation');
 if(job.source==='repost')unknowns.push('Find and verify the original employer posting');
 if(job.from==null)unknowns.push('Confirm annual base compensation');
 else if(state.floor&&job.from<state.floor&&job.to>=state.floor)unknowns.push('Only part of the salary range meets your minimum');
 if(job.effort>state.budget)notes.push('Application effort exceeds your preferred time budget');
 for(const k of job.keys){if(state.chosen.has(k))fits.push(k);else unshown.push(k)}
 // Hard blockers override all other scores. Unknown is never represented as confirmed.
 let status,reason;
 if(blockers.length){status='skip';reason=blockers[0];}
 else if(unknowns.length){status='verify';reason=unknowns[0];}
 else if(fits.length<Math.min(2,job.keys.length)){status='verify';reason='Not enough matching experience selected yet';}
 else if(job.effort>state.budget){status='verify';reason='Review whether the application is worth the time';}
 else{status='pursue';reason='Meets your stated filters; relevant experience selected';}
 return {...job,status,reason,blockers,unknowns,notes,fits,unshown};
}
function runDemo(){
 readSettings();state.items=makeJobs().map(decide).sort((a,b)=>({pursue:0,verify:1,skip:2}[a.status]-({pursue:0,verify:1,skip:2}[b.status]) || b.fits.length-a.fits.length));
 state.selected=state.items[0]?.key||null;state.filter='all';state.saved.clear();state.passed.clear();state.revealed.clear();
 showRun();
}
function stopTimers(){state.runToken++;state.progressTimers.forEach(clearTimeout);state.progressTimers=[]}
function showRun(){
 stopTimers();setPhase('running');
 const token=state.runToken;
 const milestones=['Read 8 fictional listings from two example source types','Remove 1 duplicate posting','Check remote, geography and pay rules','Compare requirements with your selected experience','Build a prioritized decision queue'];
 $('runMilestones').innerHTML=milestones.map((m,i)=>'<div class="milestone" data-milestone="'+i+'"><span class="milestone-icon">○</span><span>'+safe(m)+'</span></div>').join('');
 $('runProgress').style.width='0%';$('runDetail').textContent='Starting simulated search…';
 milestones.forEach((msg,i)=>{const id=setTimeout(()=>{
   if(token!==state.runToken)return;
   const el=document.querySelector('[data-milestone="'+i+'"]');
   if(el){el.classList.add('done');el.querySelector('.milestone-icon').textContent='✓'}
   $('runProgress').style.width=((i+1)/milestones.length*100)+'%';
   $('runDetail').textContent=msg;
 },i*440+150);state.progressTimers.push(id)});
 state.progressTimers.push(setTimeout(()=>{if(token===state.runToken)showResults()},milestones.length*440+650));
}
function showResults(){
 stopTimers();setPhase('results');refreshResults();if(state.items.length)selectJob(state.items[0].key,false);
}
function stats(){
 const counts={pursue:0,verify:0,skip:0};state.items.forEach(j=>counts[j.status]++);
 return counts;
}
function refreshResults(){
 const counts=stats();
 $('resultsMetrics').innerHTML='<div><strong>8</strong><span>Sample listings</span></div><div><strong>1</strong><span>Repeat removed</span></div><div><strong>'+counts.pursue+'</strong><span>Prioritized</span></div>';
 $('decisionSummary').textContent='Target: '+getRole().target+'  ·  '+(state.remote==='remote'?'Remote only':'Remote or hybrid')+'  ·  '+(state.floor?euro(state.floor)+'+':'Any salary')+'  ·  '+selectedSkills().length+' experience areas';
 $('allCount').textContent=String(state.items.length);
 for(const type of ['pursue','verify','skip'])$(type+'Count').textContent=String(counts[type]);
 renderFilters();
 renderList();
}
function filteredItems(){return state.items.filter(j=>state.filter==='all'||j.status===state.filter)}
function renderFilters(){
 document.querySelectorAll('[data-filter]').forEach(el=>{
  const active=el.dataset.filter===state.filter;el.classList.toggle('active',active);el.setAttribute('aria-pressed',String(active));
 });
}
const badgeName=s=>({pursue:'Worth reviewing',verify:'Verify first',skip:'Skip'})[s]||s;
const modeText=j=>j.mode==='remote'?'Remote': 'Hybrid · Berlin';
const regionText=j=>j.region==='eu'?'Europe':j.region==='us'?'US only':'Unspecified countries';
function renderList(){
 const jobs=filteredItems();
 if(!jobs.some(j=>j.key===state.selected)){state.selected=jobs[0]?.key||null}
 $('jobList').innerHTML=jobs.length?jobs.map(j=>{
  const active=state.selected===j.key,passed=state.passed.has(j.key),saved=state.saved.has(j.key);
  return '<button type="button" class="job-card'+(active?' active':'')+(passed?' dimmed':'')+'" data-job="'+safe(j.key)+'" aria-current="'+(active?'true':'false')+'">'+
   '<div class="job-card-top"><span class="company-mark" aria-hidden="true">'+safe(j.company[0])+'</span><span class="status-badge '+j.status+'">'+badgeName(j.status)+'</span></div>'+
   '<strong class="job-name">'+safe(j.title)+'</strong><span class="company-name">'+safe(j.company)+'</span>'+
   '<span class="job-meta">'+safe(modeText(j))+' · '+safe(j.from==null?'Pay undisclosed':euro(j.from)+'–'+euro(j.to))+'</span>'+
   '<span class="job-card-foot">'+safe(j.reason)+(saved?' · Saved':'')+(passed?' · Passed':'')+' <span aria-hidden="true">↗</span></span></button>'
 }).join(''):'<div class="empty-state">No opportunities in this group. Change the filter to inspect another decision.</div>';
}
function selectJob(key,scroll=true){
 if(!state.items.some(j=>j.key===key))return;
 state.selected=key;renderList();renderDetail();
 if(scroll&&matchMedia('(max-width:800px)').matches){document.body.classList.add('mobile-detail');$('detailPane').scrollIntoView({behavior:'smooth',block:'start'});}
}
function findJob(){return state.items.find(j=>j.key===state.selected)}
function detailChecks(j){
 const items=[
  {title:'Work arrangement',kind:state.remote==='remote'&&j.mode==='hybrid'?'block':'known',text:modeText(j)+(j.mode==='hybrid'?' — office attendance required':' — named in this sample')},
  {title:'Hiring region',kind:state.region==='eu'&&j.region==='us'?'block':j.region==='unknown'?'unknown':'known',text:regionText(j)+' · country-specific eligibility is not verified'},
  {title:'Compensation',kind:state.floor&&j.to<state.floor?'block':state.floor&&j.from<state.floor?'unknown':'known',text:euro(j.from)+'–'+euro(j.to)+' annual base · fictional'}
 ];
 return items.map(c=>'<div class="check-line"><span class="check-bullet '+c.kind+'" aria-hidden="true">'+(c.kind==='block'?'×':c.kind==='unknown'?'?':'✓')+'</span><div><strong>'+safe(c.title)+'</strong><p>'+safe(c.text)+'</p></div></div>').join('');
}
function fitRows(j){
 return j.keys.map(k=>{const matched=j.fits.includes(k),skill=getRole().skills[k];return '<div class="fit-row"><span class="fit-state '+(matched?'matched':'unshown')+'">'+(matched?'Selected':'Not shown')+'</span><div><strong>'+safe(skill[0])+'</strong><p>'+safe(matched?skill[1]:'Not selected in the example background; this does not mean you lack the skill.')+'</p></div></div>'}).join('');
}
function suggestedQuestions(j){
 const questions=[];
 if(j.region==='unknown'||j.region==='eu')questions.push('Which hiring countries are eligible, and can you employ someone in my country?');
 if(j.source==='repost')questions.push('Where is the original employer-posted vacancy?');
 if(state.floor&&j.from<state.floor&&j.to>=state.floor)questions.push('Is the base salary negotiable above '+euro(state.floor)+'?');
 if(j.effort>state.budget)questions.push('Is a detailed assignment necessary before an initial conversation?');
 if(j.unshown.length)questions.push('Which listed requirement is truly essential versus preferred?');
 return questions.length?questions:['What are the key success measures for the first six months?'];
}
function writePitch(j){
 const claims=j.fits.slice(0,3).map(k=>getRole().skills[k][1].replace(/^I (have |can )?/,''));
 return 'Sample application introduction — review and rewrite before use.\n\n'+
  'Hello, I am interested in the '+j.title+' role. '+
  (claims.length?'Based on the experience selected in this demo, relevant areas may include '+j.fits.slice(0,3).map(k=>getRole().skills[k][0].toLowerCase()).join(', ')+'. ':'')+
  'I would welcome the chance to discuss how my background matches your requirements.\n\n'+
  'Before sending, confirm every claim with your own examples. No message was sent by RoleHint.';
}
function renderAction(j){
 if(j.status==='skip')return '<p class="action-copy">A stated constraint conflicts with your rules. Unless that changes, prioritize a different role.</p><button class="action-button" type="button" data-action="next">Review another job <span>→</span></button>';
 if(j.status==='verify'){
  return '<p class="action-copy">Resolve the unknowns before writing an application. These are questions, not confirmed employer facts.</p>'+
   '<button class="action-button" type="button" data-action="questions">Show questions to ask <span>→</span></button>';
 }
 return '<p class="action-copy">This role passes the sample preflight. Prepare a starting point grounded in the experience you selected.</p>'+
  '<button class="action-button" type="button" data-action="preview">Preview application <span>→</span></button>';
}
function renderReveal(j){
 if(!state.revealed.has(j.key))return '';
 if(j.status==='verify')return '<div class="reveal"><h4>Questions worth asking</h4><ol>'+suggestedQuestions(j).map(q=>'<li>'+safe(q)+'</li>').join('')+'</ol><button type="button" class="text-button" data-action="copy-questions">Copy questions ↗</button></div>';
 return '<div class="reveal"><h4>Editable sample introduction</h4><p class="hint">The profile is fictional until you replace it with your own facts. Nothing has been submitted.</p><textarea id="draftText" class="draft-text" rows="7">'+safe(writePitch(j))+'</textarea><label class="approval"><input type="checkbox" id="approveDraft"> I have checked and edited the claims before copying.</label><button type="button" class="text-button" data-action="copy-pitch" disabled>Copy reviewed draft ↗</button></div>';
}
function renderDetail(){
 const j=findJob();if(!j){$('jobDetail').innerHTML='<div class="detail-empty">Select an opportunity to see the decision.</div>';return}
 const fitCount=j.fits.length;
 $('jobDetail').innerHTML='<div class="detail-mobile-head"><button type="button" data-action="back">← All opportunities</button></div>'+
 '<div class="detail-top"><div><span class="eyebrow">DECISION / '+safe(j.id)+'</span><h2>'+safe(j.title)+'</h2><p>'+safe(j.company)+' · '+safe(modeText(j))+' · '+safe(regionText(j))+'</p></div><span class="status-badge '+j.status+'">'+badgeName(j.status)+'</span></div>'+
 '<div class="detail-verdict"><strong>'+safe(j.reason)+'</strong><p>Based on your selected example profile and the fictional posting below, not real-time verification.</p></div>'+
 '<div class="detail-columns"><div class="detail-main">'+
 '<section class="detail-section"><div class="section-head"><h3>01 / Eligibility</h3><span>Hard rules first</span></div><div class="checks">'+detailChecks(j)+'</div></section>'+
 '<section class="detail-section"><div class="section-head"><h3>02 / Your fit</h3><span>'+fitCount+' of '+j.keys.length+' selected</span></div><div class="fit-list">'+fitRows(j)+'</div><p class="disclosure">The matches come from your selected example statements, not external verification.</p></section>'+
 '<section class="detail-section"><div class="section-head"><h3>03 / Source & effort</h3></div><div class="source-row"><span>Origin</span><strong>'+(j.source==='employer'?'Employer listing · simulated':'Board repost · simulated')+'</strong></div><div class="source-row"><span>Application effort</span><strong>About '+j.effort+' min · illustrative</strong></div><div class="source-row"><span>Context</span><strong>'+safe(j.context)+'</strong></div></section></div>'+
 '<aside class="action-panel"><span class="eyebrow">YOUR NEXT MOVE</span><h3>'+badgeName(j.status)+'</h3>'+renderAction(j)+
 '<div class="action-tools"><button type="button" class="utility-button" data-action="save">'+(state.saved.has(j.key)?'Saved ✓':'Save for later')+'</button><button type="button" class="utility-button" data-action="pass">'+(state.passed.has(j.key)?'Undo pass':'Pass')+'</button></div>'+
 renderReveal(j)+'</aside></div>';
}
function selectFilter(filter){
 state.filter=filter;document.body.classList.remove('mobile-detail');renderFilters();renderList();renderDetail();
}
function nextJob(){
 const options=filteredItems();if(!options.length)return;
 const i=options.findIndex(j=>j.key===state.selected),next=options[(i+1)%options.length];
 selectJob(next.key,true);
}
async function copyText(text){
 try{await navigator.clipboard.writeText(text);toast('Copied to clipboard')}catch(e){toast('Copy unavailable in this browser')}
}
function runAction(action){
 const j=findJob();if(!j)return;
 if(action==='back'){document.body.classList.remove('mobile-detail');$('listPane').scrollIntoView({behavior:'smooth'});return}
 if(action==='next'){nextJob();return}
 if(action==='save'){state.saved.has(j.key)?state.saved.delete(j.key):state.saved.add(j.key);refreshResults();renderDetail();toast(state.saved.has(j.key)?'Saved in this demo':'Removed from saved');return}
 if(action==='pass'){state.passed.has(j.key)?state.passed.delete(j.key):state.passed.add(j.key);refreshResults();renderDetail();toast(state.passed.has(j.key)?'Passed in this demo':'Pass undone');return}
 if(action==='questions'||action==='preview'){state.revealed.add(j.key);renderDetail();let reveal=$('jobDetail').querySelector('.reveal');if(reveal)reveal.scrollIntoView({behavior:'smooth',block:'nearest'});return}
 if(action==='copy-questions'){copyText(suggestedQuestions(j).join('\n'));return}
 if(action==='copy-pitch'){const a=$('approveDraft'),t=$('draftText');if(a?.checked&&t?.value.trim())copyText(t.value);else toast('Review the claims first')}
}
function reset(){stopTimers();state.saved.clear();state.passed.clear();state.revealed.clear();setPhase('setup')}
document.querySelectorAll('[data-role]').forEach(button=>button.addEventListener('click',()=>changeRole(button.dataset.role)));
$('profileEditor').addEventListener('change',e=>{const t=e.target;if(!t.matches('input[data-skill]'))return;const n=Number(t.dataset.skill);t.checked?state.chosen.add(n):state.chosen.delete(n)});
$('runAgent').addEventListener('click',runDemo);
$('skipAnimation').addEventListener('click',showResults);
$('editSearch').addEventListener('click',()=>{stopTimers();setPhase('setup')});
$('startOver').addEventListener('click',reset);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>selectFilter(b.dataset.filter)));
$('jobList').addEventListener('click',e=>{const card=e.target.closest('[data-job]');if(card)selectJob(card.dataset.job,true)});
$('jobDetail').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b)runAction(b.dataset.action)});
$('jobDetail').addEventListener('change',e=>{if(e.target.id==='approveDraft'){const btn=$('jobDetail').querySelector('[data-action="copy-pitch"]');if(btn)btn.disabled=!e.target.checked}});
changeRole('product');setPhase('setup');
const params=new URLSearchParams(location.search),selected=params.get('role');if(selected&&roleSets[selected])changeRole(selected);
})();
