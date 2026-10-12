/* RoleHint editorial interaction — one narrative, three meaningful product states.
   No fake clickable cards, no cursor follower, no generic floating decoration. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const stages=[
 {key:'screen',num:'01',label:'01 / ELIGIBILITY',
  title:'First, check<br>the basics.',
  copy:'Location, work setup and hiring limits matter before skills do. Stop early if a requirement does not fit.',
  rows:[['Remote · Europe','MATCH','use'],['Hybrid · Berlin','SKIP','gap']]},
 {key:'prove',num:'02',label:'02 / YOUR FIT',
  title:'Then, look<br>at your fit.',
  copy:'See where your work aligns with the job, what remains unclear and which requirements need a better example.',
  rows:[['Product discovery','FITS','use'],['Revenue responsibility','ASK','review'],['Sector specialism','GAP','gap']]},
 {key:'move',num:'03',label:'03 / YOUR MOVE',
  title:'Now, choose<br>what is next.',
  copy:'Review an opportunity, verify missing details or skip it. The final decision and every application stay yours.',
  rows:[['Eligible role','REVIEW','use'],['Hiring terms unclear','VERIFY','review']]}
];
const buttons=[...document.querySelectorAll('[data-stage]')];
const slot=document.getElementById('stageContent');
const counter=document.querySelector('.feature-number');
const story=document.getElementById('how');
const display=document.querySelector('.stage-card');
if(!slot||!buttons.length)return;
let current=0,timer=null,visible=false,engaged=false,swipeStart=null;
const sceneHTML=s=>'<span class="stage-kicker">'+s.label+'</span>'+
 '<h3>'+s.title+'</h3><p>'+s.copy+'</p><div class="stage-mini">'+
 s.rows.map(row=>'<div><span>'+row[0]+'</span><span class="proof-state '+row[2]+'">'+row[1]+'</span></div>').join('')+'</div>';
function render(index,{initial=false,manual=false}={}){
 current=Math.max(0,Math.min(stages.length-1,index));
 const s=stages[current];
 buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));
 if(counter)counter.innerHTML=s.num+'<span>/03</span>';
 slot.innerHTML=sceneHTML(s);
 slot.classList.remove('rh-switched');
 if(!initial&&!reduced){void slot.offsetWidth;slot.classList.add('rh-switched')}
 if(manual){engaged=true}
 schedule();
}
function schedule(){
 if(timer!==null){clearTimeout(timer);timer=null}
 if(reduced||!visible||engaged||document.hidden||current===2)return;
 timer=setTimeout(()=>render(current+1),5500);
}
buttons.forEach((button,i)=>button.addEventListener('click',()=>render(i,{manual:true})));
if(display){
 let x=0,y=0;
 display.addEventListener('touchstart',e=>{const t=e.touches[0];x=t.clientX;y=t.clientY},{passive:true});
 display.addEventListener('touchend',e=>{const t=e.changedTouches[0],dx=t.clientX-x,dy=t.clientY-y;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)render(current+(dx<0?1:-1),{manual:true});
 },{passive:true});
}
if(story&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(es=>{visible=es.some(e=>e.isIntersecting);schedule()},{threshold:.18});
 observer.observe(story);
}else{visible=true}
document.addEventListener('visibilitychange',schedule);
render(0,{initial:true});
if(!reduced&&'IntersectionObserver'in window){
 const reveals=document.querySelectorAll('.manifesto h2,.manifesto p,.section-intro h2,.section-intro>p,.proof-tile,.attention-grid>div,.last-cta h2');
 const io=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rh-visible');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -30px 0px'});
 reveals.forEach((el,i)=>{el.classList.add('rh-reveal');el.style.setProperty('--rh-delay',Math.min(i%3,2)*70+'ms');io.observe(el)});
}
})();
