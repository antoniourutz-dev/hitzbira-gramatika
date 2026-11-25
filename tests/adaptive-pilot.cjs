'use strict';
const fs=require('node:fs');
const path=require('node:path');
function runAdaptiveTests(src){
 const checks=[];function check(n,v){if(!v)throw Error("FAIL "+n);checks.push(n)}
 const win={};new Function("window",src["core.js"])(win);const a=win.HitzBiraAdaptive,g=win.HitzBiraCurriculum;
 const ref="GB-ize-01",keys=g.route("IZE-1").refs;
 const h=fields=>({attempts:{[ref]:{n:1,...fields}}}),all=fields=>({attempts:Object.fromEntries(keys.map(k=>[k,{n:1,...fields}]))});
 check("new learner",a.pick().node==="IZE-1"&&a.pick().intent==="unseen"&&!a.pick().academicEvidence);
 check("size bound",a.planFor("DEK-1",{size:99}).refs.length===6&&a.planFor("DEK-1",{size:2}).refs.length===2);
 check("missing not failure",a.profile("IZE-1",{}).unseen===3&&a.profile("IZE-1",{}).review===0);
 check("legacy unknown",a.profile("IZE-1",h({last:true})).unresolved===1);
 check("legacy false unverified",a.profile("IZE-1",h({last:false})).compare===1);
 check("targeted review",a.planFor("IZE-1",h({lastResult:"incorrect"})).refs[0]===ref&&a.planFor("IZE-1",h({lastResult:"incorrect"})).intent==="review");
 check("uncertainty not error",a.profile("IZE-1",h({lastResult:"unverified"})).review===0&&a.planFor("IZE-1",h({lastResult:"unverified"})).intent==="compare");
 check("prerequisite review",a.pick(h({lastResult:"incorrect"})).node==="IZE-1");
 check("novelty after repair",a.pick({...h({lastResult:"incorrect"}),lastNode:"IZE-1",lastIntent:"review"}).node==="V-0");
 check("novelty in same scoped route",a.pick({...h({lastResult:"incorrect"}),scope:["ize"],lastNode:"IZE-1",lastIntent:"review"}).intent==="unseen");
 check("scope not gated",a.pick({scope:["adi"]}).node==="ADI-1");
 check("nonpilot unavailable",a.planFor("V-2")===null&&!a.profile("V-2").available);
 check("choice to write",a.planFor("IZE-1",all({lastResult:"match",lastMode:"choose",lastAssisted:false})).exerciseMode==="write");
 check("assistance to practice",a.planFor("IZE-1",all({lastResult:"match",lastMode:"write",lastAssisted:true})).intent==="supported");
 check("written match not mastery",a.profile("IZE-1",all({lastResult:"match",lastMode:"write",lastAssisted:false})).academicState==="not_observed"&&a.planFor("IZE-1",all({lastResult:"match",lastMode:"write",lastAssisted:false}))===null);
 check("second untouched verb lesson",a.planFor("V-0",{lessonSignals:{"HB-L01":{practice:{total:5,correct:5,attempts:1}}}}).lesson==="HB-L02");
 const v0={lessonSignals:{"HB-L01":{practice:{total:5,correct:5,attempts:1}},"HB-L02":{practice:{total:5,correct:5,attempts:1}}}};
 check("recall action",a.planFor("V-0",v0).phase==="recall"&&a.planFor("V-0",v0).lesson==="HB-L01");
 check("verb mismatch provisional",a.profile("V-0",{lessonSignals:{"HB-L01":{recall:{total:5,correct:3,attempts:1}}}}).review===1&&a.profile("V-0",{lessonSignals:{"HB-L01":{recall:{total:5,correct:3}}}}).academicState==="not_observed");
 check("new practice after failed recall",a.planFor("V-0",{lessonSignals:{"HB-L01":{recall:{total:5,correct:2,date:"2026-11-24T10:00:00Z"},practice:{total:5,correct:5,date:"2026-11-25T10:00:00Z"}},"HB-L02":{recall:{total:5,correct:5}}}}).phase==="recall");
 const bank=p=>JSON.parse(src[p].match(/^\s*const\s+(?:BANK|DATA)\s*=\s*([\s\S]*);\s*$/)[1]);const fixtures=[...bank("legacy/bank05.js").cards,...bank("legacy/bank08.js").cards,...bank("legacy/decl.js").models.flatMap(m=>["NOR","NORK","NORI","NON","NORA","NONDIK"].filter(k=>m.forms[k]?.[0]).map(k=>({id:"D09-"+m.lemma+"-"+k+"-sg",family:"decl",answer:m.forms[k][0]})))];
 const names=["curriculumInput","startCurriculum","recommendation","followRecommendation","exercisePrompt","record"];const code=names.map(n=>src["app.js"].split("\n").find(x=>x.startsWith("function "+n+"("))).join("\n");
 const stub=`let h={},queue=[],pos=0,score=0,view=3,mode="choose",sessionResults=[],exam=null,learningGoal={area:"all",size:5,mode:"choose"},D={F:[]},catalogGroups=[],events=[],lessonState={},lessonSignals={},selected=null,hint=false,missing=false;const focusedPrompts={};
 window.HitzBiraVerbs={curriculumPractice:()=>lessonState,curriculumSignals:()=>lessonSignals};
 function allPracticeItems(){return missing?[]:fixtures}function leaveVerb(){return true}function confirm(){return true}function go(v){view=v;events.push(["go",v])}function openVerb(...a){events.push(["verb",...a])}function scrollTo(){}function next(){selected=null;hint=false;events.push(["next",queue.map(x=>x.id),mode])}function alert(m){events.push(["alert",m])}
 function familyEvidence(id){return {id}}function assessmentAvailable(){return []}function isReviewItem(){return false}function pendingItem(){return false}function catalogRoot(){}function startTarget(){}function catalogFamily(){}function startAssessment(){}function startAdventureFamily(){}function match(c,s){return c.answer===s}function save(){}function draw(){}
 ${code}
 return {recommendation,followRecommendation,startCurriculum,record,get:()=>({h,queue,mode,events,prompt:queue[pos]?exercisePrompt(queue[pos]):null}),set:(x)=>{if("queue" in x)queue=x.queue;if("h" in x)h=x.h;if("lessonSignals" in x)lessonSignals=x.lessonSignals;if("missing" in x)missing=x.missing;events=[]}}`;
 const ui=new Function("window","fixtures",stub)(win,fixtures);
 ui.followRecommendation();check("connected initial route",ui.get().queue.length===3&&ui.get().queue.every(x=>keys.includes(x.id))&&ui.get().mode==="choose");
 ui.record("not the reference");check("actual record mismatch signal",ui.get().h[ref].lastResult==="incorrect");
 ui.set({queue:[],h:all({lastResult:"match",lastMode:"choose",lastAssisted:false}).attempts});ui.startCurriculum("IZE-1",null,true);check("connected reconstruction",ui.get().mode==="write"&&ui.get().queue.length===1);
 ui.record("alternative");check("actual record unknown remains unverified",ui.get().h[ref].lastResult==="unverified");
 ui.set({queue:[],h:Object.fromEntries(g.route("ORT-1").refs.map(id=>[id,{n:1,lastResult:"match",lastMode:"choose",lastAssisted:false}]))});ui.startCurriculum("ORT-1",null,true);check("punctuation stimulus supplied",ui.get().mode==="write"&&ui.get().prompt.includes("ane etorri da pozik dago"));
 ui.set({queue:[],lessonSignals:v0.lessonSignals});ui.startCurriculum("V-0",null,true);check("connected specific recall phase",ui.get().events[0][5]==="HB-L01"&&ui.get().events[0][6]==="recall");
 ui.set({queue:[],missing:true,h:{}});ui.startCurriculum("IZE-1",null,true);check("missing reference fail closed",ui.get().events[0][0]==="alert");
 check("actual verb phase adapter",src["aditzak/engine.js"].includes('stage:opts.phase==="recall"?3:0')&&src["aditzak/engine.js"].includes("curriculumSignals()"));
 return checks;
}
const files=["core.js","app.js","aditzak/engine.js","legacy/bank05.js","legacy/bank08.js","legacy/decl.js"];
const src=Object.fromEntries(files.map(p=>[p,fs.readFileSync(path.join(__dirname,'..',p),'utf8')]));
const checks=runAdaptiveTests(src);for(const name of checks)console.log('PASS '+name);console.log(checks.length+' checks passed');
