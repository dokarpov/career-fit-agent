/* RoleHint abyss: pixel-rendered volumetric fog, depth drift and pointer-cleared field.
   Canvas is visual only; CTA remains semantic HTML. No WebGL, no external assets. */
(()=>{'use strict';
const stage=document.getElementById('abyssStage'),canvas=document.getElementById('abyssCanvas');if(!stage||!canvas)return;
const context=canvas.getContext('2d',{alpha:false});if(!context)return;
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const cloudLayer=document.createElement('canvas');let width=0,height=0,dpr=1,raf=0,tick=0,active=false,pointer={x:0,y:0,tx:0,ty:0,energy:0},clouds=[],stars=[],lastTime=0;
const rand=(a,b)=>a+Math.random()*(b-a);
function size(){
 const b=stage.getBoundingClientRect(),oldW=width||b.width,oldH=height||b.height;
 width=Math.max(1,b.width);height=Math.max(1,b.height);dpr=Math.min(window.devicePixelRatio||1,1.5);
 canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);context.setTransform(dpr,0,0,dpr,0,0);
 if(!pointer.x){pointer.x=pointer.tx=width*.5;pointer.y=pointer.ty=height*.5}else{pointer.x*=width/oldW;pointer.tx*=width/oldW;pointer.y*=height/oldH;pointer.ty*=height/oldH}
 const count=Math.min(48,Math.max(24,Math.round(width*height/14500)));
 cloudLayer.width=Math.ceil(width*.55);cloudLayer.height=Math.ceil(height*.55);clouds=Array.from({length:count},(_,i)=>({x:rand(-.12,1.12)*width,y:rand(-.12,1.12)*height,r:rand(80,180)*(width<480?.72:1),depth:rand(.2,1),phase:rand(0,6.28),speed:rand(.05,.2),hue:i%4===0?'164,123,210':i%3===0?'104,78,156':'78,69,114'}));
 stars=Array.from({length:Math.min(130,Math.round(width*height/2700))},()=>({x:rand(0,width),y:rand(0,height),r:rand(.35,1.5),depth:rand(.2,1),phase:rand(0,6.28)}));
 draw(0);
}
function glow(x,y,r,rgba,alpha=1){
 if(r<=0)return;const g=context.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,'rgba('+rgba+','+(.34*alpha)+')');
 g.addColorStop(.35,'rgba('+rgba+','+(.16*alpha)+')');
 g.addColorStop(1,'rgba('+rgba+',0)');
 context.fillStyle=g;context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fill();
}
function draw(t){
 const w=width,h=height;
 context.fillStyle='#080711';context.fillRect(0,0,w,h);
 glow(w*.5,h*.52,Math.max(w,h)*.56,'93,69,130',.95);
 glow(w*.75,h*.2,Math.max(w,h)*.43,'57,51,107',.65);
 const now=t*.001;
 pointer.x+=(pointer.tx-pointer.x)*.08;pointer.y+=(pointer.ty-pointer.y)*.08;pointer.energy*=.968;
 for(const p of stars){
  let dx=(p.x-w*.5)*.025*p.depth*Math.sin(now*.16),dy=(p.y-h*.5)*.02*p.depth*Math.cos(now*.14);
  const gap=Math.hypot(p.x-pointer.x,p.y-pointer.y),push=Math.max(0,1-gap/160)*pointer.energy;
  dx+=(p.x-pointer.x)*push*.22;dy+=(p.y-pointer.y)*push*.22;
  context.globalAlpha=(.25+.5*(.5+.5*Math.sin(now*1.15+p.phase)))*p.depth;
  context.fillStyle='#ddd2fa';context.beginPath();context.arc(p.x+dx,p.y+dy,p.r,0,6.283);context.fill();
 }context.globalAlpha=1;
 // Render an offscreen cloud field, then erase a feathered opening at pointer.
 
 const cl=cloudLayer.getContext('2d');if(cl){
 const scale=cloudLayer.width/w;cl.setTransform(scale,0,0,scale,0,0);cl.clearRect(0,0,w,h);
 for(const c of clouds){
  const drift=reduce.matches?0:Math.sin(now*c.speed+c.phase)*16;
  const x=c.x+drift*c.depth,y=c.y+Math.cos(now*c.speed+c.phase)*13*c.depth;
  const r=c.r;const gr=cl.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,'rgba('+c.hue+','+(.18+.17*c.depth)+')');
  gr.addColorStop(.48,'rgba('+c.hue+','+(.10+.1*c.depth)+')');
  gr.addColorStop(1,'rgba('+c.hue+',0)');
  cl.fillStyle=gr;cl.fillRect(x-r,y-r,r*2,r*2);
 }
 const hole=cl.createRadialGradient(pointer.x,pointer.y,20,pointer.x,pointer.y,140+pointer.energy*155);
 hole.addColorStop(0,'rgba(0,0,0,1)');hole.addColorStop(.5,'rgba(0,0,0,.84)');hole.addColorStop(1,'rgba(0,0,0,0)');
 cl.globalCompositeOperation='destination-out';cl.fillStyle=hole;cl.fillRect(0,0,w,h);
 context.drawImage(cloudLayer,0,0,w,h);
 }
 glow(pointer.x,pointer.y,58+pointer.energy*110,'187,146,247',.25+pointer.energy*.45);
 const vignette=context.createRadialGradient(w*.5,h*.48,w*.1,w*.5,h*.48,w*.75);
 vignette.addColorStop(0,'rgba(6,5,13,0)');vignette.addColorStop(1,'rgba(6,5,13,.7)');
 context.fillStyle=vignette;context.fillRect(0,0,w,h);
}
function frame(t){if(!active)return;if(t-lastTime>28){tick+=1;draw(t);lastTime=t}raf=requestAnimationFrame(frame)}
function start(){if(active||reduce.matches)return;active=true;raf=requestAnimationFrame(frame)}
function stop(){active=false;cancelAnimationFrame(raf);draw(lastTime)}
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer.tx=e.clientX-r.left;pointer.ty=e.clientY-r.top;pointer.energy=Math.min(1,pointer.energy+.09);if(reduce.matches)draw(lastTime)},{passive:true});
stage.addEventListener('pointerdown',e=>{const r=stage.getBoundingClientRect();pointer.tx=e.clientX-r.left;pointer.ty=e.clientY-r.top;pointer.energy=1;if(reduce.matches)draw(lastTime)},{passive:true});
stage.addEventListener('pointerleave',()=>{pointer.tx=width*.5;pointer.ty=height*.5;pointer.energy*=.5});
const observer=new IntersectionObserver(e=>{e[0].isIntersecting&&!document.hidden?start():stop()},{threshold:.05});observer.observe(stage);
document.addEventListener('visibilitychange',()=>document.hidden?stop():start());
reduce.addEventListener?.('change',()=>reduce.matches?stop():start());
window.addEventListener('resize',size,{passive:true});size();
})();
