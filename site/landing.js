/* RoleHint motion direction: meaningful signal visualization, editorial scroll narrative,
   kinetic type and subtle pointer feedback. No scroll hijacking or animation dependencies. */
(()=>{
'use strict';
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const coarse=matchMedia('(pointer:coarse)').matches;
/* Three content-rich scenes in ONE work surface. They advance without user taps. */
const scenes=[
{id:'screen',index:'01',label:'01 — Eligibility',title:'First, remove<br>the noise.',body:'Check the non-negotiables before spending time on a match.',
html:`<div class="screen-context"><span>01 / ELIGIBILITY</span><span>CHECK FIRST</span></div>
<h4 class="screen-role">Senior Product<br>Manager</h4><p class="screen-location">Illustrative role · Europe</p>
<div class="screen-check"><span class="check-orb">✓</span><span>Remote in Europe</span><strong>ELIGIBLE</strong></div>
<div class="screen-check excluded"><span class="check-orb">×</span><span>Hybrid in Berlin</span><strong>EXCLUDED</strong></div>
<div class="screen-foot">Hard constraints before a match score. <span>↗</span></div>`},
{id:'prove',index:'02',label:'02 — Your fit',title:'Then, check<br>the fit.',body:'Spot the strengths you can show and the details worth asking about.',
html:`<div class="screen-context"><span>02 / YOUR FIT</span><span>REVIEW</span></div>
<h4 class="screen-role">Does it<br>fit you?</h4>
<p class="proof-preview-intro">Three things to check against your real experience.</p>
<div class="proof-preview-row"><span class="proof-preview-tag use">FIT</span><strong>Product discovery</strong><small>Potential match</small></div>
<div class="proof-preview-row"><span class="proof-preview-tag check">ASK</span><strong>Revenue ownership</strong><small>Clarify scope</small></div>
<div class="proof-preview-row"><span class="proof-preview-tag gap">GAP</span><strong>Sector experience</strong><small>Needs review</small></div>
<div class="proof-preview-end">See what's clear, and what's still unknown.</div>`},
{id:'move',index:'03',label:'03 — Your decision',title:'Finally, move<br>with confidence.',body:'You choose whether to review, verify first or skip. No automatic applications.',
html:`<div class="screen-context"><span>03 / NEXT STEP</span><span>YOU DECIDE</span></div>
<h4 class="screen-role">Your move.<br>Your choice.</h4>
<div class="draft-preview"><div class="draft-preview-top"><span>APPLICATION / EXAMPLE</span><span>NOT SENT</span></div>
<p>“My documented work includes end-to-end product discovery and cross-functional delivery…”</p>
<div class="draft-preview-approve"><span>✓</span><span>Claim reviewed by you</span></div></div>
<div class="screen-foot">Choose your role in the live demo. <span>↗</span></div>`}
];
const sceneRoot=document.getElementById('storyScene'),story=document.getElementById('how');
const controls=[...document.querySelectorAll('[data-story-stage]')],copyRoot=document.getElementById('storyCopy');
const stageDuration=6200;
let sceneIndex=0,storyVisible=false,stageTimer=null,manualHold=0;
function paintScene(index,{instant=false}={}){
 if(!sceneRoot)return;
 sceneIndex=(index+scenes.length)%scenes.length;
 const s=scenes[sceneIndex];
 document.getElementById('storyCurrentNumber').textContent=s.index;
 document.getElementById('storyStepLabel').textContent=s.label;
 document.getElementById('storyStepTitle').innerHTML=s.title;
 document.getElementById('storyStepBody').textContent=s.body;
 sceneRoot.innerHTML=s.html;
 sceneRoot.classList.remove('is-entering');void sceneRoot.offsetWidth;
 if(!reduce&&!instant)sceneRoot.classList.add('is-entering');
 if(copyRoot&&!reduce&&!instant){copyRoot.animate([{opacity:.3,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:560,easing:'cubic-bezier(.16,1,.3,1)'})}
 controls.forEach((button,i)=>{
   button.classList.toggle('is-active',i===sceneIndex);
   button.classList.toggle('is-complete',i<sceneIndex);
   button.setAttribute('aria-pressed',String(i===sceneIndex));
   const fill=button.querySelector('.story-progress-fill');
   if(fill&&i===sceneIndex){fill.style.animation='none';void fill.offsetWidth;fill.style.animation=''}
 });
}
function clearStageTimer(){if(stageTimer!==null){clearTimeout(stageTimer);stageTimer=null}}
function startStageTimer(){
 clearStageTimer();
 if(reduce||!storyVisible||document.hidden||sceneIndex===scenes.length-1)return;
 stageTimer=setTimeout(()=>{paintScene(sceneIndex+1);startStageTimer()},stageDuration);
}
controls.forEach(button=>button.addEventListener('click',()=>{
 const next=scenes.findIndex(x=>x.id===button.dataset.storyStage);
 if(next<0)return;
 manualHold=Date.now()+stageDuration;
 paintScene(next);
 startStageTimer();
}));
if(story&&'IntersectionObserver'in window){
 new IntersectionObserver(entries=>{
  const visible=entries[0].isIntersecting&&entries[0].intersectionRatio>.055;
  if(visible!==storyVisible){storyVisible=visible;if(visible)startStageTimer();else clearStageTimer()}
 },{threshold:[0,.06,.12,.3,.6]}).observe(story);
}else{storyVisible=true;startStageTimer()}
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearStageTimer();else startStageTimer()});
paintScene(0,{instant:true});
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
   ctx.strokeStyle=lit?'rgba(137,127,176,.30)':'rgba(95,98,115,.10)';ctx.lineWidth=lit?1.3:a.width;ctx.stroke();
   if(!reduce){
    const t=(time*.00013*a.speed+i*.137)%1,pos=bezier(p0,p1,p2,t);
    ctx.beginPath();ctx.arc(pos.x,pos.y,lit?2.5:1.2,0,Math.PI*2);
    ctx.fillStyle=lit?'rgba(137,127,176,.72)':'rgba(40,51,61,.25)';ctx.fill();
   }
  });
  for(let ring=2;ring>=0;ring--){
   ctx.beginPath();ctx.arc(center.x,center.y,ring*12+7+(reduce?0:Math.sin(time*.001+ring)*1.8),0,Math.PI*2);
   ctx.strokeStyle='rgba(137,127,176,'+(.1+(.15*(3-ring)/3))+')';ctx.lineWidth=.8;ctx.stroke();
  }
  ctx.beginPath();ctx.arc(center.x,center.y,5.5,0,Math.PI*2);ctx.fillStyle='#8175a7';ctx.fill();
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

// Chapter line announces the change of narrative context without blocking natural scrolling.
if(!reduce&&'IntersectionObserver'in window){
 const chapterWatcher=new IntersectionObserver(entries=>{
   for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-inview');chapterWatcher.unobserve(entry.target)}
 },{threshold:.16});
 document.querySelectorAll('.manifesto,.proof-section,.last-cta').forEach(el=>chapterWatcher.observe(el));
}
// Product stories are slides inside the orange chapter; swipe horizontally on mobile.
const storyVisual=document.getElementById('storyVisual'),storyExperience=document.getElementById('storyExperience');
if(storyVisual){
 let sx=0,sy=0;
 storyVisual.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){sx=e.clientX;sy=e.clientY}},{passive:true});
 storyVisual.addEventListener('pointerup',e=>{
  if(e.pointerType!=='touch')return;
  const dx=e.clientX-sx,dy=e.clientY-sy;
  if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.3){
   manualHold=Date.now()+stageDuration;
   paintScene(sceneIndex+(dx<0?1:-1));
   startStageTimer();
  }
 },{passive:true});
}
if(storyExperience)storyExperience.addEventListener('keydown',e=>{
 if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
 if(e.target.matches('a,input,textarea'))return;
 e.preventDefault();
 manualHold=Date.now()+stageDuration;
 paintScene(sceneIndex+(e.key==='ArrowRight'?1:-1));
 startStageTimer();
});
// Hover inertia follows reading intent: inspect a job -> move through its evidence.
if(!reduce&&!coarse){
 for(const el of document.querySelectorAll('.hero-art,.story-monitor')){
  let px=0,py=0,stamp=0;
  el.addEventListener('pointermove',e=>{
   const r=el.getBoundingClientRect(),nx=((e.clientX-r.left)/Math.max(1,r.width)-.5)*2,ny=((e.clientY-r.top)/Math.max(1,r.height)-.5)*2;
   const t=performance.now(),dt=Math.max(14,t-stamp),velocity=Math.min(2.3,Math.hypot(e.clientX-px,e.clientY-py)/dt);
   stamp=t;px=e.clientX;py=e.clientY;
   const scale=1+velocity*.35;
   el.style.setProperty('--hover-x',(nx*4*scale).toFixed(2)+'px');
   el.style.setProperty('--hover-y',(ny*4*scale).toFixed(2)+'px');
   el.style.setProperty('--hover-rx',(-ny*1.2*scale).toFixed(2)+'deg');
   el.style.setProperty('--hover-ry',(nx*1.4*scale).toFixed(2)+'deg');
   el.style.setProperty('--hover-rz',(nx*.55*scale).toFixed(2)+'deg');
  },{passive:true});
  el.addEventListener('pointerleave',()=>{
   for(const [key,val] of [['--hover-x','0px'],['--hover-y','0px'],['--hover-rx','0deg'],['--hover-ry','0deg'],['--hover-rz','0deg']])el.style.setProperty(key,val);
  });
 }
}


/* The stage monitor looks interactive, so clicking it actually advances the story. */
const monitor=document.querySelector('.story-monitor');
if(monitor){
 monitor.tabIndex=0;
 monitor.setAttribute('role','button');
 monitor.setAttribute('aria-label','Show the next step in the RoleHint walkthrough');
 const next=()=>{
   if(sceneIndex===scenes.length-1){location.href='./workspace.html';return;}
   paintScene(sceneIndex+1);startStageTimer();
 };
 monitor.addEventListener('click',e=>{if(e.target.closest('a,button'))return;next()});
 monitor.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();next()}
 });
}
})();