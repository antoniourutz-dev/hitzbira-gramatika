'use strict';
/* P1.02 · Reference projection for synthetic tests only. Not wired to the pilot or trusted API. No real contract/assignment is approved by this module. P1.03 adds synthetic-only delayed retrieval. */
function projectEvidence(contract,assignments,events){
 // Reference reducer for a future TRUSTED server adapter. Inputs must already be
 // authenticated, versioned, reviewed and linked to the learner on the server.
 // Never expose this as an endpoint accepting browser-supplied approval flags.
 const policy="HB-ADAPT-001/0.1.0";
 const base={policy,state:"aztertu_gabe",eligibleEvents:0,cleanTasks:0,covered:[],missing:[],contrast:[],repair:[],autonomyAt:null,retentionSessions:0,retentionCovered:[],reason:"content_pending"};
 const nonempty=x=>typeof x==="string"&&x.trim().length>0;
 if(contract?.status!=="approved"||contract.policy!==policy||!nonempty(contract.capabilityVersionId)||!nonempty(contract.rubricVersion)||!Array.isArray(contract.criteria)||!contract.criteria.length)return base;
 const critical=contract.criteria.flatMap(c=>Array.isArray(c?.criticalComponents)?c.criticalComponents:[]);
 if(contract.criteria.some(c=>!nonempty(c?.code)||!Array.isArray(c.criticalComponents)||!c.criticalComponents.length)||new Set(contract.criteria.map(c=>c.code)).size!==contract.criteria.length||critical.some(x=>!nonempty(x))||new Set(critical).size!==critical.length)return base;
 const required=new Set(critical);
 const result={...base,missing:[...required],reason:"no_observation"};
 const map=new Map();
 for(const a of Array.isArray(assignments)?assignments:[]){
  if(!a||!nonempty(a.id))continue;
  if(map.has(a.id)){map.set(a.id,null);continue}
  if(a.status!=="approved"||a.capabilityVersionId!==contract.capabilityVersionId||a.rubricVersion!==contract.rubricVersion||!nonempty(a.itemId)||!nonempty(a.itemVersion)||!nonempty(a.contextFingerprint)||!nonempty(a.templateFingerprint)||!nonempty(a.exposureFamily)||!["selection","contrast","reconstruction","production","repair"].includes(a.mechanism)||!["diagnostic","practice","transfer","retrieval"].includes(a.phase)||!Array.isArray(a.components)||!a.components.length||a.components.some(c=>!required.has(c))||new Set(a.components).size!==a.components.length){map.set(a.id,null);continue}
  map.set(a.id,a);
 }
 const identities=new Map();
 for(const e of Array.isArray(events)?events:[]){
  if(!e||!nonempty(e.eventId))continue;
  // Identical replays are idempotent. Conflicting records with the same ID are
  // quarantined rather than selected by arrival order.
  const canonical=JSON.stringify({assignmentId:e.assignmentId,capabilityVersionId:e.capabilityVersionId,rubricVersion:e.rubricVersion,recordedAt:e.recordedAt,sessionId:e.sessionId,hintLevel:e.hintLevel,answerRevealed:e.answerRevealed,firstAttempt:e.firstAttempt,previousExposure:e.previousExposure,serverVerified:e.serverVerified,observations:Array.isArray(e.observations)?e.observations.map(o=>({component:o?.component,result:o?.result,classification:o?.classification,confirmed:o?.confirmed})).sort((a,b)=>String(a.component).localeCompare(String(b.component))):null});
  if(identities.has(e.eventId)){if(identities.get(e.eventId)?.canonical!==canonical)identities.set(e.eventId,null);continue}
  identities.set(e.eventId,{e,canonical});
 }
 const ordered=[...identities.values()].filter(Boolean).map(x=>x.e).filter(e=>e.serverVerified===true&&e.capabilityVersionId===contract.capabilityVersionId&&e.rubricVersion===contract.rubricVersion&&nonempty(e.sessionId)&&Number.isFinite(Date.parse(e.recordedAt))&&map.get(e.assignmentId)).sort((a,b)=>Date.parse(a.recordedAt)-Date.parse(b.recordedAt)||a.eventId.localeCompare(b.eventId));
 const exposure=new Set(),templates=new Set(),items=new Set(),contexts=new Set(),covered=new Set(),production=[],failures=new Map();
 const DAY=86400000;let everAutonomous=false,consolidating=false,anyObserved=false,autonomyAt=null,autonomySession=null,lastExposure=null,lastExposureSession=null,retention=[];
 for(const e of ordered){
  const a=map.get(e.assignmentId),itemKey=a.itemId+"@"+a.itemVersion;
  const fresh=!exposure.has(a.exposureFamily)&&!templates.has(a.templateFingerprint)&&!items.has(itemKey)&&!contexts.has(a.contextFingerprint);
  exposure.add(a.exposureFamily);templates.add(a.templateFingerprint);items.add(itemKey);contexts.add(a.contextFingerprint);
  const time=Date.parse(e.recordedAt),gap=lastExposure===null?0:time-lastExposure,previousSession=lastExposureSession;lastExposure=time;lastExposureSession=e.sessionId;
  const clean=fresh&&e.firstAttempt===true&&e.previousExposure===false&&e.hintLevel===0&&e.answerRevealed===false;
  if(!Number.isInteger(e.hintLevel)||e.hintLevel<0||e.hintLevel>5||typeof e.answerRevealed!=="boolean"||typeof e.firstAttempt!=="boolean"||typeof e.previousExposure!=="boolean"||!Array.isArray(e.observations))continue;
  const obs=new Map();let malformed=false;
  for(const o of e.observations){
   if(!o||!a.components.includes(o.component)||obs.has(o.component)||!["success","partial","failure","not_observed","unscorable"].includes(o.result)){malformed=true;break}
   obs.set(o.component,o);
  }
  if(malformed)continue;
  result.eligibleEvents++;
  const positive=[],negative=[];
  for(const c of a.components){
   const o=obs.get(c);if(!o||o.classification==="FROGA_ESKASA"||["not_observed","unscorable"].includes(o.result))continue;
   // A failure requires an explicit, confirmed diagnosis; a legitimate variant
   // or stylistic choice cannot become a negative observation.
   if(o.result==="failure"){
    if(o.confirmed!==true||!["ARAU_AKATSA","ERABILERA_DESDOITUA","AHULTASUN_DISKURTSIBOA"].includes(o.classification))continue;
    anyObserved=true;if(clean)negative.push(c);
   }else if(o.result==="success"){anyObserved=true;positive.push(c)}
   else if(o.result==="partial")anyObserved=true;
  }
  if(clean&&["production","reconstruction","repair"].includes(a.mechanism)){
   for(const c of negative){
    if(!failures.has(c))failures.set(c,new Set());
    failures.get(c).add(a.contextFingerprint);
   }
   for(const c of positive)failures.delete(c);
   if(positive.length)consolidating=true;
   if(a.mechanism==="production"&&positive.length===a.components.length){
    production.push({id:e.eventId,context:a.contextFingerprint,transfer:a.phase==="transfer"});
    positive.forEach(c=>covered.add(c));
   }
  }
  if(negative.length&&clean&&["production","reconstruction","repair"].includes(a.mechanism)){retention=[];if([...failures.values()].some(v=>v.size>=2)){autonomyAt=null;autonomySession=null}}
  // Retention requires previously earned autonomy, a genuinely delayed clean
  // new task, and a different session. No browser flags are authoritative.
  if(autonomyAt!==null&&failures.size===0&&a.phase==="retrieval"&&["production","reconstruction"].includes(a.mechanism)&&clean&&positive.length===a.components.length&&gap>=DAY&&e.sessionId!==previousSession&&e.sessionId!==autonomySession&&!retention.some(r=>r.session===e.sessionId))retention.push({session:e.sessionId,at:time,components:[...positive]});
  if(production.length>=2&&production.some(x=>x.transfer)&&critical.every(c=>covered.has(c))&&failures.size===0){everAutonomous=true;if(autonomyAt===null){autonomyAt=time;autonomySession=e.sessionId;retention=[]}}
 }
 const contrast=[...failures.keys()].sort(),repair=contrast.filter(c=>failures.get(c).size>=2);
 const retentionCovered=[...new Set(retention.flatMap(r=>r.components))].sort(),maintained=autonomyAt!==null&&!contrast.length&&retention.length>=2&&retention.slice(1).some(r=>r.at-autonomyAt>=7*DAY)&&critical.every(c=>retentionCovered.includes(c));
 return {...result,state:maintained?"finkatua":everAutonomous&&!repair.length?"autonomoa":consolidating?"sendotzen":anyObserved?"ikasten":"aztertu_gabe",cleanTasks:production.length,covered:[...covered].sort(),missing:critical.filter(c=>!covered.has(c)),contrast,repair,autonomyAt,retentionSessions:retention.length,retentionCovered,reason:repair.length?"focused_repair":contrast.length?"contrast_required":maintained?"retention_candidate":everAutonomous?"autonomy_candidate":anyObserved?"more_evidence":"no_observation"};
}
module.exports={projectEvidence};
