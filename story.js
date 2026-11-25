"use strict";
/* HB-WORLD-STORY-001 v0.1.0. Fictional dialogue and local journey journal.
   Draft names/art direction; never academic evidence or official level. */
(function(){
 const cast={
  bira:{name:"Bira",role:"Bidaiako laguna",description:"Zurekin esploratzen du, galderak egiten ditu eta behar duzunean laguntzen dizu."},
  lur:{name:"Lur",role:"Uharteetako kartografoa",description:"Bideak, paisaiak eta eguraldia behatzen ditu."},
  argi:{name:"Argi",role:"Artxiboko arduraduna",description:"Mezuak, dokumentuak eta ezkutuko arrastoak aztertzen ditu."},
  kai:{name:"Kai",role:"Topaketen antolatzailea",description:"Ideiak elkartu, aukerak alderatu eta taldeko planak prestatzen ditu."}
 };
 const chapters=[
  {id:"storm",character:"lur",number:1,clue:"Babeslekurako plana",summary:"Jaialdia prestatzen ari gara, baina eguraldia aldatu egin da. Lurrekin plan bat prestatu.",next:"message",
   scenes:["Hodeiak gerturatzen ari dira. Prest al daukagu ordezko planik?","Pentsa bi egoera desberdinetan. Zein izango litzateke aukera segurua?","Lehenik, prestaketak. Zein da ekintzen ordena?"],
   routeLines:{port:"Portuko aterpea aukeratu duzu. Topagunearen berri eman beharko diogu taldeari.",light:"Itsasargiko barruko gela aukeratu duzu. Taldeari plana azaldu beharko diogu."},
   bridge:"Jaialdirako plana prestatzen ari garela, itsasargian gutun-azal bat agertu da. Argi prest dago arrastoa ikertzeko."},
  {id:"message",character:"argi",number:2,clue:"Gutunaren arrastoa",summary:"Itsasargiko gutun-azalak bi toki aipatzen ditu. Argirekin mezuaren ordena argitu.",next:"festival",
   scenes:["Gutuneko arrastoak nahasita daude. Nondik hasiko gara?","Pista baten atzetik beste bat dator. Nola lotuko ditugu urratsak?","Orain, pentsa informazio hori entzun ez duen norbaitengan. Zer azalduko zenioke?"],
   routeLines:{library:"Liburutegiko arrastoa aukeratu duzu. Prestatu bilaketaren jarraibideak.",museum:"Museoko arrastoa aukeratu duzu. Prestatu bisitaren jarraibideak."},
   bridge:"Gutunaren arrastoak jaialdiko topaketari buruzkoak dira. Kaik gonbidapena eta jarduerak prestatu nahi ditu."},
  {id:"festival",character:"kai",number:3,clue:"Topaketaren gonbidapena",summary:"Kai eta Bira herriko topaketa antolatzen ari dira. Aukeratu eta azaldu plana.",next:null,
   scenes:["Taldea elkartuko da. Zer lortu nahi dugu jarduera honekin?","Ordutegia eta parte-hartzea adostu behar ditugu. Zein baldintza hartu behar dugu kontuan?","Besteen iritzia ere behar dugu. Nola egin galdera bi aukera aurkezteko?"],
   routeLines:{music:"Musika emanaldia aukeratu duzu. Parte-hartzaileei plana azaldu.",sport:"Joko eta kirol topaketa aukeratu duzu. Parte-hartzaileei plana azaldu."},
   bridge:"Itsasargiko seinalea piztu eta uharteen topaketa irudika dezakezu. Aukeratu beste bide bat edo itzuli koadernora."}
 ];
 function deepFreeze(o){if(o&&typeof o==="object"&&!Object.isFrozen(o)){Object.values(o).forEach(deepFreeze);Object.freeze(o)}return o}
 function chapter(id){return chapters.find(c=>c.id===id)||null}
 function scene(id,route,pos){const c=chapter(id);if(!c||!Object.hasOwn(c.routeLines,route)||!Number.isInteger(pos)||pos<0||pos>=c.scenes.length)return null;return {speaker:pos===2?cast.bira:cast[c.character],line:c.scenes[pos],routeLine:pos===0?c.routeLines[route]:null,chapter:c.number}}
 function journal(done,missions){const keys=new Set(Array.isArray(done)?done:[]);return chapters.map(c=>{const m=missions.find(x=>x.id===c.id);if(!m)return null;return {chapter:c,character:cast[c.character],mission:m,routes:m.routes.map(r=>({id:r.id,label:r.label,visited:keys.has(m.id+":"+r.id)})),practiceOnly:true}}).filter(Boolean)}
 window.HitzBiraStory=Object.freeze({version:"0.1.0",season:"Itsasargiaren sekretua",cast:deepFreeze(cast),chapters:deepFreeze(chapters),chapter,scene,journal});
})();
