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
