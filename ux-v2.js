/* Progressive enhancement: preserves all existing app handlers and routes. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 let latest = null;
 let mounted = false;
 const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function buildShell() {
   if (mounted || !$('home')) return;
   mounted = true;
   const header = document.createElement('div');
   header.className = 'ux-appbar';
   header.innerHTML = '<span class="ux-brand"><span class="ux-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>career fit</span><span class="ux-appstatus" id="ux-status">Search setup</span>';
   document.body.insertBefore(header, document.body.firstChild);
   const home = $('home');
   const highlight = document.createElement('section');
   highlight.className = 'ux-next';
   highlight.id = 'ux-next';
   highlight.setAttribute('aria-label', 'Recommended next step');
   const top = home.querySelector('.top');
   top.after(highlight);
   const getSection = name => [...home.querySelectorAll(':scope > section.section')].find(s=>s.querySelector('.sectionTitle')?.textContent.trim()===name);
   const batch = getSection('Today’s batch'), verify = getSection('Needs verification'), queue = getSection('Queue');
   const strategy = getSection('Search strategy'),autopilot=getSection('Autopilot'),funnel=getSection('Weekly funnel');
   const metrics=home.querySelector(':scope > .metrics'),forecast=home.querySelector(':scope > .forecastCard'),analytics=home.querySelector('#analyticsBtn')?.parentElement;
   // Daily flows are above the fold; instrumentation and configuration stay available in details.
   let anchor = highlight;
   for(const el of [batch,verify,queue,metrics]){if(el){anchor.after(el);anchor=el}}
   if(batch)batch.querySelector('.sectionTitle').textContent='Recommended today';
   if(queue)queue.querySelector('.sectionTitle').textContent='More opportunities';
   const details=document.createElement('details');details.className='ux-secondary-details';details.id='ux-search-controls';
   const summary=document.createElement('summary');summary.textContent='Search activity and settings';details.append(summary);
   for(const el of [strategy,forecast,funnel,autopilot,analytics])if(el)details.append(el);
   anchor.after(details);
   const nav=document.createElement('nav');nav.className='ux-nav';nav.id='ux-nav';nav.setAttribute('aria-label','App sections');
   const items=[['today','⌂','Today'],['roles','▦','All roles'],['progress','◷','Progress'],['settings','⚙','Settings']];
   nav.innerHTML=items.map(([id,icon,label])=>`<button type="button" data-ux-nav="${id}" aria-label="${label}" aria-current="${id==='today'?'page':'false'}"><span aria-hidden="true">${icon}</span>${label}</button>`).join('');
   document.body.append(nav);
   nav.querySelectorAll('[data-ux-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.uxNav)));
 }
 function reveal(id){const el=$(id);if(el){if(el.closest('details'))el.closest('details').open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}}
 function navigate(page){
   if(document.body.classList.contains('pipelineMode'))return;
   const buttons=document.querySelectorAll('[data-ux-nav]');buttons.forEach(b=>b.setAttribute('aria-current',b.dataset.uxNav===page?'page':'false'));
   if(page==='today'){if(typeof view==='function')view('home');window.scrollTo({top:0,behavior:'smooth'})}
   else if(page==='roles'){if(typeof view==='function')view('home');reveal('queue')}
   else if(page==='progress'){if(typeof view==='function'&&$('analytics'))view('analytics');else{if(typeof view==='function')view('home');reveal('ux-search-controls')}}
   else if(page==='settings'){if(typeof view==='function'&&$('strategy'))view('strategy');else if(typeof view==='function'&&$('profile'))view('profile')}
 }
 function keyboardRows(){
  document.querySelectorAll('.jobrow').forEach(row=>{
   if(row.dataset.uxAccessible)return;
   row.dataset.uxAccessible='1';row.setAttribute('role','button');row.tabIndex=0;row.setAttribute('aria-expanded','false');
   row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();row.click()}});
   row.addEventListener('click',()=>{document.querySelectorAll('.jobrow').forEach(r=>r.setAttribute('aria-expanded',String(r.closest('.job')?.classList.contains('open'))))})
   const d=row.closest('.job')?.querySelector('.jobDetail');
   const jobId=row.dataset.job;
   const job=latest?.jobs?.find(j=>j.job_id===jobId);
   if(d && job && ['P0','P1','P2','LOW_COST'].includes((job.payload?.funnel||job.payload?.analysis?.funnel||{}).tier) && !window.Telegram?.WebApp?.MainButton && !d.querySelector('.ux-pack-inline')){
    const c=document.createElement('button');c.className='primaryBtn ux-pack-inline';c.type='button';c.textContent='Review application pack ↗';c.addEventListener('click',e=>{e.stopPropagation();if(typeof openPack==='function')openPack(jobId).catch(err=>window.alert(err?.message||'Could not open pack'))});d.append(c);
   }
  });
 }
 function nextFrom(data){
  if(!$('ux-next'))return;
  const next=(data?.funnel?.today_batch||[])[0];
  const verify=(data?.funnel?.verify||[])[0];
  const role=next||verify;
  const paused=!!data?.capabilities?.payment_required;
  const status=$('ux-status');
  if(status)status.textContent=paused?'Managed search paused':((data?.autopilot?.search_profiles||[]).length?'Search running':'Search not configured');
  const card=$('ux-next');
  if(role){
   const isReview=!next;
   const headline=escapeText(role.title||role.role||'Opportunity to review');
   const company=escapeText(role.company||'Company not specified');
   card.innerHTML=`<div class="ux-next-kicker">${isReview?'CHECK ELIGIBILITY':'YOUR NEXT BEST STEP'}</div><div class="ux-next-head">${headline}</div><p class="ux-next-sub">${company} · ${isReview?'A hard constraint needs verification before this role can proceed.':'Start with the strongest current recommendation. Review evidence before applying.'}</p><button type="button" class="ux-next-button">${isReview?'Review eligibility':'Review opportunity'} <span>↗</span></button>`;
   card.querySelector('button').addEventListener('click',()=>{if(typeof view==='function')view('home');if(typeof openJob==='function')openJob(role.job_id)});
  }else{
   card.innerHTML=`<div class="ux-next-kicker">YOUR SEARCH DESK</div><div class="ux-next-head">No action needed right now.</div><p class="ux-next-sub">No eligible recommendations are in the current batch. Career Fit won't make up roles to fill a quota.</p><button class="ux-next-button" type="button">View search settings <span>↗</span></button>`;
   card.querySelector('button').addEventListener('click',()=>navigate('settings'));
  }
  const sec=[...$('home').querySelectorAll('section.section')].find(s=>s.querySelector('.sectionTitle')?.textContent.trim()==='Needs verification');
  if(sec)sec.classList.toggle('ux-empty-verify',!(data?.funnel?.verify||[]).length);
  const head=$('headline');if(head)head.textContent='Your next move.';
  keyboardRows();
 }
 buildShell();
 // The original renderer remains the source of truth. This layer only changes presentation.
 if(typeof render === 'function'){
  const originalRender=render;
  render=function(data){latest=data;originalRender(data);buildShell();nextFrom(data)};
 }
 // Keep bottom tabs in sync when the original navigation changes views.
 if(typeof view === 'function'){
  const originalView=view;
  view=function(name){originalView(name);const bar=$('ux-nav');if(bar)bar.hidden=['onboarding','pipeline'].includes(name)};
 }
 if(typeof load === 'function' && !latest){/* original load already starts in the app */}
})();
