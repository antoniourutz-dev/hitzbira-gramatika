'use strict';
const {projectEvidence}=require('../policy/evidence-reference.cjs');
function runEvidenceTests(project){
 const checks=[];function check(n,v){if(!v)throw Error("FAIL "+n);checks.push(n)}
 const contract={status:"approved",policy:"HB-ADAPT-001/0.1.0",capabilityVersionId:"SYNTHETIC-V1",rubricVersion:"r1",criteria:[{code:"C1",criticalComponents:["c1a","c1b"]},{code:"C2",criticalComponents:["c2"]},{code:"C3",criticalComponents:["c3"]}]};
 const assignment=(id,components,phase="practice",mechanism="production",extra={})=>({id,status:"approved",capabilityVersionId:contract.capabilityVersionId,rubricVersion:contract.rubricVersion,itemId:id,itemVersion:"1",contextFingerprint:"ctx-"+id,templateFingerprint:"tpl-"+id,exposureFamily:"exp-"+id,components,phase,mechanism,...extra});
 const a=assignment("a",["c1a","c1b"]),b=assignment("b",["c2","c3"],"transfer"),c=assignment("c",["c1a"]),d=assignment("d",["c1a"]),e=assignment("e",["c1a"]),as=[a,b,c,d,e];
 function event(a,n,patch={},obs=null){return {eventId:"e"+n,assignmentId:a.id,capabilityVersionId:a.capabilityVersionId,rubricVersion:a.rubricVersion,recordedAt:"2026-11-"+String(n+1).padStart(2,"0")+"T12:00:00Z",sessionId:"s"+n,hintLevel:0,answerRevealed:false,firstAttempt:true,previousExposure:false,serverVerified:true,observations:obs||a.components.map(component=>({component,result:"success",classification:"ALDAERA_ONARGARRIA"})),...patch}}
 const A=event(a,1),B=event(b,2),neg=[{component:"c1a",result:"failure",classification:"ARAU_AKATSA",confirmed:true}],C=event(c,3,{},neg),D=event(d,4,{},neg),E=event(e,5);
 const run=(es,aa=as,cc=contract)=>project(cc,aa,es);
 check("draft contract cannot award",run([A,B],as,{...contract,status:"review"}).state==="aztertu_gabe");
 check("atomic component definition required",run([A,B],as,{...contract,criteria:[{code:"C1",criticalComponents:[]}]}).reason==="content_pending");
 check("unapproved items cannot award",run([A,B],[{...a,status:"review"},b]).state!=="autonomoa");
 check("wrong version ignored",run([A,{...B,capabilityVersionId:"old"}]).eligibleEvents===1);
 check("untrusted event ignored",run([A,{...B,serverVerified:false}]).eligibleEvents===1);
 check("missing evidence not failure",run([]).state==="aztertu_gabe"&&run([]).repair.length===0);
 check("one clean task consolidating",run([A]).state==="sendotzen");
 check("two clean tasks with transfer and full coverage",run([A,B]).state==="autonomoa");
 check("helped success not autonomous",run([A,{...B,hintLevel:1}]).state!=="autonomoa");
 check("revealed answer not autonomous",run([A,{...B,answerRevealed:true}]).state!=="autonomoa");
 check("prior exposure not clean",run([A,{...B,previousExposure:true}]).cleanTasks===1);
 check("retry not clean",run([A,{...B,firstAttempt:false}]).cleanTasks===1);
 check("same template not independent",run([A,B],[a,{...b,templateFingerprint:a.templateFingerprint}]).cleanTasks===1);
 check("same context not independent",run([A,B],[a,{...b,contextFingerprint:a.contextFingerprint}]).cleanTasks===1);
 check("choice cannot prove autonomy",run([A,B],[a,{...b,mechanism:"selection"}]).state!=="autonomoa");
 check("reconstruction not production",run([A,B],[a,{...b,mechanism:"reconstruction"}]).state!=="autonomoa");
 check("transfer required",run([A,B],[a,{...b,phase:"practice"}]).state!=="autonomoa");
 check("all components must be covered",run([A,C]).missing.includes("c3"));
 check("uncertain failure not penalized",run([A,B,event(c,3,{},[{component:"c1a",result:"failure",classification:"FROGA_ESKASA",confirmed:true}])]).contrast.length===0);
 check("legitimate variant never negative",run([A,B,event(c,3,{},[{component:"c1a",result:"failure",classification:"ALDAERA_ONARGARRIA",confirmed:true}])]).contrast.length===0);
 check("unconfirmed failure never negative",run([A,B,event(c,3,{},[{...neg[0],confirmed:false}])]).contrast.length===0);
 check("duplicate event idempotent",run([A,A,B]).cleanTasks===2);
 check("conflicting duplicate quarantined",run([A,{...A,hintLevel:2},B]).cleanTasks===1);
 check("out of order deterministic",JSON.stringify(run([D,B,A,C]))===JSON.stringify(run([A,B,C,D])));
 check("single critical failure contrast not automatic downgrade",run([A,B,C]).state==="autonomoa"&&run([A,B,C]).contrast[0]==="c1a"&&run([A,B,C]).repair.length===0);
 check("two confirmed critical failures trigger repair",run([A,B,C,D]).state==="sendotzen"&&run([A,B,C,D]).repair[0]==="c1a");
 check("new clean success resolves component repair",run([A,B,C,D,E]).repair.length===0&&run([A,B,C,D,E]).state==="autonomoa");
 check("no retention certification yet",run([A,B,E]).state!=="finkatua");
 return checks;
}
const checks=runEvidenceTests(projectEvidence);for(const n of checks)console.log('PASS '+n);console.log(checks.length+' checks passed');
