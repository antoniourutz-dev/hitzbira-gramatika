"use strict";
/* HB-WORLD 0.1: original fictional narrative wrappers, editorial review pending.
   Existing card IDs are practice references; no academic evidence or level claim. */
(function(){
const missions=[
 {id:"storm",area:"clause",tag:"ABENTURA · NATURA",title:"Ekaitza baino lehen",intro:"Hodeiak uharteen gainera hurbiltzen ari dira. Birak babesleku batera iristeko plana prestatu nahi du.",routes:[
 {id:"port",label:"Portuko aterpea",story:"Portuko aterpean elkartuko zarete. Bide segurua eta elkartzeko unea adostu.",final:"Asmatu lagun bati bidaltzeko mezu labur bat: non elkartu, zer egin aurretik eta zer egin euria egiten badu.",ending:"Portuko aterpearen plana prestatu duzu."},
 {id:"light",label:"Itsasargiko geltokia",story:"Itsasargiko barruko gelan egongo zarete. Eguraldiak plana aldatzen badu, beste aukera bat behar duzue.",final:"Azaldu taldeari itsasargira joateko plana eta ordezko aukera, baldintza bat eta denbora-lotura bat erabiliz.",ending:"Itsasargiko taldearentzako plana prestatu duzu."}],
 steps:[{id:"HB06-bal-01",title:"Prestatu ordezko plana",text:"Eguraldia aldatzen bada, zer egingo dugu? Praktikatu baldintza bat adierazteko modua."},{id:"HB07-kon-4",title:"Alderatu bi egoera",text:"Oztopo bat egonda ere, zer gerta liteke? Aztertu egituraren esanahia; segurtasuna lehenetsi istorioan."},{id:"HB06-den-02",title:"Ordenatu urratsak",text:"Zer gertatu behar da beste ekintza baten aurretik? Probatu denbora-lotura."}]},
 {id:"message",area:"text",tag:"MISTERIOA · HITZAK",title:"Galdutako mezua",intro:"Itsasargian gutun-azal bat aurkitu du Birak. Hiru pista ditu, baina mezuaren ordena argitu behar da.",routes:[
 {id:"library",label:"Liburutegiko arrastoa",story:"Gutuneko arrastoak liburutegira darama. Prestatu bilaketaren urratsak.",final:"Asmatu hiru jarraibide liburutegiko pista aurkitzeko. Lotu ideiak ordena argian.",ending:"Liburutegiko arrastoa antolatu duzu."},
 {id:"museum",label:"Museoko arrastoa",story:"Gutuneko arrastoak museora darama. Prestatu bilaketaren urratsak.",final:"Asmatu hiru jarraibide museoko pista aurkitzeko. Bukatu mezuaren laburpen batekin.",ending:"Museoko arrastoa antolatu duzu."}],
 steps:[{id:"HB08-lok-09",title:"Lehen pista",text:"Bilaketa nondik hasi adierazteko hitzak landu."},{id:"HB06-den-06",title:"Bigarren pista",text:"Ekintza baten eta hurrengoaren arteko lotura azkarra adierazi."},{id:"HB08-lok-10",title:"Azken pista",text:"Bilaketaren ondorioak laburbiltzeko baliabidea landu."}]},
 {id:"festival",area:"compare",tag:"KULTURA · ELKARLANA",title:"Jaialdiaren eguna",intro:"Uharteetako jendea elkartuko da. Birak jarduera bat aukeratzeko eta plana adosteko laguntza behar du.",routes:[
 {id:"music",label:"Musika emanaldia",story:"Musika emanaldia antolatuko duzue. Helburua eta ordutegia adostu.",final:"Asmatu lagunentzako gonbidapena: zertarako elkartu, noiz joan eta zein bi aukera dituzten.",ending:"Musika emanaldirako plana prestatu duzu."},
 {id:"sport",label:"Joko eta kirol topaketa",story:"Taldeko joko eta kirol topaketa antolatuko duzue. Helburua eta ordutegia adostu.",final:"Asmatu taldeari bidaltzeko gonbidapena: zertarako elkartu, garaiz iristeko baldintza eta bi aukera.",ending:"Topaketarako plana prestatu duzu."}],
 steps:[{id:"HB06-hel-01",title:"Adostu helburua",text:"Zertarako egingo duzue jarduera? Prestatu helburua adierazteko egitura."},{id:"HB06-bal-03",title:"Adostu baldintza",text:"Planak baldintza bat du. Praktikatu baldintzazko egitura."},{id:"HB08-lok-02",title:"Aukeratu elkarrekin",text:"Bi aukeren artean galdera bat egiteko baliabidea landu."}]}
];
function resolve(id,route,lookup){
 const m=missions.find(x=>x.id===id),r=m?.routes.find(x=>x.id===route);
 if(!m||!r||typeof lookup!=="function")return null;
 const cards=m.steps.map(s=>lookup(s.id));
 if(cards.some((c,i)=>!c||c.id!==m.steps[i].id)||new Set(cards.map(c=>c.id)).size!==cards.length)return null;
 return {mission:m,route:r,cards};
}
function completed(run,queue,pos,results){
 return !!(run&&run.queue===queue&&pos===queue.length&&queue.length===run.mission.steps.length&&Array.isArray(results)&&results.length===queue.length&&results.every((r,i)=>r.id===queue[i].id));
}
function freeze(x){if(x&&typeof x==="object"&&!Object.isFrozen(x)){Object.values(x).forEach(freeze);Object.freeze(x)}return x}
window.HitzBiraWorld=Object.freeze({version:"0.1.0",missions:freeze(missions),resolve,completed});
})();

/* P1.04: controlled sandbox adapter, no private WORLD drafts or academic evidence. */
function createWorldJourney(curriculum,adaptive,world){
 const policy="HB-WORLD/0.1.0-p1.04-sandbox";
 // Narrative thematic suggestions, NOT reviewed semantic curriculum crosswalks.
 const islands=Object.freeze({noun:Object.freeze(["IZE-1","DEK-1"]),verb:Object.freeze(["V-0","ADI-1"]),clause:Object.freeze([]),compare:Object.freeze([]),text:Object.freeze(["ORT-1","JOS-1"])});
 const themes=Object.freeze({storm:Object.freeze(["DEK-1","JOS-1"]),message:Object.freeze(["ORT-1","JOS-1"]),festival:Object.freeze(["IZE-1","V-0","ADI-1"])});
 const labels=Object.freeze({"IZE-1":"Izen-sintagma","DEK-1":"Deklinabidea","V-0":"NOR eta NOR-NORK","ADI-1":"Aditz-izena","ORT-1":"Ortografia","JOS-1":"Joskera"});
 const active=id=>!!curriculum.get(id)&&!!curriculum.route(id);
 const summarize=(ids,input={},agenda=null)=>ids.filter(active).map(id=>{const p=adaptive.profile(id,input),rows=(agenda?.agenda(input)||[]).filter(r=>r.node===id);return Object.freeze({id,label:labels[id]||id,seen:p.seen,total:p.total,review:p.review,compare:p.compare,written:p.written,due:rows.filter(r=>r.status==="due").length,scheduled:rows.filter(r=>r.status==="scheduled").length,academicEvidence:false})});
 const planFor=(ids,input={},agenda=null)=>{const allowed=ids.filter(active),plans=allowed.map(id=>adaptive.planFor(id,input)).filter(Boolean),due=allowed.map(id=>agenda?.plan(input,id)).filter(Boolean).sort((a,b)=>a.due-b.due||curriculum.get(a.node).ord-curriculum.get(b.node).ord);
 const repair=plans.find(p=>["review","compare"].includes(p.intent)),novel=plans.find(p=>p.intent==="unseen"&&p.node!==input.lastNode)||plans.find(p=>p.intent==="unseen");const p=repair||(input.lastIntent==="spaced"&&novel)||due[0]||plans[0]||null;
 return p&&allowed.includes(p.node)?Object.freeze({...p,worldPolicy:policy,academicEvidence:false,mode:"practice_only"}):null};
 const island=(id,input={},agenda=null)=>Object.freeze({id,rows:summarize(islands[id]||[],input,agenda),plan:planFor(islands[id]||[],input,agenda),open:Object.hasOwn(islands,id),academicEvidence:false});
 const mission=(id,input={},agenda=null)=>{const m=world.missions.find(x=>x.id===id);return m?Object.freeze({id,rows:summarize(themes[id]||[],input,agenda),plan:planFor(themes[id]||[],input,agenda),open:true,academicEvidence:false}):null};
 const context=(kind,id,input={},agenda=null)=>kind==="island"?island(id,input,agenda):kind==="mission"?mission(id,input,agenda):null;
 const outcome=(run,queue,pos,results)=>{if(!world.completed(run,queue,pos,results)||results.some(r=>!["match","incorrect","unverified"].includes(r.result)))return null;return Object.freeze({state:"visited",prepared:results.length,matching:results.filter(r=>r.result==="match").length,review:results.filter(r=>r.result==="incorrect").length,compare:results.filter(r=>r.result==="unverified").length,assisted:results.filter(r=>r.assisted===true).length,openTask:"not_observed",academicEvidence:false,validatedResolution:false})};
 return Object.freeze({policy,island,mission,context,outcome});
}
window.HitzBiraWorldJourney=createWorldJourney(window.HitzBiraCurriculum,window.HitzBiraAdaptive,window.HitzBiraWorld);
