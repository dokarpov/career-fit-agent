(()=>{'use strict';const guide=document.createElement('aside');guide.className='rh-first-guide';guide.hidden=true;guide.setAttribute('role','region');guide.setAttribute('aria-label','Guide to your first job decision');guide.innerHTML='<small>YOUR FIRST DECISION / SAMPLE DATA</small><h2>Start with one job.</h2><p>Choose a job from the list. We will show what the example proves, what is unknown, and what to do next. Your CV is not matched against these fictional roles.</p><button type="button" id="rhGuideStart">Review first job →</button><button type="button" id="rhGuideDismiss">Not now</button>';document.body.append(guide);
const show=()=>{guide.hidden=false;document.getElementById('rhGuideStart')?.focus()};const hide=()=>guide.hidden=true;
window.addEventListener('rolehint:first-decision',()=>{show()});
document.getElementById('rhGuideStart').addEventListener('click',()=>{hide();const list=document.querySelector('[data-role]');if(list){list.click();document.getElementById('roleTitle')?.scrollIntoView({block:'start',behavior:'auto'})}});
document.getElementById('rhGuideDismiss').addEventListener('click',hide);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!guide.hidden)hide()});
const clear=document.getElementById('rhClearPersonal');
clear?.addEventListener('click',()=>{
 if(!window.confirm('Delete the CV text and search preferences saved in this browser? This cannot be undone.'))return;
 try{localStorage.removeItem('rolehint_onboarding_v1');sessionStorage.removeItem('rolehint_sample_exploration')}catch(e){window.alert('Browser storage could not be cleared. Check site storage settings.');return}
 document.getElementById('personalBanner').hidden=true;
 document.getElementById('preferencesDialog')?.close();
 window.dispatchEvent(new Event('rolehint:open-onboarding'));
});
const open=()=>window.dispatchEvent(new Event('rolehint:open-onboarding'));
const add=()=>{const trigger=document.createElement('button');trigger.type='button';trigger.className='quiet-action';trigger.textContent='My experience';trigger.addEventListener('click',open);document.querySelector('.global-actions')?.prepend(trigger)};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add,{once:true});else add();
})();