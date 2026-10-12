/* RoleHint interactive example. Fictional companies/jobs; no API calls or user data storage. */
(()=>{
'use strict';
const scenarios={
 product:{title:'Senior Product Manager',company:'Northstar Studio',mode:'remote',region:'eu',salary:90000,skills:['Product discovery and user research','Product strategy and prioritization','Cross-functional product delivery','Revenue or P&L ownership']},
 design:{title:'Senior Product Designer',company:'Mosaic Labs',mode:'remote',region:'global',salary:80000,skills:['User research and interviews','Prototypes and usability testing','Product design systems','Measuring design outcomes']},
 engineering:{title:'Software Engineer',company:'Relay Systems',mode:'hybrid',region:'eu',salary:105000,skills:['Shipping production applications','Code reviews and collaboration','System architecture decisions','Testing and reliability']},
 marketing:{title:'Marketing Lead',company:'Orbit Works',mode:'remote',region:'unknown',salary:null,skills:['Campaign planning and execution','Performance analysis','Managing multiple channels','Budget accountability']},
 custom:{title:'Your target role',company:'Sample Company',mode:'remote',region:'unknown',salary:null,skills:['Relevant responsibilities in this role','Cross-functional collaboration','Projects with measurable results','Leadership or ownership experience']}
};
const $=id=>document.getElementById(id);
const stages=['stepRole','stepEligibility','stepFit','stepDecision'];
const state={kind:null,title:'',mode:'remote',region:'eu',minimum:0,skills:new Set(),stage:0,checks:[],decision:null};
const enc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>n===null?'Not disclosed':'€'+Number(n).toLocaleString('en-US')+' / year';
const example=()=>scenarios[state.kind]||scenarios.custom;
function toast(s){const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2600)}
function updateSelection(){
 const raw=$('targetRole').value.trim();
 state.title=raw;
 const match=Object.entries(scenarios).find(([key,s])=>key!=='custom'&&s.title.toLowerCase()===raw.toLowerCase().replace(/^senior /,'') );
 if(!raw){state.kind=null}else if(!document.querySelector('.role-choice[aria-pressed="true"]'))state.kind='custom';
 $('goEligibility').disabled=!raw;
}
function pick(kind){
 state.kind=kind;
 const target={product:'Product Manager',design:'Product Designer',engineering:'Software Engineer',marketing:'Marketing Lead'}[kind]||'';
 $('targetRole').value=target;
 state.title=target;
 state.skills.clear();
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.example===kind)));
 $('goEligibility').disabled=false;
}
function getPreferences(){
 state.title=$('targetRole').value.trim();
 state.mode=document.querySelector('input[name="workMode"]:checked')?.value||'remote';
 state.region=$('targetRegion').value;
 state.minimum=Math.max(0,Math.min(500000,Number($('minSalary').value)||0));
}
function buildChecks(){
 const e=example(),checks=[];
 const modeMatch=state.mode==='any'||e.mode==='remote';
 checks.push({kind:modeMatch?'pass':'block',label:'Work setup',detail:(e.mode==='remote'?'Remote':'Hybrid · on-site in Berlin')+(modeMatch?' — matches your preference':' — conflicts with remote only')});
 if(e.region==='unknown')checks.push({kind:'ask',label:'Hiring location',detail:'Eligible hiring countries are not specified'});
 else if(e.region==='eu')checks.push({kind:state.region==='eu'?'pass':'ask',label:'Hiring location',detail:state.region==='eu'?'Europe listed':'Europe listed; confirm the employer can hire where you live'});
 else checks.push({kind:'ask',label:'Hiring location',detail:'Worldwide listed; work authorization still needs confirmation'});
 if(e.salary===null)checks.push({kind:state.minimum?'ask':'pass',label:'Salary',detail:'Not disclosed'+(state.minimum?' — compare against your €'+state.minimum.toLocaleString('en-US')+' minimum':'')});
 else checks.push({kind:state.minimum&&e.salary<state.minimum?'block':'pass',label:'Salary',detail:money(e.salary)+(state.minimum&&e.salary<state.minimum?' — below your minimum':' — sample figure, not a confirmed offer')});
 state.checks=checks;
}
function renderEligibility(){
 const e=example();
 $('sampleTitle').textContent=state.kind==='custom'?state.title:e.title;
 $('sampleCompany').textContent=e.company+' (fictional) · '+(e.mode==='remote'?'Remote':'Hybrid');
 $('eligibilityChecks').innerHTML=state.checks.map(c=>'<div class="check-row"><span class="check-symbol '+c.kind+'" aria-hidden="true">'+(c.kind==='pass'?'✓':c.kind==='block'?'×':'?')+'</span><div><strong>'+enc(c.label)+'</strong><p>'+enc(c.detail)+'</p></div></div>').join('');
 const blocked=state.checks.some(c=>c.kind==='block'),unclear=state.checks.some(c=>c.kind==='ask');
 $('eligibilityVerdict').className='verdict '+(blocked?'block':unclear?'ask':'pass');
 $('eligibilityVerdict').innerHTML='<strong>'+(blocked?'Outside your preferences':unclear?'A few things to confirm':'Worth reviewing')+'</strong><p>'+(blocked?'One or more hard requirements do not match. You can still explore why.':unclear?'Check the unknown details before applying.':'The listed details fit the example settings. The next check is your experience.')+'</p>';
}
function renderFit(){
 const e=example(),parent=$('skillOptions');
 parent.innerHTML=e.skills.map((s,i)=>'<label class="skill-check"><input type="checkbox" data-skill="'+i+'" '+(state.skills.has(i)?'checked':'')+'><span>'+enc(s)+'</span></label>').join('');
 updateFit();
}
function updateFit(){
 $('fitFeedback').textContent=state.skills.size?state.skills.size+' experience area'+(state.skills.size!==1?'s':'')+' selected. We will only mention what you selected.':'Nothing selected yet. That is OK: the final decision will flag the fit as unconfirmed.';
}
function buildDecision(){
 const e=example(),blocked=state.checks.filter(c=>c.kind==='block'),unknown=state.checks.filter(c=>c.kind==='ask');
 let status='review',title='Worth a closer look',message='The basic rules match and you selected relevant experience. Review the real listing before applying.';
 if(blocked.length){status='block';title='Skip — unless your rules change';message='A hard requirement conflicts with the preferences you chose. Applying would probably waste time.';}
 else if(unknown.length){status='ask';title='Verify before applying';message='Some critical job details are missing. Check those before spending time on an application.';}
 else if(!state.skills.size){status='ask';title='Check your fit first';message='The requirements may align, but you have not selected relevant experience yet.';}
 state.decision={status,title,message,role:state.title,selected:[...state.skills].map(i=>e.skills[i]),checks:state.checks};
 $('decisionResult').className='decision-result '+status;
 $('decisionResult').innerHTML='<span class="decision-tag">'+(status==='block'?'SKIP':status==='ask'?'VERIFY':'REVIEW')+'</span><h3>'+enc(title)+'</h3><p>'+enc(message)+'</p>';
 const bullets=[];
 if(blocked.length)bullets.push('Mismatch: '+blocked.map(c=>c.label.toLowerCase()).join(', '));
 if(unknown.length)bullets.push('Confirm: '+unknown.map(c=>c.label.toLowerCase()).join(', '));
 if(state.skills.size)bullets.push('You selected '+state.skills.size+' area'+(state.skills.size>1?'s':'')+' of experience.');
 else bullets.push('Your experience has not been compared with actual role requirements.');
 bullets.push('Use the real employer posting before taking action.');
 $('decisionPoints').innerHTML=bullets.map(t=>'<p class="decision-point"><span aria-hidden="true">•</span>'+enc(t)+'</p>').join('');
}
function showStep(index){
 state.stage=index;
 stages.forEach((id,i)=>{const el=$(id);el.hidden=i!==index;});
 document.querySelectorAll('[data-progress]').forEach((el,i)=>{
 el.classList.toggle('is-current',i===index);el.classList.toggle('is-done',i<index);
 if(i===index)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');
 });
 window.scrollTo({top:0,behavior:'instant'});
 const h=$(stages[index]).querySelector('h2'); if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
}
document.querySelectorAll('[data-example]').forEach(btn=>btn.addEventListener('click',()=>pick(btn.dataset.example)));
$('targetRole').addEventListener('input',()=>{
 state.kind='custom';state.skills.clear();
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed','false'));
 updateSelection();
});
$('goEligibility').addEventListener('click',()=>{
 getPreferences();if(!state.title)return;buildChecks();renderEligibility();showStep(1);
});
$('goFit').addEventListener('click',()=>{renderFit();showStep(2)});
$('skillOptions').addEventListener('change',e=>{
 const i=Number(e.target.dataset.skill);
 if(!Number.isInteger(i)||!e.target.matches('input[type="checkbox"]'))return;
 if(e.target.checked)state.skills.add(i);else state.skills.delete(i);updateFit();
});
$('goDecision').addEventListener('click',()=>{buildDecision();showStep(3)});
document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',()=>showStep(Number(b.dataset.back))));
function reset(){
 state.kind=null;state.title='';state.minimum=0;state.skills.clear();state.checks=[];
 $('targetRole').value='';$('minSalary').value='';
 document.querySelectorAll('[data-example]').forEach(b=>b.setAttribute('aria-pressed','false'));
 $('goEligibility').disabled=true;showStep(0);
}
$('resetDemo').addEventListener('click',reset);
$('restartFlow').addEventListener('click',reset);
$('copySummary').addEventListener('click',async()=>{
 const d=state.decision;if(!d)return;
 const lines=['RoleHint demo — fictional job','Target role: '+d.role,'Decision: '+d.title,d.message,...d.checks.map(c=>c.label+': '+c.detail),
 'Experience you selected: '+(d.selected.join(', ')||'None selected'), 'Illustrative analysis only. Verify a real listing.'];
 try{await navigator.clipboard.writeText(lines.join('\n'));toast('Summary copied');}catch(e){toast('Clipboard unavailable; try selecting the text manually')}
});
const requested=new URLSearchParams(location.search).get('role');
if(['product','design','engineering','marketing'].includes(requested))pick(requested);
else updateSelection();
showStep(0);
})();
