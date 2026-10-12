/* RoleHint: one interactive story, three product decisions.
   Both counters and workflow tabs control the SAME state.
   Motion illustrates eligibility -> fit -> next action; never decorative looping. */
(()=>{'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const scenes=[
  {key:'screen',number:'01',step:'01 / ELIGIBILITY',
   title:'Check the<br>non-negotiables.',copy:'Work setup and hiring restrictions come first. If a hard rule fails, stop before preparing an application.',
   heroLabel:'01 / ELIGIBILITY',heroStatus:'Check the requirements first',
   heroMeta:'WORK SETUP',heroRight:'HARD REQUIREMENTS',
   rows:[['MATCH','Remote · Europe','use','The listed location meets this sample preference. Actual hiring countries still need checking.'],
         ['SKIP','Hybrid · Berlin','gap','An in-office requirement conflicts with a remote-only preference.'],
         ['ASK','Hiring countries','review','A remote label alone does not establish legal hiring eligibility.']]},
  {key:'prove',number:'02',step:'02 / YOUR FIT',
   title:'See where<br>you actually fit.',copy:'Check what your experience supports, what is unclear, and what you should ask before making claims.',
   heroLabel:'02 / YOUR FIT',heroStatus:'Compare experience with the role',
   heroMeta:'FIT CHECK',heroRight:'YOUR EXPERIENCE',
   rows:[['FIT','Product discovery','use','This requirement may match documented product work; check the specifics.'],
         ['ASK','Revenue ownership','review','Prioritizing work is not the same as owning revenue results.'],
         ['GAP','Sector experience','gap','Missing sector experience may or may not be essential. Verify the hiring criteria.']]},
  {key:'move',number:'03',step:'03 / NEXT ACTION',
   title:'Choose your<br>next move.',copy:'Review the opportunity, verify unknown details, or skip it. You approve every outward-facing claim.',
   heroLabel:'03 / YOUR NEXT STEP',heroStatus:'Verify before applying',
   heroMeta:'RECOMMENDATION',heroRight:'MAKE THE DECISION',
   rows:[['READY','Location preference','use','The sample role appears compatible with your work setup.'],
         ['VERIFY','Commercial scope','review','Ask whether revenue accountability is a strict requirement.'],
         ['NEXT','Review the details','use','Open the interactive workbench to inspect the next action.']]}
 ];
 const $=sel=>document.querySelector(sel);
 const tabs=[...document.querySelectorAll('[data-stage]')];
 const heroPrev=$('#decisionPrev'),heroNext=$('#decisionNext'),heroCounter=$('#decisionCounter');
 const heroLabel=$('#heroDecisionLabel'),heroVerdict=$('#heroDecisionVerdict'),heroRight=$('#heroDecisionCheckLabel'),heroChecks=$('#heroDecisionChecks'),heroContent=$('#heroDecisionContent');
 const stageSlot=$('#stageContent'),stageCounter=$('.feature-number'),stageTopCounter=$('#stageTopCounter');
 const hero=$('.hero'),workflow=$('#how');
 let current=0,timer=null,viewable=false,touched=false,scrollIdle=null,scrollActive=false;
 function stepMarkup(scene){
  return '<span class="stage-kicker">'+scene.step+'</span><h3>'+scene.title+'</h3><p>'+scene.copy+'</p>'+
   '<div class="stage-mini">'+scene.rows.map(([tag,label,kind])=>'<div><span>'+label+'</span><span class="proof-state '+kind+'">'+tag+'</span></div>').join('')+'</div>';
 }
 function checkMarkup(scene){
  return scene.rows.map(([tag,label,kind,info])=>
   '<details class="art-proof"><summary><span class="proof-state '+kind+'">'+tag+'</span><span>'+label+'</span><i aria-hidden="true">+</i></summary><p>'+info+'</p></details>'
  ).join('');
 }
 function animate(el){
  if(!el||reduced)return;
  el.classList.remove('rh-switched');requestAnimationFrame(()=>el.classList.add('rh-switched'));
 }
 function render(index,{initial=false,user=false}={}){
  current=Math.max(0,Math.min(scenes.length-1,index));
  if(user)touched=true;
  const scene=scenes[current];
  tabs.forEach((btn,i)=>{btn.setAttribute('aria-pressed',String(i===current));btn.dataset.active=i===current?'true':'false'});
  if(stageCounter)stageCounter.innerHTML=scene.number+'<span>/03</span>';
  if(stageTopCounter)stageTopCounter.textContent='STEP '+scene.number+' / 03';
  if(stageSlot){stageSlot.innerHTML=stepMarkup(scene);if(!initial)animate(stageSlot)}
  if(heroCounter)heroCounter.textContent=scene.number+' / 03';
  if(heroPrev)heroPrev.disabled=current===0;
  if(heroNext)heroNext.disabled=current===2;
  if(heroLabel)heroLabel.textContent=scene.heroLabel;
  if(heroRight)heroRight.textContent=scene.heroRight;
  if(heroVerdict)heroVerdict.innerHTML='<span class="art-check">'+(current===2?'?':'✓')+'</span>'+
    '<span>'+scene.heroStatus+'</span><span class="art-meta">'+scene.heroMeta+'</span>';
  if(heroChecks)heroChecks.innerHTML=checkMarkup(scene);
  if(!initial)animate(heroContent);
  planNext();
 }
 function planNext(){
  if(timer!==null){clearTimeout(timer);timer=null}
  if(reduced||!viewable||touched||document.hidden||scrollActive||current>=2)return;
  timer=setTimeout(()=>{if(!scrollActive&&!document.hidden)render(current+1)},6500);
 }
 tabs.forEach((b,i)=>b.addEventListener('click',()=>render(i,{user:true})));
 heroPrev?.addEventListener('click',()=>render(current-1,{user:true}));
 heroNext?.addEventListener('click',()=>render(current+1,{user:true}));
 for(const surface of [heroContent,stageSlot]){
  if(!surface)continue;
  let x=0,y=0;
  surface.addEventListener('touchstart',e=>{let t=e.touches[0];x=t.clientX;y=t.clientY},{passive:true});
  surface.addEventListener('touchend',e=>{
   let t=e.changedTouches[0],dx=t.clientX-x,dy=t.clientY-y;
   if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.45)render(current+(dx<0?1:-1),{user:true});
  },{passive:true});
 }
 if('IntersectionObserver' in window){
  const seen=new Map();
  const io=new IntersectionObserver(entries=>{
   entries.forEach(entry=>seen.set(entry.target,entry.intersectionRatio>=.22));
   viewable=[...seen.values()].some(Boolean);planNext();
  },{threshold:[0,.22,.45]});
  if(hero)io.observe(hero);
  if(workflow)io.observe(workflow);
 }else{viewable=true}
 document.addEventListener('visibilitychange',planNext);
 window.addEventListener('scroll',()=>{scrollActive=true;if(timer!==null){clearTimeout(timer);timer=null}clearTimeout(scrollIdle);scrollIdle=setTimeout(()=>{scrollActive=false;planNext()},450)},{passive:true});
 heroChecks?.addEventListener('toggle',e=>{if(e.target instanceof HTMLDetailsElement&&e.target.open){touched=true;planNext()}},true);
 render(0,{initial:true});
 if(!reduced&&'IntersectionObserver' in window){
  const els=document.querySelectorAll('.manifesto h2,.manifesto p,.section-intro h2,.section-intro>p,.proof-tile,.attention-grid>div,.last-cta h2');
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rh-visible');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -25px 0px'});
  els.forEach((el,i)=>{el.classList.add('rh-reveal');el.style.setProperty('--rh-delay',(i%3)*70+'ms');io.observe(el)});
 }
})();