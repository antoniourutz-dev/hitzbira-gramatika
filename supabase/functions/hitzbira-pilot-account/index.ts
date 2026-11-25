/* HitzBira private pilot account gateway. No privileged key is sent to the browser. */
const BASE=Deno.env.get("SUPABASE_URL"), SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), ANON=Deno.env.get("SUPABASE_ANON_KEY"), ROLE="hitzbira_isolated", RELEASE="hb-1.2-e461f43";
const allowedOrigin=o=>o==="https://hitzbira-gramatika.vercel.app"||/^https:\/\/hitzbira-gramatika(?:-[a-z0-9-]+)?-antoniourutz-devs-projects\.vercel\.app$/.test(o);
const adminHeaders={apikey:SERVICE,Authorization:"Bearer "+SERVICE,"Content-Type":"application/json"};
function response(status,data,origin){return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","Vary":"Origin",...(origin&&allowedOrigin(origin)?{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS"}:{})}})}
function params(x){return new URLSearchParams(x).toString()}
async function admin(path,method="GET",body,prefer){const r=await fetch(BASE+path,{method,headers:{...adminHeaders,...(prefer?{Prefer:prefer}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error("backend_failure");if(r.status===204)return null;const t=await r.text();return t?JSON.parse(t):null}
function normalize(v){return typeof v==="string"?v.trim().toLowerCase():""}
function goodName(s){return /^[a-z0-9][a-z0-9._-]{2,23}$/.test(s)&&!/[._-]$/.test(s)&&!["admin","administrator","root","support","hitzbira","bira","system","service","moderator"].includes(s)}
function goodPassword(s){return typeof s==="string"&&s.length>=12&&new TextEncoder().encode(s).length<=72}
async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,"0")).join("")}
function jwtClaims(token){try{const part=token.split(".")[1].replace(/-/g,"+").replace(/_/g,"/");return JSON.parse(atob(part.padEnd(Math.ceil(part.length/4)*4,"=")))}catch{return {}}}
async function userFor(req){const token=req.headers.get("authorization")||"";if(!/^Bearer [A-Za-z0-9_.-]{20,4096}$/.test(token))return null;const r=await fetch(BASE+"/auth/v1/user",{headers:{apikey:ANON,Authorization:token}});if(!r.ok)return null;const u=await r.json();if(u.role!==ROLE||u.app_metadata?.hitzbira_pilot!==true||jwtClaims(token.slice(7)).role!==ROLE)return null;const rows=await admin("/rest/v1/hb_registered_accounts?"+params({select:"user_id,username,email",user_id:"eq."+u.id,enabled:"eq.true",limit:"1"}));return rows?.[0]?.email===u.email?rows[0]:null}
async function register(b,origin){
 const name=normalize(b.username),pass=b.password,invite=normalize(b.invite);
 if(!goodName(name)||!goodPassword(pass)||!/^[0-9a-f]{64}$/.test(invite))return response(400,{error:"Datuak edo gonbidapena ez dira baliozkoak."},origin);
 const email=name+"@hitzbira.app",hash=await digest(invite),now=new Date().toISOString();
 // Claim the invitation atomically before creating a user. Failed requests consume the code, fail closed.
 const claimed=await admin("/rest/v1/hb_registration_invites?"+params({token_hash:"eq."+hash,consumed_at:"is.null",expires_at:"gt."+now}),"PATCH",{consumed_at:now},"return=representation");
 if(!Array.isArray(claimed)||claimed.length!==1)return response(403,{error:"Gonbidapena ez da baliozkoa edo erabilita dago."},origin);
 let id=null;
 try{
  // The actual password is not set until the isolated JWT role has been verified.
  const temp=Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,"0")).join("")+"Aa1!";
  const u=await admin("/auth/v1/admin/users","POST",{email,password:temp,email_confirm:true,role:ROLE,app_metadata:{hitzbira_pilot:true},user_metadata:{display_name:name}});
  id=u?.id||u?.user?.id;const returned=u?.role||u?.user?.role;
  if(!id||returned!==ROLE)throw Error("isolation_not_confirmed");
  const login=await fetch(BASE+"/auth/v1/token?grant_type=password",{method:"POST",headers:{apikey:ANON,"Content-Type":"application/json"},body:JSON.stringify({email,password:temp})});
  if(!login.ok)throw Error("test_login_failed");
  const s=await login.json(),claims=jwtClaims(s.access_token||"");
  if(claims.role!==ROLE||claims.sub!==id)throw Error("jwt_role_mismatch");
  // Require direct access to a known authenticated-only table to be rejected.
  const probe=await fetch(BASE+"/rest/v1/lexical_groups?select=id&limit=1",{headers:{apikey:ANON,Authorization:"Bearer "+s.access_token}});
  if(probe.ok)throw Error("direct_data_access_not_isolated");
  const revoke=await fetch(BASE+"/auth/v1/logout?scope=global",{method:"POST",headers:{apikey:ANON,Authorization:"Bearer "+s.access_token}});if(!revoke.ok)throw Error("test_session_not_revoked");
  await admin("/rest/v1/hb_registered_accounts","POST",{user_id:id,username:name,email},"return=minimal");
  const updated=await admin("/auth/v1/admin/users/"+encodeURIComponent(id),"PUT",{password:pass});
  if((updated?.role||updated?.user?.role)!==ROLE)throw Error("role_changed");
  return response(201,{ok:true,username:name},origin);
 }catch{
  if(id){try{await admin("/auth/v1/admin/users/"+encodeURIComponent(id),"DELETE")}catch{try{await admin("/rest/v1/hb_registered_accounts?"+params({user_id:"eq."+id}),"PATCH",{enabled:false},"return=minimal")}catch{}}}
  return response(409,{error:"Ezin izan da kontua sortu. Eskatu gonbidapen berria."},origin);
 }
}
async function read(b,req,origin){
 const u=await userFor(req);if(!u)return response(403,{error:"Kontu piloturako baimenik ez."},origin);
 if(b.action==="check")return response(200,{ok:true,username:u.username,release:RELEASE},origin);
 const f=b.filter&&typeof b.filter==="object"&&!Array.isArray(b.filter)?b.filter:{};
 const kind=b.kind,offset=b.offset;
 if(!["aux","synthetic","grammar_bank"].includes(kind)||!Number.isInteger(offset)||offset<0||offset>2000)return response(400,{error:"Kontsulta ez da baliozkoa."},origin);
 const q={select:"ordinal,payload",release_code:"eq."+RELEASE,kind:"eq."+kind,order:"ordinal.asc",limit:"100",offset:String(offset)};
 if(kind==="aux"){
  if(f.partition_key!==undefined){if(!/^eq\.[0-3]$/.test(f.partition_key))return response(400,{error:"Sistema baliogabea."},origin);q.partition_key=f.partition_key}
  if(f["payload->>m"]!==undefined){if(!/^eq\.(?:[0-9]|10)$/.test(f["payload->>m"]))return response(400,{error:"Aldia baliogabea."},origin);q["payload->>m"]=f["payload->>m"]}
 }else if(kind==="grammar_bank"){if(!/^eq\.(?:decl|bank0[5-8])$/.test(f.record_id||""))return response(400,{error:"Banku baliogabea."},origin);q.record_id=f.record_id}
 const releases=await admin("/rest/v1/hb_runtime_pilot_releases?"+params({select:"release_code",release_code:"eq."+RELEASE,ready:"eq.true",limit:"1"}));
 if(!releases?.length)return response(503,{error:"Banku pilotua ez dago prest."},origin);
 return response(200,await admin("/rest/v1/hb_runtime_pilot_records?"+params(q)),origin);
}
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 if(origin&&!allowedOrigin(origin))return response(403,{error:"Jatorria ez dago baimenduta."},"");
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Headers":"authorization,apikey,content-type,x-client-info","Access-Control-Allow-Methods":"POST,OPTIONS","Cache-Control":"no-store","Vary":"Origin"}});
 if(req.method!=="POST")return response(405,{error:"POST beharrezkoa da."},origin);
 if(!BASE||!SERVICE||!ANON)return response(503,{error:"Zerbitzua ez dago prest."},origin);
 try{
  if(Number(req.headers.get("content-length")||0)>4096)return response(413,{error:"Eskaera handiegia."},origin);
  // Bounded stream: no unbounded body allocation, including chunked requests.
  const reader=req.body?.getReader();if(!reader)return response(400,{error:"Eskaera hutsa."},origin);
  let parts=[],size=0;for(;;){const r=await reader.read();if(r.done)break;size+=r.value.byteLength;if(size>4096){await reader.cancel();return response(413,{error:"Eskaera handiegia."},origin)}parts.push(r.value)}
  const buf=new Uint8Array(size);let pos=0;for(const part of parts){buf.set(part,pos);pos+=part.byteLength}const b=JSON.parse(new TextDecoder().decode(buf));
  if(!b||typeof b!=="object")return response(400,{error:"Eskaera baliogabea."},origin);
  if(b.action==="register")return await register(b,origin);
  if(b.action==="check"||b.action==="read")return await read(b,req,origin);
  return response(400,{error:"Ekintza ezezaguna."},origin);
 }catch{return response(503,{error:"Ezin izan da eskaera burutu."},origin)}
});
