// Interactive demonstration only. No live search, account, source, persistence or submission.
(function(){
'use strict';
const examples=[
 {id:'product',title:'Senior Product Manager',company:'Illustrative company',location:'Remote · EU',type:'ready',compensation:'Not disclosed',source:'Illustrative role — no live vacancy',
  summary:'A strong example of transferable product work. Review the provenance of the statements before using them.',
  evidence:'Led cross-functional product discovery',evidenceDetail:'Sample project case study; ownership is explicitly attributed to the candidate.',
  review:'Commercial responsibility and P&L scope',reviewDetail:'Adjacent experience is relevant but the ownership boundary needs confirmation.',
  gap:'Specialist industry background',gapDetail:'No verified domain-specific achievement in this example.'},
 {id:'lead',title:'Product Lead',company:'Illustrative company',location:'Remote · Europe',type:'verify',compensation:'Not disclosed',source:'Illustrative role — no live vacancy',
  summary:'There is relevant experience, but the region of employment is not confirmed. Do not assume work authorization is sufficient.',
  evidence:'Cross-functional product leadership',evidenceDetail:'Illustrative case study with defined team responsibilities.',
  review:'Employer hiring jurisdiction',reviewDetail:'Remote is stated, but eligible employment countries need confirmation.',
  gap:'Direct P&L ownership',gapDetail:'Not substantiated by this sample profile.'},
 {id:'hybrid',title:'Head of Product Strategy',company:'Illustrative company',location:'Hybrid · Berlin',type:'hybrid',compensation:'Not disclosed',source:'Illustrative role — no live vacancy',
  summary:'This opportunity conflicts with the sample remote-only preference. A strong topical match cannot override a hard constraint.',
  evidence:'Product strategy and planning',evidenceDetail:'Sample documented strategy work.',
  review:'Leadership scope',reviewDetail:'The level of decision authority still requires review.',
  gap:'On-site work requirement',gapDetail:'This is a hard constraint when remote-only is enabled.'}
];
const initialView=new URLSearchParams(location.search).get('view');
const state={view:['today','explore','progress','setup'].includes(initialView)?initialView:'today',filter:'all',q:'',remoteOnly:true,selected:'product',claim:false,showPack:false};
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const eligible=j=>!(j.type==='hybrid'&&state.remoteOnly);
const status=j=>!eligible(j)?['Outside preferences','block']:j.type==='verify'?['Verify first','warn']:['Worth reviewing',''];
const pill=j=>{const [label,kind]=status(j);return '<span class="pill '+kind+'">'+label+'</span>'};
const item=j=>'<button type="button" class="item-row" data-role="'+j.id+'"><span class="symbol">'+(j.type==='hybrid'?'H':j.type==='verify'?'L':'P')+'</span><span class="item-main"><strong>'+esc(j.title)+'</strong><small>'+esc(j.company)+' · '+esc(j.location)+'</small></span>'+pill(j)+'<span class="arrow" aria-hidden="true">↗</span></button>';
const head=(caption,title,lead)=>'<div class="overline">'+caption+'</div><h1 class="page-h1">'+title+'</h1><p class="lead">'+lead+'</p>';
function today(){const ready=examples[0],check=examples[1];return head('01 / YOUR DAILY DESK','Less scanning.<br><em>More deciding.</em>','A short view of the roles that deserve attention now. The wider pipeline stays out of your way.')+
 '<div class="focus"><div><div class="eyebrow">✳ &nbsp; YOUR NEXT BEST ACTION</div><h2>One promising role. One clear decision.</h2><p>There is evidence worth using, and an important claim worth checking. Start here rather than opening twenty tabs.</p><button class="primary" type="button" data-role="'+ready.id+'">Review the match <span>↗</span></button></div><aside><strong>01</strong><small>example role ready for evidence review</small></aside></div>'+
 '<div class="section-head"><h2>Needs your attention</h2><span class="quiet">2 illustrative decisions</span></div>'+
 '<div class="grid-two"><div><div class="overline" style="margin:0 0 13px">REVIEW NEXT</div>'+item(ready)+item(check)+'</div><div class="mini-tip"><span>BEHIND THE SCENES</span><strong>Your search continues between visits.</strong>Discover → check eligibility → compare requirements against evidence → prioritize. There is no need to configure these steps every day.<br><br><b>You</b> decide what can be claimed and when to submit.</div></div>';
}
function explore(){return head('02 / THE OCCASIONAL DEEP DIVE','The full picture.<br><em>On your terms.</em>','Open the broader queue when you want to investigate opportunities, adjust your direction, or look beyond the daily recommendations.')+
 '<div class="filter-row" role="group" aria-label="Filter sample roles">'+[['all','All roles'],['ready','Worth reviewing'],['verify','Needs verification'],['excluded','Outside preferences']].map(pair=>'<button class="filter" type="button" data-filter="'+pair[0]+'" aria-pressed="'+(state.filter===pair[0])+'">'+pair[1]+'</button>').join('')+'</div>'+
 '<label for="roleSearch" class="quiet" style="display:block;margin-bottom:6px">Search your shortlist</label><input class="search" id="roleSearch" type="search" placeholder="Title, location, employer…" value="'+esc(state.q)+'" autocomplete="off">'+
 '<div class="role-list" id="roleList"></div><p class="disclaimer">This example shows how a controlled shortlist behaves. It is not a current job board.</p>';
}
function showExploreList(){const slot=$('roleList');if(!slot)return;const q=state.q.toLowerCase();const list=examples.filter(j=>{const s=status(j)[1];return (state.filter==='all'||(state.filter==='ready'&&s==='')||(state.filter==='verify'&&s==='warn')||(state.filter==='excluded'&&s==='block'))&&[j.title,j.company,j.location].some(x=>x.toLowerCase().includes(q))});slot.innerHTML=list.length?list.map(item).join(''):'<div class="empty">No sample roles match those filters. Try “All roles”.</div>';}
function progress(){return head('03 / YOUR WEEKLY CHECK-IN','More signal.<br><em>Less guesswork.</em>','Review actual response patterns rather than assuming that sending more applications will improve outcomes.')+
 '<div class="overline" style="margin-bottom:12px">SAMPLE ACTIVITY · NOT A PERFORMANCE CLAIM</div>'+
 '<div class="metric-grid"><div class="metric"><strong>6</strong><span>illustrative applications sent</span></div><div class="metric"><strong>1</strong><span>illustrative employer responses</span></div><div class="metric"><strong>—</strong><span>insufficient data for a reliable trend</span></div></div>'+
 '<div class="grid-two" style="margin-top:20px"><div class="panel"><h3>Where effort went</h3><p>Sample breakdown by fit tier. Keep real observations separate from forecasts.</p>'+
 '<div class="bar-line"><span>Priority roles</span><div class="bar-track"><div class="bar-fill" style="width:66.67%"></div></div><strong>4</strong></div>'+
 '<div class="bar-line"><span>Other roles</span><div class="bar-track"><div class="bar-fill" style="width:33.33%"></div></div><strong>2</strong></div>'+
 '<p class="disclaimer">All numbers in this view are invented solely to show the analytical layout, not to suggest Career Fit has generated these outcomes.</p></div>'+
 '<div class="panel"><h3>What would change next week?</h3><p>With very little observed data, the product should show uncertainty rather than extrapolate an impressive success rate.</p><div class="mini-tip"><strong>Recommendation</strong>Keep your hard constraints. Gather more real response signals before changing the allocation between priority and speculative applications.</div></div></div>';
}
function setup(){return head('04 / OCCASIONAL SETUP','Your rules.<br><em>Not another chore.</em>','Specify non-negotiables once. Revisit them when your goals change—not every time you open the app.')+
 '<div class="grid-two"><div class="panel"><h3>Eligibility first</h3><p>Hard constraints act before any semantic matching score.</p>'+
 '<div class="setting"><span><strong>Remote only</strong><small>Exclude roles requiring on-site attendance</small></span><label class="switch"><input type="checkbox" id="remoteOnly" '+(state.remoteOnly?'checked':'')+' aria-label="Remote only"> <span>'+(state.remoteOnly?'On':'Off')+'</span></label></div>'+
 '<div class="setting"><span><strong>Hiring region</strong><small>Europe — example preference</small></span><span class="pill">Set</span></div>'+
 '<div class="setting"><span><strong>Salary floor</strong><small>Not specified in this demo</small></span><span class="pill warn">Unknown</span></div>'+
 '<div class="setting"><span><strong>Unsupported experience claims</strong><small>Always require explicit approval</small></span><span class="pill">Protected</span></div>'+
 '<p class="disclaimer">Changing Remote only updates the example role statuses immediately; no account setting or server data is changed.</p></div>'+
 '<div class="panel"><h3>Evidence sources</h3><p>Optional, consent-based connections power inference and source-backed claims in the real product.</p>'+
 '<div class="source-row"><span class="source-icon">G</span><span><strong>Google</strong><br>Example: inbox outcomes and Drive materials</span><span class="pill warn" style="margin-left:auto">Demo only</span></div>'+
 '<div class="source-row"><span class="source-icon">⌘</span><span><strong>GitHub</strong><br>Example: traceable project work</span><span class="pill warn" style="margin-left:auto">Demo only</span></div>'+
 '<div class="mini-tip" style="margin-top:12px"><strong>Your evidence remains yours.</strong>Career Fit should distinguish connected facts, inferred suggestions and manually approved claims. This demo does not request permissions.</div></div></div>';
}
const views={today,explore,progress,setup};
function render(){const content=$('content');content.innerHTML=views[state.view]();$('crumb').textContent=state.view.toUpperCase();document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===state.view;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});if(state.view==='explore')showExploreList();$('attentionCount').textContent=state.remoteOnly?'2':'2'}
function openRole(id){const j=examples.find(x=>x.id===id);if(!j)return;state.selected=id;state.showPack=false;state.claim=false;renderRole();$('roleDialog').showModal()}
function renderRole(){const j=examples.find(x=>x.id===state.selected);const blocked=!eligible(j);const warning=j.type==='verify';$('roleContent').innerHTML=
 '<div class="drawer-head"><div class="drawer-title"><div><div class="overline">SAMPLE / ROLE REVIEW</div><h2 id="roleDialogTitle">'+esc(j.title)+'</h2><p class="quiet">'+esc(j.company)+' · '+esc(j.location)+'</p></div><button class="close" type="button" data-close aria-label="Close role">×</button></div>'+pill(j)+'</div>'+
 '<div class="drawer-body"><p class="quiet">'+esc(j.summary)+'</p>'+
 (blocked?'<div class="callout"><strong>Eligibility blocker.</strong> This example requires hybrid attendance. Your remote-only preference rules it out; a fit score cannot override that setting.</div>':'')+
 '<div class="section-head"><h2>Requirement ↔ your evidence</h2></div>'+
 '<div class="proof"><small>01 / VERIFIED</small><strong>'+esc(j.evidence)+'</strong><p>'+esc(j.evidenceDetail)+'</p></div>'+
 '<div class="proof warn"><small>02 / HUMAN REVIEW</small><strong>'+esc(j.review)+'</strong><p>'+esc(j.reviewDetail)+'</p></div>'+
 '<div class="proof block"><small>03 / GAP OR CONSTRAINT</small><strong>'+esc(j.gap)+'</strong><p>'+esc(j.gapDetail)+'</p></div>'+
 (state.showPack?'<div class="section-head"><h2>Application pack preview</h2></div><p class="quiet">One example claim can be included only with explicit review.</p>'+
 '<label class="approve-line"><input type="checkbox" id="approveClaim" '+(state.claim?'checked':'')+'><span><strong>Include documented product claim</strong><br>Sample provenance: candidate-authored case study · ownership verified</span></label>'+
 '<div class="note-preview" id="recruiterNote"></div>'+
 '<p class="disclaimer">Draft only. No application is sent, and approval here is not stored.</p>':'')+
 '<div class="drawer-actions">'+(!blocked&&!state.showPack?'<button type="button" class="primary" data-pack>Prepare an evidence-backed preview ↗</button>':'')+
 '<button type="button" class="secondary" data-close>Close review</button></div>'+
 (blocked?'<p class="disclaimer">Change the Remote only example preference in Setup to see how eligibility reacts.</p>':'')+'</div>';
 updateNote()}
function updateNote(){const n=$('recruiterNote');if(!n)return;n.textContent=state.claim?'My work includes end-to-end product discovery, supported by a documented case study. I would welcome a conversation about how that experience could contribute to this role.':'Approve the documented claim above to preview a defensible recruiter introduction.'}
document.addEventListener('click',e=>{const v=e.target.closest('[data-view]');if(v){state.view=v.dataset.view;render();return}const filter=e.target.closest('[data-filter]');if(filter){state.filter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===filter)));showExploreList();return}const job=e.target.closest('[data-role]');if(job){openRole(job.dataset.role);return}if(e.target.closest('[data-close]')){$('roleDialog').close();return}if(e.target.closest('[data-pack]')){state.showPack=true;renderRole();$('approveClaim')?.focus();}});
document.addEventListener('input',e=>{if(e.target.id==='roleSearch'){state.q=e.target.value;showExploreList()}});
document.addEventListener('change',e=>{if(e.target.id==='remoteOnly'){state.remoteOnly=e.target.checked;render()}if(e.target.id==='approveClaim'){state.claim=e.target.checked;updateNote()}});
$('roleDialog').addEventListener('click',e=>{if(e.target===$('roleDialog'))$('roleDialog').close()});
render();
})();