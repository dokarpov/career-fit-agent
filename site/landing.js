/* RoleHint motion direction: meaningful signal visualization, editorial scroll narrative,
   kinetic type and subtle pointer feedback. No scroll hijacking or animation dependencies. */
(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const coarse=matchMedia('(pointer:coarse)').matches;
const stages={
 screen:{index:'01',kicker:'01 — ELIGIBILITY',title:'Great on paper.<br>But can you actually take it?',body:'Location, hiring region and other hard constraints are evaluated before semantic matching. A blocked role never becomes a priority just because the keywords fit.',rows:[['Remote · Europe','PASS','use'],['Hybrid · Berlin','EXCLUDED','gap']]},
 prove:{index:'02',kicker:'02 — EVIDENCE REVIEW',title:'A good match<br>needs better proof.',body:'Requirements are mapped to work you can substantiate, claims that need confirmation and genuine gaps. Each category has a different next action.',rows:[['Owned product discovery','USE','use'],['Revenue accountability','CHECK','review'],['Specialist domain proof','GAP','gap']]},
 move:{index:'03',kicker:'03 — HUMAN DECISION',title:'Move forward.<br>Without making things up.',body:'Review an application-ready pack with clear sources. You approve outward claims and decide whether to submit. Outcomes become useful feedback instead of vanity metrics.',rows:[['Source-backed statements','READY','use'],['Unverified achievements','ON HOLD','review']]}
};
const buttons=[...document.querySelectorAll('[data-stage]')],slot=document.querySelector('#stageContent'),counter=document.querySelector('.feature-number'),story=document.querySelector('.product-section');
let active='screen',lastManual=0;
function stage(id,manual=false){const s=stages[id];if(!s||!slot||active===id&&!manual)return;active=id;if(manual)lastManual=performance.now();
 buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.stage===id)));
 if(counter)counter.innerHTML=s.index+'<span>/03</span>';
 slot.innerHTML='<span class="stage-kicker">'+s.kicker+'</span><h3>'+s.title+'</h3><p>'+s.body+'</p><div class="stage-mini">'+s.rows.map(r=>'<div><span>'+r[0]+'</span><span class="proof-state '+r[2]+'">'+r[1]+'</span></div>').join('')+'</div>';
 if(!reduce){slot.classList.remove('rh-switched');void slot.offsetWidth;slot.classList.add('rh-switched')}
}
buttons.forEach(b=>b.addEventListener('click',()=>{
 stage(b.dataset.stage,true);
 if(matchMedia('(min-width:1000px)').matches&&story){
  const n=['screen','prove','move'].indexOf(b.dataset.stage),dist=story.offsetHeight-innerHeight;
  if(dist>0){const target=window.scrollY+story.getBoundingClientRect().top+dist*(n===0?.1:n===1?.47:.87);window.scrollTo({top:target,behavior:reduce?'instant':'smooth'})}
 }
}));
/* Subtle editorial reveals. Content remains visible when JS fails. */
if(!reduce&&'IntersectionObserver'in window){
 document.documentElement.classList.add('rh-motion-ready');
 const items=document.querySelectorAll('.manifesto h2,.manifesto p,.section-intro h2,.section-intro>p,.proof-tile,.attention-grid>div,.attention-row,.last-cta h2,.hero-art');
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('rh-visible');observer.unobserve(e.target)}},{threshold:.13,rootMargin:'0px 0px -35px 0px'});
 items.forEach((el,i)=>{el.classList.add('rh-reveal');el.style.setProperty('--rh-delay',(i%3)*65+'ms');observer.observe(el)});
}
const progress=document.querySelector('#scrollLine');
let rafScroll=0;
function updateScroll(){
 rafScroll=0;
 const scrollMax=Math.max(1,document.documentElement.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,scrollY/scrollMax));
 if(progress)progress.style.transform='scaleX('+p+')';
 const hero=document.querySelector('.hero');
 if(hero&&hero.getBoundingClientRect().bottom>0)hero.style.setProperty('--hero-drift',Math.min(1,scrollY/Math.max(1,innerHeight)).toFixed(3));
 if(story&&innerWidth>=1000&&performance.now()-lastManual>1200){
  const rect=story.getBoundingClientRect(),distance=story.offsetHeight-innerHeight;
  if(distance>50&&rect.top<=120&&rect.bottom>=innerHeight*.4){
    const t=Math.min(1,Math.max(0,(120-rect.top)/distance));
    const desired=t<.32?'screen':t<.69?'prove':'move';
    if(desired!==active)stage(desired);
  }
 }
}
addEventListener('scroll',()=>{if(!rafScroll)rafScroll=requestAnimationFrame(updateScroll)},{passive:true});addEventListener('resize',updateScroll,{passive:true});updateScroll();
/* Real-time editorial signal field: many noisy paths converge into a smaller set
   of defensible decisions. Rendered with Canvas 2D, no textures or stock assets. */
const canvas=document.querySelector('#signalField'),ctx=canvas?.getContext('2d',{alpha:true});
if(canvas&&ctx){
 let w=0,h=0,dpr=1,frame=0,running=true,visible=true,ptr={x:.6,y:.45},smooth={x:.6,y:.45},last=0;
 const arcs=Array.from({length:27},(_,i)=>({seed:i,a:(i*.61803398875)%1,b:(i*.354877666)%1,speed:.17+(i%8)*.031,width:i%4===0?1.25:.7}));
 function resize(){const rect=canvas.getBoundingClientRect();w=rect.width;h=rect.height;dpr=Math.min(2,devicePixelRatio||1);canvas.width=Math.max(1,Math.round(w*dpr));canvas.height=Math.max(1,Math.round(h*dpr));ctx.setTransform(dpr,0,0,dpr,0,0)}
 function bezier(p0,p1,p2,t){const i=1-t;return {x:i*i*p0.x+2*i*t*p1.x+t*t*p2.x,y:i*i*p0.y+2*i*t*p1.y+t*t*p2.y}}
 function draw(time){
  if(!w||!h)return;ctx.clearRect(0,0,w,h);
  smooth.x+=(ptr.x-smooth.x)*.045;smooth.y+=(ptr.y-smooth.y)*.045;
  const center={x:w*(.55+(smooth.x-.5)*.075),y:h*(.51+(smooth.y-.5)*.09)};
  const pulse=reduce?0:Math.sin(time*.0008)*3;
  ctx.lineCap='round';ctx.lineJoin='round';
  arcs.forEach((a,i)=>{
   const sy=h*(.045+.89*a.a),sx=w*(-.08+.15*a.b);
   const ty=center.y+(i-13)*3.25+pulse,tx=center.x+(i-13)*2.4;
   const p0={x:sx,y:sy},p1={x:w*(.22+a.b*.31),y:sy+(ty-sy)*(.4+a.b*.12)},p2={x:tx,y:ty};
   const lit=i%5===0||i%7===0;
   ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.quadraticCurveTo(p1.x,p1.y,p2.x,p2.y);
   ctx.strokeStyle=lit?'rgba(238,88,56,.30)':'rgba(23,27,34,.10)';ctx.lineWidth=lit?1.3:a.width;ctx.stroke();
   if(!reduce){
    const t=(time*.00013*a.speed+i*.137)%1,pos=bezier(p0,p1,p2,t);
    ctx.beginPath();ctx.arc(pos.x,pos.y,lit?2.5:1.2,0,Math.PI*2);
    ctx.fillStyle=lit?'rgba(238,88,56,.72)':'rgba(40,51,61,.25)';ctx.fill();
   }
  });
  for(let ring=2;ring>=0;ring--){
   ctx.beginPath();ctx.arc(center.x,center.y,ring*12+7+(reduce?0:Math.sin(time*.001+ring)*1.8),0,Math.PI*2);
   ctx.strokeStyle='rgba(238,88,56,'+(.1+(.15*(3-ring)/3))+')';ctx.lineWidth=.8;ctx.stroke();
  }
  ctx.beginPath();ctx.arc(center.x,center.y,5.5,0,Math.PI*2);ctx.fillStyle='#ee5838';ctx.fill();
 }
 function tick(t){if(!running)return;if(!visible){frame=requestAnimationFrame(tick);return}if(!reduce||!last){draw(t);last=t}if(!reduce)frame=requestAnimationFrame(tick)}
 canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();ptr.x=(e.clientX-r.left)/r.width;ptr.y=(e.clientY-r.top)/r.height},{passive:true});
 if('ResizeObserver'in window){new ResizeObserver(resize).observe(canvas)}else addEventListener('resize',resize);
 if('IntersectionObserver'in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting},{threshold:0}).observe(canvas);
 document.addEventListener('visibilitychange',()=>{visible=!document.hidden});
 resize();frame=requestAnimationFrame(tick);
 addEventListener('pagehide',()=>{running=false;cancelAnimationFrame(frame)},{once:true});
}
/* Native cursor remains visible; companion marker only adds directional feedback. */
const cursor=document.getElementById('rhCursor');if(cursor&&!reduce&&!coarse){
 let x=-80,y=-80,tx=-80,ty=-80,shown=false,anim=0;
 function move(){x+=(tx-x)*.17;y+=(ty-y)*.17;cursor.style.transform='translate3d('+(x-11)+'px,'+(y-11)+'px,0)';anim=requestAnimationFrame(move)}
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(!shown){shown=true;cursor.classList.add('active')}} ,{passive:true});
 document.querySelectorAll('a,.feature-nav button').forEach(el=>{el.addEventListener('pointerenter',()=>cursor.classList.add('over-link'));el.addEventListener('pointerleave',()=>cursor.classList.remove('over-link'))});
 move();addEventListener('pagehide',()=>cancelAnimationFrame(anim),{once:true});
}
/* Small magnetic travel responds to pointer velocity, never hijacks click targets. */
if(!reduce&&!coarse)document.querySelectorAll('.hero-actions .button,.cta-bottom .button').forEach(el=>{
 el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const dx=(e.clientX-r.left-r.width/2)*.055,dy=(e.clientY-r.top-r.height/2)*.095;el.style.translate=dx.toFixed(1)+'px '+dy.toFixed(1)+'px'});
 el.addEventListener('pointerleave',()=>{el.style.translate='0 0'});
});
})();