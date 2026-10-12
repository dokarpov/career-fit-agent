/* RoleHint decision workbench — all sample opportunities and outcomes are fictional.
 * Deliberately no API calls, credentials, persistence, submissions, or inferred real user facts.
 */
(()=>{
'use strict';
const roles=[
{id:'atlas',title:'Senior Product Manager',employer:'Northstar Studio (sample)',location:'Remote · Europe',type:'ready',salary:'Not disclosed',summary:'The sample experience supports product discovery work. Commercial ownership needs checking, and direct sector experience remains a gap.',
 evidence:[
 {type:'use',name:'Product discovery and delivery',caption:'Documented contribution',detail:'Sample case study: led discovery and coordinated cross-functional product decisions. Ownership and source attribution are explicitly stated.',source:'Sample candidate case study · illustrative'},
 {type:'check',name:'Commercial accountability',caption:'Relevant, but unclear',detail:'The role asks for revenue or P&L responsibility. Adjacent planning and prioritization do not prove direct ownership of a P&L.',source:'Needs the candidate’s confirmation'},
 {type:'gap',name:'Direct sector specialization',caption:'No proof provided',detail:'No verified project demonstrating specialist experience in this industry was included. The system must not manufacture this background.',source:'Unsubstantiated in sample profile'}]},
{id:'relay',title:'Product Lead',employer:'Relay Works (sample)',location:'Remote · hiring countries unconfirmed',type:'verify',salary:'Not disclosed',summary:'Strong functional overlap, but the employer has not specified which countries can be hired. Eligibility must be checked before recommending an application.',
 evidence:[
 {type:'use',name:'Cross-functional product leadership',caption:'Documented contribution',detail:'The sample case study attributes product direction and team coordination to the candidate.',source:'Sample leadership case study'},
 {type:'check',name:'Hiring jurisdiction',caption:'Hard eligibility uncertainty',detail:'“Remote” is not the same as “can hire in your country”. Ask the employer to confirm before investing time.',source:'Employer location policy unknown'},
 {type:'gap',name:'Direct P&L ownership',caption:'No proof provided',detail:'No source substantiates personal responsibility for the company or product P&L.',source:'Unsubstantiated in sample profile'}]},
{id:'parallel',title:'Principal Product Manager',employer:'Parallel Labs (sample)',location:'Remote · European Union',type:'ready',salary:'Not disclosed',summary:'A potential match for a senior product professional. The sample has documented discovery work, while AI-domain depth still requires separate proof.',
 evidence:[
 {type:'use',name:'End-to-end product strategy',caption:'Documented contribution',detail:'Illustrative product strategy artifact, with defined owner and measurable project scope.',source:'Sample planning document'},
 {type:'check',name:'Applied AI implementation',caption:'Needs review',detail:'Using AI tools does not automatically establish ownership of production AI products.',source:'Ask for specific project references'},
 {type:'gap',name:'Regulated-sector delivery',caption:'No proof provided',detail:'Specialized regulated-domain experience cannot be inferred from unrelated projects.',source:'Unsubstantiated in sample profile'}]},
{id:'orbit',title:'Head of Product Strategy',employer:'Orbit Group (sample)',location:'Hybrid · Berlin',type:'hybrid',salary:'Not disclosed',summary:'Despite topical similarity, the hybrid location violates the remote-only preference shown in this demo.',
 evidence:[
 {type:'use',name:'Product planning and strategy',caption:'Documented contribution',detail:'The sample profile contains relevant strategic product documents.',source:'Sample planning documents'},
 {type:'check',name:'Organizational authority',caption:'Needs review',detail:'Strategic advice does not automatically establish line-management or executive authority.',source:'Clarify actual decision rights'},
 {type:'gap',name:'Required on-site attendance',caption:'Hard eligibility blocker',detail:'The role requires working from Berlin on-site. With Remote only enabled, RoleHint must exclude it regardless of semantic fit.',source:'Illustrative vacancy requirement'}]}
];
const $=id=>document.getElementById(id);
const state={selected:'atlas',filter:'action',q:'',remoteOnly:true,regionConfirmed:new Set(),approved:new Set(),saved:new Set(),passed:new Set(),draft:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const idx=id=>roles.findIndex(r=>r.id===id);
const current=()=>roles.find(r=>r.id===state.selected)||roles[0];
const blocked=r=>r.type==='hybrid'&&state.remoteOnly;
const requiresVerify=r=>r.type==='verify'&&!state.regionConfirmed.has(r.id);
const status=r=>blocked(r)?['Outside preferences','blocked']:state.passed.has(r.id)?['Passed','blocked']:state.saved.has(r.id)?['Saved','saved']:requiresVerify(r)?['Verify eligibility','review']:['Ready for review','ready'];
const statusMarkup=r=>{const [label,kind]=status(r);return '<span class="status-pill '+kind+'">'+esc(label)+'</span>'};
const proofLabel={use:'USE',check:'CHECK',gap:'GAP'};
function filtered(){const q=state.q.trim().toLowerCase();return roles.filter(r=>{
 if(state.filter==='saved'&&!state.saved.has(r.id))return false;
 if(state.filter==='action'&&(blocked(r)||state.passed.has(r.id)||state.saved.has(r.id)))return false;
 return !q||[r.title,r.employer,r.location].some(x=>x.toLowerCase().includes(q));
});}
function listCard(r,i){return '<button class="role-card" type="button" data-role="'+esc(r.id)+'" aria-current="'+(state.selected===r.id)+'"><div class="role-card-head"><span class="role-count">'+String(i+1).padStart(2,'0')+' / '+String(roles.length).padStart(2,'0')+'</span>'+statusMarkup(r)+'</div><h3>'+esc(r.title)+'</h3><p>'+esc(r.employer)+'</p><div class="role-card-foot"><span>'+esc(r.location)+'</span><span class="proof-count">'+r.evidence.filter(e=>e.type==='use').length+' backed</span></div></button>'}
function renderList(){const list=filtered();$('roleList').innerHTML=list.length?list.map(r=>listCard(r,idx(r))).join(''):'<div class="empty-list">No roles in this view.<br>Try All roles or change your search.</div>';
 $('needsCount').textContent=roles.filter(r=>!blocked(r)&&!state.passed.has(r.id)&&!state.saved.has(r.id)).length;
 $('savedCount').textContent=state.saved.size;
 $('resultsSaved').textContent=state.saved.size;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===state.filter)));
}
function evidenceItem(e,i){return '<details class="evidence-item" '+(i===0?'open':'')+'><summary><span class="proof-token '+e.type+'">'+proofLabel[e.type]+'</span><span><strong>'+esc(e.name)+'</strong><small>'+esc(e.caption)+'</small></span><span class="chev" aria-hidden="true">+</span></summary><div class="evidence-note">'+esc(e.detail)+'<div class="source">SOURCE / '+esc(e.source)+'</div></div></details>'}
function band(r){let title='Within sample preferences',note='Location meets the example remote-only preference. This is not an employment-authorisation determination.',kind='ready';
 if(blocked(r)){title='A hard constraint blocks this role';note='Hybrid attendance conflicts with Remote only. The system will not recommend an application.',kind='blocked'}
 else if(requiresVerify(r)){title='Hiring location needs confirmation';note='The role says remote but eligible employment countries are unspecified. Verify this before preparing claims.',kind='review'}
 return '<div class="eligibility-band '+(kind==='blocked'?'is-blocked':kind==='review'?'is-review':'')+'"><div class="eligibility-copy"><strong>'+esc(title)+'</strong><p>'+esc(note)+'</p></div><span class="status-pill '+kind+'">'+(kind==='ready'?'ELIGIBLE EXAMPLE':kind==='review'?'CHECK FIRST':'BLOCKED')+'</span></div>';
}
function draftText(r){const claim=r.evidence.find(e=>e.type==='use');return 'I would welcome the opportunity to discuss the '+r.title+' role. My documented project work includes '+claim.name.toLowerCase()+'. I can share the relevant case study and explain my actual responsibilities.\n\nI would also like to confirm the position’s specific requirements and the areas where my experience may differ.'}
function renderDetail(){const r=current(),isBlocked=blocked(r),needsVerify=requiresVerify(r),allow=!isBlocked&&!needsVerify;
 $('roleIndex').textContent=String(idx(r.id)+1).padStart(2,'0')+' / '+String(roles.length).padStart(2,'0');
 const steps=(needsVerify?'<div class="next-step"><h4>Resolve eligibility first</h4><p>For this fictional role, you can simulate receiving confirmation that hiring in your country is possible. Real RoleHint must rely on actual employer evidence.</p><button type="button" class="secondary-button" data-action="confirm-region">Simulate employer confirmation ↗</button></div>':
 allow?'<div class="next-step"><h4>Before creating a draft</h4><p>Review the supported example statement. You—not the AI—choose whether the claim can be used.</p><label class="approval-label"><input id="approveClaim" type="checkbox" '+(state.approved.has(r.id)?'checked':'')+'><span>I reviewed the sample case-study claim for this application.</span></label><div class="actions" style="justify-content:flex-start;margin-top:16px"><button type="button" class="primary-button" data-action="prepare" '+(!state.approved.has(r.id)?'disabled':'')+'>Prepare draft ↗</button></div>'+(state.draft===r.id?'<div class="draft"><div class="draft-header"><strong>Illustrative recruiter introduction</strong><span class="status-pill ready">DRAFT ONLY</span></div><pre>'+esc(draftText(r))+'</pre><p class="draft-note">No application is submitted or saved. Verify every statement against your own experience.</p><button class="secondary-button" type="button" data-action="copy-draft">Copy sample draft ↗</button></div>':'')+'</div>':'<div class="next-step"><h4>Why this stays excluded</h4><p>Turning a great keyword match into an application would break your remote-only rule. Inspect the constraints or look at an eligible alternative.</p><button class="secondary-button" type="button" data-action="preferences">Inspect preferences ↗</button></div>');
 $('roleDetail').innerHTML='<article class="detail" data-current-role="'+esc(r.id)+'"><div class="detail-eyebrow">YOUR EVIDENCE × THIS OPPORTUNITY</div><div class="detail-head"><div><h2 id="roleTitle">'+esc(r.title)+'</h2><p>'+esc(r.employer)+' <span aria-hidden="true">·</span> '+esc(r.location)+'</p></div><span class="detail-id">'+String(idx(r.id)+1).padStart(2,'0')+'</span></div>'+
 band(r)+'<div class="section-heading"><h3>What supports the match?</h3><span>01 USE / 01 CHECK / 01 GAP</span></div><div class="evidence-list">'+r.evidence.map(evidenceItem).join('')+'</div>'+steps+
 '<div class="decision-bar"><p>'+esc(r.summary)+'</p><div class="actions">'+(isBlocked?'<button class="secondary-button" type="button" data-action="next">See another role ↗</button>':'<button type="button" class="secondary-button '+(state.saved.has(r.id)?'is-saved':'')+'" data-action="save">'+(state.saved.has(r.id)?'Saved ✓':'Save for later')+'</button><button type="button" class="secondary-button" data-action="pass">Pass on role</button>')+'</div></div></article>';
}
function render(){renderList();renderDetail();}
function notify(message){const e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>e.classList.remove('show'),2800)}
function selectRole(id){if(!roles.some(r=>r.id===id))return;const apply=()=>{state.selected=id;state.draft=null;render();document.body.classList.add('detail-open');if(matchMedia('(max-width:760px)').matches)scrollTo({top:0,behavior:'instant'})};
 if(document.startViewTransition&&!matchMedia('(prefers-reduced-motion:reduce)').matches&&!matchMedia('(max-width:760px)').matches){document.startViewTransition(apply)}else apply();
}
function nextRole(){selectRole(roles[(idx(state.selected)+1)%roles.length].id)}
function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
function openDialog(id){const dialog=$(id==='results'?'resultsDialog':'preferencesDialog');if(dialog&&!dialog.open)dialog.showModal()}
function action(type){const r=current();
 if(type==='next'){nextRole();return}
 if(type==='preferences'){openDialog('settings');return}
 if(type==='confirm-region'){state.regionConfirmed.add(r.id);notify('Eligibility simulated for this example only');render();return}
 if(type==='save'){if(state.saved.has(r.id))state.saved.delete(r.id);else{state.saved.add(r.id);state.passed.delete(r.id)};notify(state.saved.has(r.id)?'Added to sample saved list':'Removed from saved list');render();return}
 if(type==='pass'){state.passed.add(r.id);state.saved.delete(r.id);notify('Role passed in this session');const list=filtered();if(list.length&&list.some(x=>x.id!==r.id)){selectRole(list.find(x=>x.id!==r.id).id)}else render();return}
 if(type==='prepare'){if(!state.approved.has(r.id)||blocked(r)||requiresVerify(r))return;state.draft=r.id;renderDetail();notify('Sample draft prepared — nothing submitted');return}
 if(type==='copy-draft'){const text=draftText(r);if(navigator.clipboard?.writeText){navigator.clipboard.writeText(text).then(()=>notify('Sample draft copied')).catch(()=>notify('Clipboard unavailable — select the draft text'))}else notify('Select the draft text to copy');return}
}
document.addEventListener('click',e=>{
 const role=e.target.closest('[data-role]');if(role){selectRole(role.dataset.role);return}
 const filter=e.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;renderList();return}
 const modal=e.target.closest('[data-modal]');if(modal){openDialog(modal.dataset.modal);return}
 if(e.target.closest('[data-close-dialog]')){closeDialogs();return}
 const btn=e.target.closest('[data-action]');if(btn){action(btn.dataset.action);return}
});
$('nextRole').addEventListener('click',nextRole);
$('backToList').addEventListener('click',()=>{document.body.classList.remove('detail-open');scrollTo({top:0,behavior:'instant'})});
$('roleSearch').addEventListener('input',e=>{state.q=e.target.value;renderList()});
$('remoteOnly').addEventListener('change',e=>{state.remoteOnly=e.target.checked;render();notify('Sandbox preference updated')});
$('approveClaim')?.addEventListener('change',e=>{});
document.addEventListener('change',e=>{if(e.target.id==='approveClaim'){if(e.target.checked)state.approved.add(state.selected);else{state.approved.delete(state.selected);state.draft=null}renderDetail()}});
document.querySelectorAll('.side-dialog').forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()}));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();$('roleSearch').focus()}if(e.key==='Escape'&&document.body.classList.contains('detail-open')&&!document.querySelector('dialog[open]'))document.body.classList.remove('detail-open')});
render();
})();