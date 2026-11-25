(function(){
const KEY="hitzbira-theme-v1",btn=document.getElementById("hb-theme-toggle"),meta=document.querySelector('meta[name="theme-color"]');
const moon='<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const sun='<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
function applyTheme(dark){document.documentElement.dataset.theme=dark?"dark":"light";if(meta)meta.content=dark?"#131120":"#5B3CC4";if(btn){btn.innerHTML=dark?sun:moon;btn.setAttribute("aria-pressed",String(dark));btn.setAttribute("aria-label",dark?"Modu argira aldatu":"Modu ilunera aldatu")}}
let saved=null;try{saved=localStorage.getItem(KEY)}catch{}
const mq=window.matchMedia("(prefers-color-scheme: dark)");
applyTheme(saved==="dark"||(saved!=="light"&&mq.matches));
if(btn)btn.addEventListener("click",()=>{const next=document.documentElement.dataset.theme!=="dark";try{localStorage.setItem(KEY,next?"dark":"light")}catch{}applyTheme(next)});
mq.addEventListener?.("change",e=>{try{if(!localStorage.getItem(KEY))applyTheme(e.matches)}catch{}});
if("serviceWorker" in navigator){navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"}).catch(()=>{});}
})();