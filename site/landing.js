/* The only animated homepage interaction changes substantive decision content. */
(()=>{
 const stages={
  screen:{index:'01',kicker:'01 — ELIGIBILITY',title:'Great on paper.<br>But can you actually take it?',body:'Location, hiring region and other hard constraints are evaluated before semantic matching. A blocked role never becomes a priority just because the keywords fit.',rows:[['Remote · Europe','PASS','use'],['Hybrid · Berlin','EXCLUDED','gap']]},
  prove:{index:'02',kicker:'02 — EVIDENCE REVIEW',title:'A good match<br>needs better proof.',body:'Requirements are mapped to work you can substantiate, claims that need confirmation and genuine gaps. Each category has a different next action.',rows:[['Owned product discovery','USE','use'],['Revenue accountability','CHECK','review'],['Specialist domain proof','GAP','gap']]},
  move:{index:'03',kicker:'03 — HUMAN DECISION',title:'Move forward.<br>Without making things up.',body:'Review an application-ready pack with clear sources. You approve outward claims and decide whether to submit. Outcomes become useful feedback instead of vanity metrics.',rows:[['Source-backed statements','READY','use'],['Unverified achievements','ON HOLD','review']]}
 };
 const buttons=[...document.querySelectorAll('[data-stage]')],slot=document.querySelector('#stageContent'),counter=document.querySelector('.feature-number');
 if(!slot||!buttons.length)return;
 buttons.forEach(b=>b.addEventListener('click',()=>{
  const s=stages[b.dataset.stage];if(!s)return;
  buttons.forEach(n=>n.setAttribute('aria-pressed',String(n===b)));
  counter.innerHTML=s.index+'<span>/03</span>';
  slot.style.animation='none';void slot.offsetWidth;slot.style.animation='';
  slot.innerHTML='<span class="stage-kicker">'+s.kicker+'</span><h3>'+s.title+'</h3><p>'+s.body+'</p><div class="stage-mini">'+s.rows.map(r=>'<div><span>'+r[0]+'</span><span class="proof-state '+r[2]+'">'+r[1]+'</span></div>').join('')+'</div>';
 }));
})();