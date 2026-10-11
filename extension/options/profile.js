const fields=["firstName","lastName","email","phone","linkedin","website","location"];
const form=document.getElementById("form");
fields.forEach(k=>form.insertAdjacentHTML("beforeend",`<label>${k}</label><input id="${k}">`));
chrome.storage.local.get("candidateProfile").then(({candidateProfile={}})=>fields.forEach(k=>document.getElementById(k).value=candidateProfile[k]||""));
document.getElementById("save").onclick=async()=>{
 const p={};fields.forEach(k=>p[k]=document.getElementById(k).value.trim());
 await chrome.storage.local.set({candidateProfile:p});
 document.getElementById("status").textContent=" Saved.";
};