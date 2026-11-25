/* HitzBira 1.6: optional manual account login, persistent learning journal. */
(function(){
"use strict";
const BASE="https://awdajwrzxceqazmaorxc.supabase.co",KEY="sb_publishable_USopGmel8SEMUckG1DoXTA_2-O0fQQk",RELEASE="hb-1.2-e461f43",STORE="hb-pilot-session-v1",META={"total":1867,"source":1867,"image":115,"synthetic":144,"counts":{"0-0":7,"0-1":7,"0-2":7,"0-3":7,"0-4":7,"0-5":7,"0-6":7,"0-7":7,"0-8":7,"0-9":7,"0-10":5,"1-0":40,"1-1":40,"1-2":40,"1-3":40,"1-4":40,"1-5":40,"1-6":40,"1-7":40,"1-8":40,"1-9":40,"1-10":28,"2-0":40,"2-1":40,"2-2":40,"2-3":40,"2-4":40,"2-5":40,"2-6":40,"2-7":40,"2-8":40,"2-9":40,"2-10":20,"3-0":88,"3-1":88,"3-2":88,"3-3":88,"3-4":88,"3-5":88,"3-6":88,"3-7":88,"3-8":88,"3-9":88,"3-10":64},"systems":[{"total":75,"zuka":64},{"total":428,"zuka":300},{"total":420,"zuka":292},{"total":944,"zuka":600}]},memo=new Map();
const SUFFIX="@hitzbira.app",ROLE="hitzbira_isolated",ENDPOINT=BASE+"/functions/v1/hitzbira-pilot-account";
let session=null,authorized=false,refreshing=null,starting=false;
function claims(token){try{const x=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(x.padEnd(Math.ceil(x.length/4)*4,"=")))}catch{return {}}}
function emailFor(value){const name=String(value||"").trim().toLowerCase();if(!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(name))throw Error("Egiaztatu erabiltzaile-izena.");return name+SUFFIX}
function saveSession(x,name){const c=claims(x.access_token||"");if(c.role!==ROLE||!c.sub||!String(c.email||"").endsWith(SUFFIX))throw Error("Kontu honek ez du HitzBira erabiltzeko baimenik.");session={access_token:x.access_token,refresh_token:x.refresh_token||session?.refresh_token||"",expires_at:x.expires_at||Date.now()/1000+x.expires_in,uid:c.sub,username:name||String(c.email).split("@")[0]};try{sessionStorage.setItem(STORE,JSON.stringify(session))}catch{}}
function clearSession(){authorized=false;session=null;memo.clear();try{sessionStorage.removeItem(STORE)}catch{}}
try{const x=JSON.parse(sessionStorage.getItem(STORE)||"null");if(x?.access_token){const c=claims(x.access_token);if(c.sub&&c.role===ROLE&&String(c.email||"").endsWith(SUFFIX)){session={...x,uid:c.sub,username:String(c.email).split("@")[0]}}else clearSession()}}catch{clearSession()}
function keyFor(k){return authorized&&session?.uid?k+"::hb::"+session.uid:k}
const streams=["hitzbira-unified-09","hitzbira-goal-v1","hitzbira-assessment-v1","hitzbira-journey-v1","sustrai-aditzak-v1","hitzbira-path-v1"];
const prev=new Map(),counterKeys=new Set(["n","ok","auto","unverified","attempts","correct"]);
let flushing=null,streak=null,syncError="",storageError="",retryAt=0,hydrated=false,sequence=0;
const copy=v=>JSON.parse(JSON.stringify(v)),eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b),obj=v=>v&&typeof v==="object"&&!Array.isArray(v);
function patch(before,after,path=[],stream=""){
 if(eq(before,after))return null;
 const k=path[path.length-1];
 // path scores are latest result, not additive; only their attempts are additive.
 const counts=stream==="hitzbira-unified-09"&&path.length===2&&["n","ok","auto","unverified"].includes(k)||stream==="sustrai-aditzak-v1"&&path.length===2&&["attempts","correct"].includes(k)||stream==="hitzbira-path-v1"&&path.length===3&&k==="attempts";
 if(counts&&Number.isInteger(after)&&after>=Number(before||0))return {t:"inc",v:after-Number(before||0)};
 if(Array.isArray(after)){const old=Array.isArray(before)?before:[];return {t:"union",v:after.filter(x=>!old.some(y=>eq(x,y)))}}
 if(obj(after)){const old=obj(before)?before:{},v={};for(const key of Object.keys(after)){if(["__proto__","constructor","prototype"].includes(key))continue;const p=patch(old[key],after[key],[...path,key],stream);if(p)v[key]=p}return Object.keys(v).length?{t:"obj",v}:null}
 return {t:"set",v:after===undefined?null:after};
}
function readLocal(k){try{const s=localStorage.getItem(k);return s===null?undefined:JSON.parse(s)}catch{return undefined}}
function outPrefix(){return "hb-outbox-1::"+session.uid+"::"}
function pending(){if(!authorized||!session)return [];const prefix=outPrefix(),rows=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith(prefix)){const e=readLocal(k);if(e?.id)rows.push({key:k,event:e});else storageError="Gordetako gertaera bat ezin da irakurri."}}return rows.sort((a,b)=>a.event.at.localeCompare(b.event.at)||(a.event.seq||0)-(b.event.seq||0)||a.event.id.localeCompare(b.event.id))}
const LOCAL_STREAK_KEY="hitzbira-streak-days-v1",DAY_LABELS=["Ig","Al","As","Az","Og","Or","Lr"];
const MINI_FLAME='<svg class="hb-flame-mini" viewBox="0 0 24 24" aria-hidden="true"><path class="fl-outer" d="M12.6 2.2c.3 3.2-1.9 5-3.2 6.8-1.4 1.9-2.4 3.5-2.4 5.7A5.8 5.8 0 0 0 12.8 20.5a5.9 5.9 0 0 0 5.9-6c0-3.3-2-5.8-3.3-7.4-.5 1.3-1.4 2-2.2 2.2.7-2.2.6-4.8-.6-7.1Z"/><path class="fl-core" d="M12.5 11.4c-.9 1.3-1.8 2.4-1.8 3.8a2.3 2.3 0 0 0 4.6 0c0-1.5-1.1-2.7-2.8-3.8Z"/></svg>';
function localToday(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function localStreak(){
 const today=localToday(),raw=readLocal(LOCAL_STREAK_KEY),list=Array.isArray(raw)?[...new Set(raw.filter(x=>typeof x==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(x)))].sort():[];
 const set=new Set(list),base=new Date(today+"T12:00:00Z");
 let current=0,cursor=base;
 if(!set.has(today))cursor=new Date(base.getTime()-86400000);
 while(set.has(cursor.toISOString().slice(0,10))){current++;cursor=new Date(cursor.getTime()-86400000)}
 let best=0,run=0,prevT=null;
 for(const s of list){const t=Date.parse(s+"T12:00:00Z");run=(prevT!==null&&Math.round((t-prevT)/86400000)===1)?run+1:1;if(run>best)best=run;prevT=t}
 return {current,best,total:list.length,days:list,today,local:true};
}
function touchLocalDay(details){
 if(authorized||!details||!["answer","verb_answer","assessment_answer","lab_answer"].includes(details.kind))return;
 const today=localToday(),raw=readLocal(LOCAL_STREAK_KEY),list=Array.isArray(raw)?raw.filter(x=>typeof x==="string"):[];
 if(!list.includes(today)){list.push(today);try{localStorage.setItem(LOCAL_STREAK_KEY,JSON.stringify(list.slice(-120)))}catch{}}
}
function clearLocalStreak(){try{localStorage.removeItem(LOCAL_STREAK_KEY)}catch{}paint()}
function paint(){
 const n=document.getElementById("hb-sync-status"),btn=document.getElementById("hb-streak-btn"),pop=document.getElementById("hb-streak-pop");
 if(n){
  if(!authorized){n.hidden=true}
  else{
   n.hidden=false;let count=0;try{count=pending().length}catch{storageError="Gailuko biltegia ez dago erabilgarri."}
   n.textContent=storageError?"⚠ "+storageError:count?"↻ "+count+" aldaketa gordetzeko"+(syncError?" · konexioaren zain":""):syncError?"⚠ "+syncError:hydrated?"✓ Supabasen gordeta":"Egiaztatzen…";
   n.className="hb-sync-status "+(storageError||syncError?"hb-sync-warning":count?"hb-sync-pending":"hb-sync-ok");
  }
 }
 if(!btn||!pop)return;
 const s=authorized?streak:localStreak();
 const countEl=document.getElementById("hb-streak-count"),sumEl=document.getElementById("hb-streak-summary"),bestEl=document.getElementById("hb-streak-best"),daysEl=document.getElementById("hb-streak-days"),footEl=document.getElementById("hb-streak-foot");
 if(!s){countEl.textContent="·";btn.classList.remove("lit","warm");sumEl.textContent="Bolada sinkronizatzen…";return}
 const days=new Set(s.days||[]),today=s.today||localToday(),litToday=days.has(today),cur=Number(s.current)||0,best=Number(s.best)||0,total=Number(s.total)||0;
 countEl.textContent=String(cur);
 btn.classList.toggle("lit",litToday);
 btn.classList.toggle("warm",!litToday&&cur>0);
 pop.classList.toggle("lit",litToday);
 btn.setAttribute("aria-label","Eguneroko bolada: "+cur+" egun"+(litToday?" · gaur piztuta":""));
 btn.title=cur?cur+" egun jarraian"+(litToday?" · gaur piztuta":" · piztu gaurko sua"):"Eguneroko bolada · piztu gaurko sua";
 const base=new Date(today+"T12:00:00Z");daysEl.replaceChildren();
 for(let i=6;i>=0;i--){
  const dt=new Date(base.getTime()-i*86400000),iso=dt.toISOString().slice(0,10),on=days.has(iso),dow=DAY_LABELS[dt.getUTCDay()];
  const cell=document.createElement("div");
  cell.className="hb-day-cell"+(on?" lit":"")+(i===0?" today":"");
  cell.title=iso+(on?" · landua":" · atseden");
  cell.innerHTML='<span class="hb-day-dot" aria-label="'+iso+(on?" · landua":" · atseden")+'">'+(on?MINI_FLAME:'<i></i>')+'</span><small>'+dow+'</small>';
  daysEl.append(cell);
 }
 sumEl.textContent=cur?cur+" egun jarraian":total?"Piztu gaurko sua berriro":"Piztu gaurko sua";
 bestEl.textContent=total?"Zure marka: "+best+" egun · "+total+" egun guztira":"Egun bakoitzeko ariketa bat nahikoa da.";
 footEl.textContent=authorized?"Zure bolada kontuan sinkronizatuta dago. Atseden hartzen baduzu, bihar berriro piztu dezakezu.":"Gailu honetan gordeta. Kontuarekin saioa hasita, beste gailuetan ere mantenduko da.";
}
function persistEvent(stream,p,details={}){
 if(!authorized||!session)return;
 const e={id:crypto.randomUUID(),stream,patch:p,details,at:new Date().toISOString(),seq:++sequence};
 try{localStorage.setItem(outPrefix()+e.id,JSON.stringify(e))}catch(err){storageError="Gailuan ezin izan da gorde. Ez itxi saioa; saiatu berriro.";paint();throw err}
 return e;
}
function save(k,value,details={}){
 if(!streams.includes(k))throw Error("Unknown stream");
 const old=prev.has(k)?prev.get(k):readLocal(keyFor(k));
 const next=copy(value),p=patch(old,next,[],k);
 // Durable journal first; never acknowledge a local save which was not written.
 if(authorized&&p)persistEvent(k,p,details);
 try{localStorage.setItem(keyFor(k),JSON.stringify(next));prev.set(k,next)}catch(e){storageError="Gailuko biltegia beteta dago.";paint();if(!authorized||!p)throw e}
 touchLocalDay(details);
 paint();
 if(authorized)void flush();
}
function activity(details){touchLocalDay(details);if(!authorized){paint();return}persistEvent("activity",{t:"set",v:null},details);paint();void flush()}
async function pull(){const result=await gateway({action:"learning_load"},await currentToken());if(!Array.isArray(result.state)||!result.streak)throw Error("Sinkronizazio-erantzuna ez da baliozkoa.");streak=result.streak;return result.state}
async function flush(){
 if(!authorized||!session)return;if(flushing)return flushing;
 const uid=session.uid;
 flushing=(async()=>{try{for(;;){const row=pending()[0];if(!row)break;const ack=await gateway({action:"learning_push",event:row.event},await currentToken());if(!ack.ok)throw Error("Gordetzea ez da baieztatu.");if(ack.streak)streak=ack.streak;
 // Only remove the durable event after a committed server ACK.
 if(session?.uid!==uid)return;localStorage.removeItem(row.key);paint()}
 syncError="";retryAt=0;paint();
 }catch(e){syncError=e.status===403?"Saioa berritu behar da.": "Sinkronizatu gabe · berriz saiatuko gara.";retryAt=Date.now()+5000;paint();throw e}})().catch(()=>{}).finally(()=>{flushing=null});return flushing;
}
async function hydrate(){
 if(!authorized)return;
 // Complete outstanding sends before replacing any projection with server state.
 await flush();if(pending().length)throw Error("Gordetzeke dauden aldaketak daude. Saiatu berriro Internetekin.");
 let state=await pull(),present=new Set(state.map(x=>x.stream));
 const empty=state.length===0,hasOwn=streams.some(k=>readLocal(keyFor(k))!==undefined),hasGuest=streams.some(k=>readLocal(k)!==undefined);
 const importGuest=empty&&!hasOwn&&hasGuest&&confirm("Gailu honetako gonbidatuaren jarduna zure kontura kopiatu? Zurea dela ziurtatu. Tokiko kopia mantenduko da.");
 for(const k of streams){const marker="hb-seed-1::"+session.uid+"::"+k;if(localStorage.getItem(marker))continue;const value=readLocal(keyFor(k))??(importGuest?readLocal(k):undefined);if(value!==undefined){persistEvent(k,{t:"seed",v:value},{kind:"legacy_baseline",appliedIfEmpty:!present.has(k)});localStorage.setItem(marker,"1")}}
 await flush();if(pending().length)throw Error("Gordetzeke dauden aldaketak daude. Saiatu berriro Internetekin.");
 state=await pull();for(const row of state){if(streams.includes(row.stream)){localStorage.setItem(keyFor(row.stream),JSON.stringify(row.payload));prev.set(row.stream,copy(row.payload))}}
 hydrated=true;paint();
}

function authError(msg,status){const e=Error(msg);e.status=status;return e}
async function tokenRequest(type,payload){const r=await fetch(BASE+"/auth/v1/token?grant_type="+type,{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});if(!r.ok)throw authError(r.status===429?"Saiakera gehiegi. Saiatu geroago.":"Egiaztatu erabiltzailea eta pasahitza.",r.status);return r.json()}
async function currentToken(){if(!session)throw authError("Hasi saioa berriro.",401);if(session.expires_at>Date.now()/1000+30)return session.access_token;if(!session.refresh_token)throw authError("Saioa iraungi da.",401);if(!refreshing)refreshing=(async()=>{const uid=session.uid;const x=await tokenRequest("refresh_token",{refresh_token:session.refresh_token});const c=claims(x.access_token||"");if(c.sub!==uid||c.role!==ROLE)throw authError("Saioa ez da baliozkoa.",403);saveSession(x);return session.access_token})().finally(()=>{refreshing=null});return refreshing}
async function gateway(body,token){const r=await fetch(ENDPOINT,{method:"POST",headers:{apikey:KEY,"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify(body),cache:"no-store"});const x=await r.json().catch(()=>({}));if(!r.ok)throw authError(x.error||"Zerbitzua ezin izan da erabili.",r.status);return x}
async function verify(){const token=await currentToken();const info=await gateway({action:"check"},token);if(!info.ok||info.release!==RELEASE||info.username!==session.username)throw authError("Kontuak ez du baimenik.",403);authorized=true}
async function signIn(name,password){const email=emailFor(name),x=await tokenRequest("password",{email,password});saveSession(x,email.split("@")[0]);try{await verify()}catch(e){clearSession();throw e}}
function lockAndReload(){clearSession();document.body.classList.add("hb-locked");location.reload()}
async function signOut(){const old=session;clearSession();document.body.classList.add("hb-locked");try{if(old?.access_token)await fetch(BASE+"/auth/v1/logout?scope=local",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+old.access_token},cache:"no-store",signal:AbortSignal.timeout(3000)})}catch{}location.reload()}
function cached(k,fn){if(!memo.has(k))memo.set(k,Promise.resolve().then(fn).catch(e=>{memo.delete(k);throw e}));return memo.get(k)}
function count(s,m){return Object.entries(META.counts).filter(([k])=>{let [x,y]=k.split("-").map(Number);return(s===-1||s===x)&&(m===-1||m===y)}).reduce((n,[,v])=>n+v,0)}
async function query(kind,expected,filter={}){if(!authorized)throw authError("Hasi saioa.",401);const offsets=[];for(let offset=0;offset<expected;offset+=100)offsets.push(offset);let rows=[];for(let i=0;i<offsets.length;i+=4){const token=await currentToken();const batch=await Promise.all(offsets.slice(i,i+4).map(async offset=>{const page=await gateway({action:"read",kind,offset,filter},token);if(!Array.isArray(page)||page.length!==Math.min(100,expected-offset))throw Error("Bankuaren osotasun-kontrolak huts egin du.");return page}));for(const page of batch)rows.push(...page)}return rows}
function validate(rows,n,predicate){if(rows.length!==n||new Set(rows.map(r=>r.ordinal)).size!==n||new Set(rows.map(r=>r.payload.id)).size!==n||!rows.every(r=>r.payload&&predicate(r.payload)))throw Error("Bankuaren osotasun-kontrolak huts egin du.");return rows.sort((a,b)=>a.ordinal-b.ordinal)}
function staticBlock(k){return cached("static:"+k,async()=>{const r=await fetch("/aditzak/data/"+k+".json");if(!r.ok)throw Error("Tokiko blokea ezin izan da kargatu.");return r.json()})}
function aux(s=-1,m=-1){let n=count(s,m);return cached("aux:"+s+":"+m,async()=>{if(!n)return [];let rows;const filter={};if(s!==-1)filter.partition_key="eq."+s;if(m!==-1)filter["payload->>m"]="eq."+m;
 if(authorized){try{rows=await query("aux",n,filter)}catch(e){if(e.status===401||e.status===403)throw e;}}
 if(!rows){const ks=Object.keys(META.counts).filter(k=>{const [x,y]=k.split("-").map(Number);return(s===-1||s===x)&&(m===-1||m===y)});rows=(await Promise.all(ks.map(staticBlock))).flat()}
 return validate(rows,n,d=>(s===-1||d.s===s)&&(m===-1||d.m===m)&&typeof d.form==="string"&&Array.isArray(d.roles))})}
function synthetic(){return cached("synthetic",async()=>{let rows;if(authorized){try{rows=await query("synthetic",META.synthetic)}catch(e){if(e.status===401||e.status===403)throw e}}return validate(rows||await staticBlock("synthetic"),META.synthetic,d=>typeof d.form==="string"&&typeof d.lemma==="string")})}
function grammar(n){if(!["decl","bank05","bank06","bank07","bank08"].includes(n))throw Error("Banku ezezaguna");return cached("grammar:"+n,async()=>{if(authorized){try{const rows=await query("grammar_bank",1,{record_id:"eq."+n});return rows[0].payload}catch(e){if(e.status===401||e.status===403)throw e}}const r=await fetch("/legacy/"+n+".js");if(!r.ok)throw Error("Bankua ezin izan da kargatu.");const m=(await r.text()).match(/^\s*const\s+(?:BANK|DATA)\s*=\s*([\s\S]*);\s*$/);if(!m)throw Error("Datu-formatua ez da zuzena.");return JSON.parse(m[1])})}
window.HBData={meta:META,count,aux,synthetic,grammar,isRemote:()=>authorized,release:RELEASE,keyFor,save,activity,flush,clearLocalStreak};
const form=document.getElementById("hb-login-form"),submit=document.getElementById("hb-login-submit"),msg=document.getElementById("hb-login-message"),status=document.getElementById("hb-account-name"),out=document.getElementById("hb-sign-out"),login=document.getElementById("hb-show-login"),close=document.getElementById("hb-login-close"),modal=document.getElementById("hb-login"),streakBtn=document.getElementById("hb-streak-btn"),streakPop=document.getElementById("hb-streak-pop");
function setStreakOpen(open){if(!streakBtn||!streakPop)return;streakPop.hidden=!open;streakBtn.setAttribute("aria-expanded",String(open))}
if(streakBtn&&streakPop){
 streakBtn.addEventListener("click",e=>{e.stopPropagation();setStreakOpen(streakPop.hidden)});
 document.addEventListener("click",e=>{if(!streakPop.hidden&&!streakPop.contains(e.target)&&!streakBtn.contains(e.target))setStreakOpen(false)});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!streakPop.hidden){setStreakOpen(false);streakBtn.focus()}});
}
function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement("script");script.src=src;script.onload=resolve;script.onerror=()=>reject(Error("Aplikazioa ezin izan da kargatu."));document.head.appendChild(script)})}
function showLogin(){modal.hidden=false;msg.textContent="";form.elements.identifier.focus()}
function hideLogin(){modal.hidden=true;form.reset();msg.textContent="";login.focus()}
async function start(){if(starting)return;starting=true;status.textContent=authorized?"Kaixo, "+session.username:"Gonbidatua";login.hidden=authorized;out.hidden=!authorized;paint();try{for(const src of ["/audit.js","/feedback.js","/aditzak/engine.js","/core.js","/world.js","/world-design.js","/story.js","/app.js"])await loadScript(src)}catch(e){document.getElementById("app").textContent=e.message;starting=false}}
function busy(on){submit.disabled=on;form.setAttribute("aria-busy",String(on));submit.textContent=on?"Saioa egiaztatzen…":"Sartu"}
login.onclick=showLogin;close.onclick=hideLogin;
out.onclick=async()=>{if(!confirm("Saioa itxi? Sinkronizatu gabeko jarduna gailu honetan mantenduko da."))return;await Promise.race([flush(),new Promise(resolve=>setTimeout(resolve,2500))]);const old=session;clearSession();try{if(old?.access_token)await fetch(BASE+"/auth/v1/logout?scope=local",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+old.access_token},cache:"no-store",signal:AbortSignal.timeout(2500)})}catch{}location.reload()};
form.onsubmit=async e=>{e.preventDefault();if(submit.disabled)return;busy(true);msg.textContent="";try{await signIn(form.elements.identifier.value,form.elements.password.value);location.reload()}catch(err){form.elements.password.value="";msg.textContent=err.status===403?"Ez duzu sartzeko baimenik. Jarri harremanetan arduradunarekin.":err.message||"Konexio-arazoa."}finally{busy(false)}};
window.addEventListener("online",()=>{if(authorized)void flush()});window.addEventListener("pagehide",()=>{if(authorized)void flush()});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&authorized)void flush()});setInterval(()=>{if(authorized&&Date.now()>=retryAt)void flush()},10000);
(async()=>{if(session){try{await verify();await hydrate()}catch(e){const reason=e.message||"Ezin izan da saioa egiaztatu.";clearSession();await start();showLogin();msg.textContent=reason;return}}await start()})();
})();