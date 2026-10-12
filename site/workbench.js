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
let initialRemoteOnly=true;
try{const profile=JSON.parse(localStorage.getItem('rolehint_onboarding_v1')||'null');if(profile)initialRemoteOnly=profile.remote==='remote'}catch(e){}
const state={selected:'atlas',filter:'action',q:'',remoteOnly:initialRemoteOnly,regionConfirmed:new Set(),approved:new Set(),saved:new Set(),passed:new Set(),draft:null};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const idx=id=>roles.findIndex(r=>r.id===id);
const current=()=>roles.find(r=>r.id===state.selected)||roles[0];
const blocked=r=>r.type==='hybrid'&&state.remoteOnly;
const requiresVerify=r=>r.type==='verify'&&!state.regionConfirmed.has(r.id);
const status=r=>blocked(r)?['Outside rules','blocked']:state.passed.has(r.id)?['Passed','blocked']:state.saved.has(r.id)?['Saved','saved']:requiresVerify(r)?['Verify location','review']:['Review','ready'];
const statusMarkup=r=>{const [label,kind]=status(r);return '<span class="status-pill '+kind+'">'+esc(label)+'</span>'};
const proofLabel={use:'Supported',check:'To confirm',gap:'Missing'};
function filtered(){const q=state.q.trim().toLowerCase();return roles.filter(r=>{
 if(state.filter==='saved'&&!state.saved.has(r.id))return false;
 if(state.filter==='action'&&(blocked(r)||state.passed.has(r.id)||state.saved.has(r.id)))return false;
 return !q||[r.title,r.employer,r.location].some(x=>x.toLowerCase().includes(q));
});}
function listCard(r,i){
 const [label,kind]=status(r);
 return '<button class="role-card" type="button" data-role="'+esc(r.id)+'" aria-current="'+(state.selected===r.id)+'">'+
 '<span class="role-card-main"><strong class="role-name">'+esc(r.title)+'</strong><small class="role-company">'+esc(r.employer)+'</small>'+
 '<span class="role-location">'+esc(r.location)+'</span></span><span class="role-card-right"><span class="status-pill '+kind+'">'+esc(label)+'</span><span class="item-chevron" aria-hidden="true">›</span></span></button>';
}
function renderList(){const list=filtered();$('roleList').innerHTML=list.length?list.map(r=>listCard(r,idx(r))).join(''):'<div class="empty-list">No roles in this view.<br>Try All roles or change your search.</div>';
 $('needsCount').textContent=roles.filter(r=>!blocked(r)&&!state.passed.has(r.id)&&!state.saved.has(r.id)).length;
 $('savedCount').textContent=state.saved.size;
 $('resultsSaved').textContent=state.saved.size;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===state.filter)));
}
function evidenceItem(e,i){
 return '<details class="evidence-item"><summary><span class="proof-token '+e.type+'">'+proofLabel[e.type]+'</span>'+
 '<span class="evidence-label"><strong>'+esc(e.name)+'</strong><small>'+esc(e.caption)+'</small></span>'+
 '<span class="chev" aria-hidden="true">+</span></summary>'+
 '<div class="evidence-note">'+esc(e.detail)+'<p class="source">Source: '+esc(e.source)+'</p></div></details>';
}
function band(r){
 let title='Review before applying',note='Matches the sample location preference. Hiring eligibility is not guaranteed.',kind='ready';
 if(blocked(r)){title='Outside your preferences';note='This job requires office attendance. Your search is set to remote only.',kind='blocked'}
 else if(requiresVerify(r)){title='Check the hiring country';note='“Remote” does not confirm the employer can hire where you live.',kind='review'}
 return '<div class="eligibility-band '+kind+'"><div class="eligibility-copy"><strong>'+title+'</strong><p>'+note+'</p></div>'+
 '<span class="status-pill '+kind+'">'+(kind==='ready'?'Review':kind==='review'?'Verify':'Skip')+'</span></div>';
}
function draftText(r){const claim=r.evidence.find(e=>e.type==='use');return 'I would welcome the opportunity to discuss the '+r.title+' role. My documented project work includes '+claim.name.toLowerCase()+'. I can share the relevant case study and explain my actual responsibilities.\n\nI would also like to confirm the position’s specific requirements and the areas where my experience may differ.'}
function renderDetail(){
 const r=current(),isBlocked=blocked(r),needsVerify=requiresVerify(r),allow=!isBlocked&&!needsVerify;
 $('roleIndex').textContent=String(idx(r.id)+1).padStart(2,'0')+' / '+String(roles.length).padStart(2,'0');
 const nextStep=needsVerify?
 '<h3>Verify the hiring region</h3><p>The employer’s eligible countries are unknown in this example.</p>'+
 '<button type="button" class="primary-button" data-action="confirm-region">Simulate confirmation <span aria-hidden="true">→</span></button>'+
 '<small class="helper">Demo only. No employer was contacted.</small>'
 :isBlocked?
 '<h3>Not a match for your rules</h3><p>The on-site requirement conflicts with your preferences.</p>'+
 '<button type="button" class="primary-button" data-action="next">See next job <span aria-hidden="true">→</span></button>'
 :'<h3>Your next step</h3><p>Approve a claim only if you could substantiate it yourself.</p>'+
 '<label class="approval-label"><input id="approveClaim" type="checkbox" '+(state.approved.has(r.id)?'checked':'')+'><span>I verified this sample claim.</span></label>'+
 '<button type="button" class="primary-button" data-action="prepare" '+(!state.approved.has(r.id)?'disabled':'')+'>Preview application draft <span aria-hidden="true">→</span></button>'+
 (state.draft===r.id?'<div class="draft"><div class="draft-header"><strong>Draft preview</strong><span class="status-pill">Not sent</span></div>'+
 '<pre>'+esc(draftText(r))+'</pre><button class="secondary-button" type="button" data-action="copy-draft">Copy draft</button></div>':'');
 $('roleDetail').innerHTML='<article class="detail" data-current-role="'+esc(r.id)+'">'+
 '<div class="detail-head"><div><h2 id="roleTitle">'+esc(r.title)+'</h2><p>'+esc(r.employer)+' <span aria-hidden="true">·</span> '+esc(r.location)+'</p></div></div>'+
 band(r)+'<div class="review-layout"><section class="evidence-section" aria-label="Fit evidence">'+
 '<div class="section-heading"><h3>What does your experience support?</h3></div>'+
 '<div class="evidence-list">'+r.evidence.map(evidenceItem).join('')+'</div></section>'+
 '<aside class="next-step">'+nextStep+'</aside></div>'+
 '<div class="decision-bar"><p>Sample analysis. Nothing is submitted.</p><div class="actions">'+
 (isBlocked?'': '<button type="button" class="secondary-button '+(state.saved.has(r.id)?'is-saved':'')+'" data-action="save">'+(state.saved.has(r.id)?'Saved ✓':'Save job')+'</button>')+
 '<button type="button" class="quiet-link" data-action="pass">Pass</button></div></div></article>';
}
function render(){renderList();renderDetail();}
function notify(message){const e=$('toast');e.textContent=message;e.classList.add('show');clearTimeout(notify.timer);notify.timer=setTimeout(()=>e.classList.remove('show'),2800)}
function selectRole(id){if(!roles.some(r=>r.id===id))return;const apply=()=>{state.selected=id;state.draft=null;render();document.body.classList.add('detail-open');if(matchMedia('(max-width:760px)').matches)scrollTo({top:0,behavior:'instant'});else $('inspector').scrollTop=0};
 // Selection state must change synchronously: CSS animates the inspector afterwards.
 // A deferred View Transition callback can race with subsequent user interactions.
 apply();
}
function nextRole(){selectRole(roles[(idx(state.selected)+1)%roles.length].id)}
function closeDialogs(){document.querySelectorAll('dialog[open]').forEach(d=>d.close())}
function openDialog(id){const dialog=$(id==='results'?'resultsDialog':'preferencesDialog');if(dialog&&!dialog.open)dialog.showModal()}
function action(type){const r=current();
 if(type==='next'){nextRole();return}
 if(type==='preferences'){openDialog('settings');return}
 if(type==='confirm-region'){state.regionConfirmed.add(r.id);notify('Sample confirmation applied — not verified with an employer');render();return}
 if(type==='save'){if(state.saved.has(r.id))state.saved.delete(r.id);else{state.saved.add(r.id);state.passed.delete(r.id)};notify(state.saved.has(r.id)?'Added to sample saved list':'Removed from saved list');render();return}
 if(type==='pass'){state.passed.add(r.id);state.saved.delete(r.id);notify('Passed in this demo');const list=filtered();if(list.length&&list.some(x=>x.id!==r.id)){selectRole(list.find(x=>x.id!==r.id).id)}else render();return}
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
window.addEventListener('rolehint:profile-ready',()=>{try{const p=JSON.parse(localStorage.getItem('rolehint_onboarding_v1')||'null');if(p){state.remoteOnly=p.remote==='remote';$('remoteOnly').checked=state.remoteOnly;state.filter='action';render();notify('Search setup saved locally · sample roles only')}}catch(e){notify('Could not load saved preferences')}});
$('remoteOnly').checked=state.remoteOnly;
render();
})();