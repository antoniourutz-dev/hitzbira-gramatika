'use strict';
const {projectEvidence}=require('../policy/evidence-reference.cjs');
function runRetentionTests(project){
 const checks=[];function check(n,v){if(!v)throw Error("FAIL "+n);checks.push(n)}
 const D=86400000,T=Date.parse("2026-11-01T10:00:00Z"),contract={status:"approved",policy:"HB-ADAPT-001/0.1.0",capabilityVersionId:"SYNTHETIC-V1",rubricVersion:"r1",criteria:[{code:"C1",criticalComponents:["a","b"]},{code:"C2",criticalComponents:["c"]}]};
 const assignment=(id,components,phase="practice",extra={})=>({id,status:"approved",capabilityVersionId:contract.capabilityVersionId,rubricVersion:contract.rubricVersion,itemId:id,itemVersion:"1",contextFingerprint:"ctx-"+id,templateFingerprint:"tpl-"+id,exposureFamily:"exp-"+id,components,phase,mechanism:"production",...extra});
 const a=assignment("a",["a","b"]),b=assignment("b",["c"],"transfer"),c=assignment("c",["a","b"],"retrieval"),d=assignment("d",["c"],"retrieval"),e=assignment("e",["a"],"practice"),f=assignment("f",["a"],"retrieval"),items=[a,b,c,d,e,f];
 const event=(item,at,patch={})=>({eventId:"ev-"+item.id,assignmentId:item.id,capabilityVersionId:item.capabilityVersionId,rubricVersion:item.rubricVersion,recordedAt:new Date(T+at*D).toISOString(),sessionId:"session-"+item.id,hintLevel:0,answerRevealed:false,firstAttempt:true,previousExposure:false,serverVerified:true,observations:item.components.map(component=>({component,result:"success",classification:"ALDAERA_ONARGARRIA"})),...patch});
 const A=event(a,0),B=event(b,1),C=event(c,2),E=event(d,8),base=[A,B],run=(events,assignments=items,cc=contract)=>project(cc,assignments,events);
 check("autonomy alone not maintained",run(base).state==="autonomoa");
 check("one retrieval not maintained",run([...base,C]).state==="autonomoa"&&run([...base,C]).retentionSessions===1);
 check("two delayed sessions and full coverage",run([...base,C,E]).state==="finkatua"&&run([...base,C,E]).retentionSessions===2);
 check("less than 24 hours excluded",run([...base,event(c,1.999),E]).state!=="finkatua");
 check("second less than seven days from autonomy excluded",run([...base,C,event(d,7.999)]).state!=="finkatua");
 check("same session excluded",run([...base,C,{...E,sessionId:C.sessionId}]).state!=="finkatua");
 check("same autonomy session excluded",run([...base,{...C,sessionId:B.sessionId},E]).state!=="finkatua");
 check("help blocks clean retrieval",run([...base,{...C,hintLevel:1},E]).state!=="finkatua");
 check("revealed model blocks retrieval",run([...base,{...C,answerRevealed:true},E]).state!=="finkatua");
 check("prior exposure blocks retrieval",run([...base,{...C,previousExposure:true},E]).state!=="finkatua");
 check("selection is not delayed production",run([...base,C,E],[a,b,{...c,mechanism:"selection"},d,e,f]).state!=="finkatua");
 check("template repeat excluded",run([...base,C,E],[a,b,c,{...d,templateFingerprint:c.templateFingerprint},e,f]).state!=="finkatua");
 check("missing component blocks maintenance",run([...base,C,event(f,8)]).state!=="finkatua");
 check("intervening exposure resets delay",run([...base,C,event(e,7.5),E]).state!=="finkatua");
 check("uncertain exposure not a linguistic failure",run([...base,C,event(e,7.5,{observations:[{component:"a",result:"unscorable",classification:"FROGA_ESKASA"}]}),E]).contrast.length===0);
 check("duplicate does not add sessions",run([...base,C,C]).retentionSessions===1);
 check("out-of-order projection deterministic",JSON.stringify(run([E,B,C,A]))===JSON.stringify(run([A,B,C,E])));
 check("unapproved contract blocked",run([...base,C,E],items,{...contract,status:"review"}).state==="aztertu_gabe");
 check("untrusted event excluded",run([...base,C,{...E,serverVerified:false}]).state!=="finkatua");
 check("later confirmed failure opens contrast not maintenance",run([...base,C,E,event(e,9,{observations:[{component:"a",result:"failure",classification:"ARAU_AKATSA",confirmed:true}]})]).state==="autonomoa");
 return checks;
}
const checks=runRetentionTests(projectEvidence);for(const n of checks)console.log('PASS '+n);console.log(checks.length+' checks passed');
