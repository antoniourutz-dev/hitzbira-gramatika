"use strict";
/* Bira CORE: learner-facing world and provisional local practice selector. Never academic evidence. */
function createCore(){
 const worlds=Object.freeze(Object.fromEntries(Object.entries({
 noun:{name:"Izenen portua",mission:"Pertsonak, objektuak eta norabideak aurkitu."},
 verb:{name:"Aditzen harana",mission:"Ekintzak, denborak eta aukerak adierazi."},
 clause:{name:"Esaldien zubia",mission:"Ideiak elkartu eta azalpenak eraiki."},
 compare:{name:"Ideien bidegurutzea",mission:"Aukerak alderatu eta erabakiak arrazoitu."},
 text:{name:"Istorioen itsasargia",mission:"Mezu eta istorio argiak osatu."}
 }).map(([k,v])=>[k,Object.freeze(v)])));
 const pick=(input={})=>{
  const families=Array.isArray(input.families)?input.families.filter(f=>f&&typeof f.id==="string"):[];
  const ids=new Set(families.map(f=>f.id));
  const items=Array.isArray(input.items)?input.items.filter(i=>i&&typeof i.id==="string"&&ids.has(i.family)):[];
  const make=(type,title,why,family=null,id=null)=>Object.freeze({type,title,why,family,id,mode:"practice_only",academicEvidence:false});
  if(!families.length)return make("browse","Aurkitu hurrengo geltokia","Aukeratu esploratzeko uharte bat.");
  let i=items.find(x=>x.review===true);
  if(i)return make("review","Berreskuratu pista bat","Aurreko hautua eta bankuko eredua alderatuko dituzu.",i.family,i.id);
  i=items.find(x=>x.pending===true);
  if(i)return make("compare","Aztertu beste aukera bat","Argitu gabeko proposamen bat dago; ez da akats ziurtatua.",i.family,i.id);
  let f=families.find(x=>!x.explored&&!x.items)||families.find(x=>!x.items);
  if(f)return f.explored?make("practice","Egin lehen misioa","Esploratutako egiturak probatuko dituzu.",f.id):make("explore","Aurkitu toki berri bat","Oraindik ez dago geltoki honetako jardun-erregistrorik.",f.id);
  f=families.find(x=>!x.written);
  if(f)return make("write","Biraren erronka: idatzi","Saiatu eredua ikusi gabe; bat-etortzea praktika-adierazlea da.",f.id);
  if(input.assessmentAvailable===true)return make("assess","Espedizioa neure kabuz","Galdera bereiziak, pistarik gabe; proba orientagarria.");
  return make("practice","Sendotu aurkikuntzak","Aukeratu beste saio bat, zure erritmoan.",families[0].id);
 };
 return Object.freeze({version:"0.1.0",worlds,pick});
}
window.HitzBiraCore=createCore();
