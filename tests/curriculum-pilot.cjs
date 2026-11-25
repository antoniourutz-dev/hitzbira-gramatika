'use strict';
const fs=require('node:fs');
const path=require('node:path');
function runCurriculumTests(src){
 const checked=[];function check(n,v){if(!v)throw Error("FAIL "+n);checked.push(n)}
 for(const path of ["core.js","app.js","aditzak/engine.js"]){new Function(src[path]);check("syntax "+path,true)}
 const win={};new Function("window",src["core.js"])(win);const api=win.HitzBiraCurriculum;
 const bank=p=>JSON.parse(src[p].match(/^\s*const\s+(?:BANK|DATA)\s*=\s*([\s\S]*);\s*$/)[1]);
 const cards=[...bank("legacy/bank05.js").cards,...bank("legacy/bank08.js").cards];const decl=bank("legacy/decl.js").models.flatMap(m=>["NOR","NORK","NORI","NON","NORA","NONDIK"].filter(k=>m.forms[k]?.[0]).map(k=>({id:"D09-"+m.lemma+"-"+k+"-sg",family:"decl"})));const items=[...cards,...decl];
 const active=api.nodes.filter(n=>api.route(n.id)),refs=active.flatMap(n=>api.route(n.id).refs);
 check("57 nodes / three stages of 19",api.nodes.length===57&&[1,2,3].every(s=>api.nodes.filter(n=>n.stage===s).length===19));
 check("123 requires and 73 retrieves",api.nodes.reduce((s,n)=>s+n.requires.length,0)===123&&api.nodes.reduce((s,n)=>s+n.retrieves.length,0)===73);
 check("topological order",api.nodes.every(n=>n.requires.every(id=>api.get(id).ord<n.ord)));
 check("6 pilot routes",active.length===6);
 check("21 exact item refs and families",refs.length===21&&new Set(refs).size===21&&active.every(n=>api.route(n.id).refs.every(id=>items.some(c=>c.id===id&&c.family===api.route(n.id).family))));
 const lessons=JSON.parse(src["aditzak/engine.js"].match(/const PATH_LESSONS=(\[[\s\S]*?\]);/)[1]);const l=lessons.filter(x=>api.route("V-0").lessons.includes(x.id));
 check("V-0 limited to present NOR and NOR-NORK",l.length===2&&l[0].s===0&&l[1].s===2&&l.every(x=>x.m.length===1&&x.m[0]===0));
 check("initial recommendation is practice only",api.pick().node==="IZE-1"&&api.pick().academicEvidence===false&&api.pick().mode==="practice_only");
 check("unknown node unavailable",api.route("V-2")===null&&api.observation("V-2").available===false);
 check("unknown scope fallback",api.pick({scope:["none"]})===null);
 check("manual scope not hard gated",api.pick({scope:["adi"]}).node==="ADI-1");
 const done=Object.fromEntries(refs.map(id=>[id,{n:1,lastResult:"match"}]));const lessonDone={"HB-L01":true,"HB-L02":true};
 check("completed practice does not invent mastery",api.pick({attempts:done,lessons:lessonDone})===null&&!Object.hasOwn(api.observation("IZE-1",{attempts:done}),"mastery"));
 check("unverified distinct from incorrect",api.observation("IZE-1",{attempts:{"GB-ize-01":{n:1,lastResult:"unverified"}}}).pending===1&&api.observation("IZE-1",{attempts:{"GB-ize-01":{n:1,lastResult:"unverified"}}}).review===0);
 check("next untouched reference first",api.orderedRefs("IZE-1",{attempts:{"GB-ize-01":{n:1,lastResult:"match"}}})[0]==="GB-ize-02");
 const names=["curriculumInput","startCurriculum","curriculumPanel","recommendation","followRecommendation"];const lines=src["app.js"].split("\n");const code=names.map(n=>{const s=lines.find(x=>x.startsWith("function "+n+"("));if(!s)throw Error("missing "+n);return s}).join("\n");
 const test=new Function("window","fixtures",`let h={},queue=[],pos=0,score=0,view=3,mode="choose",sessionResults=[],exam=null,learningGoal={area:"all",size:5,mode:"choose"},D={F:[]},catalogGroups=[{id:"noun",ids:["ize"]}],events=[],lessonState={},cancel=false,missing=false;
 window.HitzBiraVerbs={curriculumPractice:()=>lessonState};
 function allPracticeItems(){return missing?[]:fixtures}
 function leaveVerb(){return true} function confirm(){return !cancel}
 function go(v){view=v;events.push(["go",v])}function openVerb(...a){events.push(["verb",...a])}function scrollTo(){}function next(){events.push(["next",queue.map(x=>x.id),mode])}function alert(m){events.push(["alert",m])}
 function familyEvidence(id){return {id}}function assessmentAvailable(){return []}function isReviewItem(){return false}function pendingItem(){return false}function catalogRoot(){}function startTarget(){}function catalogFamily(){}function startAssessment(){}function startAdventureFamily(){}
 function esc(x){return String(x??"")}function j(x){return JSON.stringify(x)}
 ${code}
 return {recommendation,followRecommendation,startCurriculum,curriculumPanel,get:()=>({queue:queue.map(x=>x.id),mode,events,view}),set:(x)=>{if("queue" in x)queue=x.queue;if("pos" in x)pos=x.pos;if("h" in x)h=x.h;if("lessons" in x)lessonState=x.lessons;if("area" in x)learningGoal.area=x.area;if("exam" in x)exam=x.exam;if("cancel" in x)cancel=x.cancel;if("missing" in x)missing=x.missing;events=[]}}`);
 const ui=test(win,items);
 check("recommendation connected to graph",ui.recommendation().node==="IZE-1");
 ui.followRecommendation();check("home recommendation launches exact IZE-1 refs",JSON.stringify(ui.get().queue)===JSON.stringify(api.route("IZE-1").refs)&&ui.get().mode==="choose");
 ui.set({queue:[],pos:0});ui.startCurriculum("DEK-1");check("DEK-1 limited to curated case refs",ui.get().queue.length===5&&ui.get().queue.every(id=>api.route("DEK-1").refs.includes(id))&&ui.get().mode==="write");
 ui.set({queue:[],lessons:{"HB-L01":true}});ui.startCurriculum("V-0");check("V-0 resumes second lesson",ui.get().events[0][5]==="HB-L02");
 ui.set({queue:[]});ui.startCurriculum("V-0","HB-L03");check("V-0 rejects unrelated requested lesson",ui.get().events[0][5]==="HB-L02");
 ui.set({queue:[]});ui.startCurriculum("V-2");check("nonpilot does not launch",ui.get().events.length===0);
 ui.set({queue:[],missing:true});ui.startCurriculum("IZE-1");check("missing references fail closed",ui.get().events[0][0]==="alert");ui.set({missing:false});
 ui.set({queue:[items[0]],pos:0,cancel:true});ui.startCurriculum("ADI-1");check("active practice protected",ui.get().events[0][0]==="go"&&ui.get().queue.length===1);ui.set({queue:[],cancel:false});
 ui.set({exam:{done:false}});ui.startCurriculum("ADI-1");check("active assessment protected",ui.get().events[0][0]==="go");ui.set({exam:null});
 ui.set({area:"noun"});check("explicit area keeps legacy selector",ui.recommendation().type!=="curriculum");
 const html=ui.curriculumPanel();check("57 objectives listed",api.nodes.every(n=>html.includes(n.id+" · "+n.claim)));check("7 manual pilot buttons preserved",Array.from(html.matchAll(/onclick="startCurriculum\(/g)).length-Array.from(html.matchAll(/,null,true\)/g)).length===7);check("6 adaptive pilot buttons",Array.from(html.matchAll(/,null,true\)/g)).length===6);
 return checked;
}
const files=["core.js","app.js","aditzak/engine.js","legacy/decl.js","legacy/bank05.js","legacy/bank08.js"];
const src=Object.fromEntries(files.map(p=>[p,fs.readFileSync(path.join(__dirname,'..',p),'utf8')]));
const checks=runCurriculumTests(src);for(const name of checks)console.log('PASS '+name);console.log(checks.length+' checks passed');
