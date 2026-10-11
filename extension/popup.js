async function active(){return (await chrome.tabs.query({active:true,currentWindow:true}))[0]}
async function snap(){
 const tab=await active();
 return await chrome.tabs.sendMessage(tab.id,{type:"CFA_PAGE_SNAPSHOT"});
}
document.getElementById("save").onclick=async()=>{
 const res=await snap();
 const {careerFitApi="http://localhost:8000"}=await chrome.storage.local.get("careerFitApi");
 try{
   const r=await fetch(careerFitApi.replace(/\/$/,"")+"/me/jobs/ingest-url",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:res.url})});
   const data=await r.json();if(!r.ok)throw new Error(data?.detail?.error||data?.detail||"Could not analyse");
   await chrome.storage.local.set({lastSavedJob:data});document.getElementById("status").textContent=`Analysed: ${data.analysis.final_action}.`;
 }catch(e){
   await chrome.storage.local.set({lastSavedJob:res});document.getElementById("status").textContent="Saved locally; source analysis will retry when Career Fit is reachable.";
 }
};
document.getElementById("contact").onclick=async()=>{const res=await snap();if(!res.url.includes("linkedin.com/in/")){document.getElementById("status").textContent="Open a LinkedIn profile first.";return}await chrome.storage.local.set({lastSavedContact:res});document.getElementById("status").textContent="LinkedIn profile captured locally for review.";};
document.getElementById("fill").onclick=async()=>{const tab=await active();const res=await chrome.tabs.sendMessage(tab.id,{type:"CFA_AUTOFILL"});document.getElementById("status").textContent=`Filled ${res.filled} fields. Review before submit.`;};