(() => {
  const ATS_HOSTS = {
    greenhouse: /greenhouse\.io|boards\.greenhouse/i,
    lever: /lever\.co/i,
    ashby: /ashbyhq\.com/i,
    workday: /myworkdayjobs\.com|workday\.com/i
  };

  const fieldMap = [
    {key:"firstName", tests:[/first.?name/i,/given.?name/i]},
    {key:"lastName", tests:[/last.?name/i,/family.?name/i,/surname/i]},
    {key:"email", tests:[/^email$/i,/email.?address/i]},
    {key:"phone", tests:[/phone/i,/mobile/i]},
    {key:"linkedin", tests:[/linkedin/i]},
    {key:"website", tests:[/website/i,/portfolio/i,/personal.?site/i]},
    {key:"location", tests:[/location/i,/city/i]},
  ];

  function labelText(el){
    const id=el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    const parent=el.closest("label");
    return [
      id?.innerText,parent?.innerText,el.getAttribute("aria-label"),
      el.name,el.placeholder
    ].filter(Boolean).join(" ");
  }

  function setNativeValue(el,value){
    const proto=el.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    const desc=Object.getOwnPropertyDescriptor(proto,"value");
    desc?.set?.call(el,value);
    el.dispatchEvent(new Event("input",{bubbles:true}));
    el.dispatchEvent(new Event("change",{bubbles:true}));
  }

  async function autofill(){
    const {candidateProfile={}}=await chrome.storage.local.get("candidateProfile");
    let filled=0;
    document.querySelectorAll("input,textarea").forEach(el=>{
      if (el.type==="hidden" || el.disabled || el.readOnly || el.value) return;
      const label=labelText(el);
      for(const spec of fieldMap){
        if(spec.tests.some(rx=>rx.test(label)) && candidateProfile[spec.key]){
          setNativeValue(el,candidateProfile[spec.key]);filled++;break;
        }
      }
    });
    return filled;
  }

  chrome.runtime.onMessage.addListener((msg,_sender,sendResponse)=>{
    if(msg?.type==="CFA_AUTOFILL"){
      autofill().then(n=>sendResponse({filled:n}));
      return true;
    }
    if(msg?.type==="CFA_PAGE_SNAPSHOT"){
      sendResponse({
        url:location.href,title:document.title,
        text:document.body.innerText.slice(0,80000),
        ats:Object.entries(ATS_HOSTS).find(([,rx])=>rx.test(location.hostname))?.[0] || "unknown"
      });
    }
  });
})();