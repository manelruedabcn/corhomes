import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('Catálogo, seguridad, SEO y consultas',async()=>{const dir=mkdtempSync(join(tmpdir(),'cor-test-'));const base='http://127.0.0.1:3199';const child=spawn(process.execPath,['--experimental-sqlite','server/app.mjs'],{env:{...process.env,PORT:'3199',BASE_URL:base,DATA_DIR:dir,ADMIN_PASSWORD:'test-password'}});try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',c=>reject(Error('exit '+c)))});const call=(p,o)=>fetch(base+p,o);assert.equal((await call('/')).status,200);assert.equal((await call('/api/admin/properties')).status,401);assert.equal((await call('/api/login',{method:'POST',body:JSON.stringify({password:'wrong'})})).status,401);const login=await call('/api/login',{method:'POST',body:JSON.stringify({password:'test-password'})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];assert.match(login.headers.get('set-cookie'),/HttpOnly/);const post=p=>({method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify(p)});let p={title:'Casa de prueba',slug:'casa-test',city:'Barcelona',operation:'venta',price:300000,area:100,rooms:3,description:'Texto <seguro>',images:[],status:'borrador'};assert.equal((await call('/api/admin/properties',post(p))).status,200);assert.equal((await call('/inmuebles/casa-test')).status,404);let list=await (await call('/api/admin/properties',{headers:{Cookie:cookie}})).json();p={...p,id:list[0].id,status:'disponible'};assert.equal((await call('/api/admin/properties',post(p))).status,200);let html=await(await call('/inmuebles/casa-test')).text();assert.match(html,/Texto &lt;seguro&gt;/);assert.match(html,/og:image/);assert.match(html,/application\/ld\+json/);assert.match(await(await call('/sitemap.xml')).text(),/casa-test/);assert.match(await(await call('/inmuebles?zona=Barcelona')).text(),/Casa de prueba/);assert.doesNotMatch(await(await call('/inmuebles?zona=Madrid')).text(),/Casa de prueba/);assert.equal((await call('/api/contacto',{method:'POST',body:JSON.stringify({name:'Ana',email:'ana@example.com',message:'Quiero información',consent:'on',propertyId:p.id})})).status,201);const leads=await(await call('/api/admin/leads',{headers:{Cookie:cookie}})).json();assert.equal(leads.length,1);assert.equal(leads[0].property_id,p.id);const evil=post(p);evil.headers.Origin='https://evil.example';assert.equal((await call('/api/admin/properties',evil)).status,403);assert.equal((await call('/data/cor.sqlite')).status,404);assert.equal((await call('/.env')).status,404);assert.equal((await call('/admin')).headers.get('x-robots-tag'),'noindex, nofollow');}finally{child.kill();await new Promise(r=>child.once('exit',r));rmSync(dir,{recursive:true,force:true})}});

test('Off market: enlace secreto, exclusión pública, renovación y retirada',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'cor-private-')),base='http://127.0.0.1:3200';
 const child=spawn(process.execPath,['--experimental-sqlite','server/app.mjs'],{env:{...process.env,PORT:'3200',BASE_URL:base,DATA_DIR:dir,ADMIN_PASSWORD:'test-password'}});
 try{
  await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',c=>reject(Error('exit '+c)))});
  const call=(p,o)=>fetch(base+p,o);
  const login=await call('/api/login',{method:'POST',body:JSON.stringify({password:'test-password'})});
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const post=p=>({method:'POST',headers:{Cookie:cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify(p)});
  const list=async()=>await(await call('/api/admin/properties',{headers:{Cookie:cookie}})).json();
  let p={title:'Residencia confidencial',slug:'residencia-confidencial',city:'Barcelona',operation:'venta',price:900000,area:200,rooms:4,description:'Descripción confidencial',images:[],status:'off_market'};
  assert.equal((await call('/api/admin/properties',post(p))).status,200);
  p=(await list())[0];const old=p.private_token;
  assert.match(old,/^[a-f0-9]{64}$/);
  for(const path of ['/','/inmuebles','/inmuebles?zona=Barcelona','/sitemap.xml']){const html=await(await call(path)).text();assert.doesNotMatch(html,/Residencia confidencial|residencia-confidencial/);assert.ok(!html.includes(old))}
  assert.equal((await call('/inmuebles/'+p.slug)).status,404);
  assert.equal((await call('/off-market/not-a-valid-link')).status,404);
  let response=await call('/off-market/'+old);assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  const html=await response.text();assert.match(html,/Residencia confidencial/);assert.match(html,/OFF MARKET/);assert.doesNotMatch(html,/og:image|RealEstateListing|rel="canonical"|content="index,follow"/);
  // Guessing a numeric property ID cannot submit a private-property enquiry.
  let lead={name:'Ana',email:'ana@example.com',message:'Información privada',consent:'on',propertyId:p.id};
  assert.equal((await call('/api/contacto',{method:'POST',body:JSON.stringify(lead)})).status,400);
  lead.privateToken=old;
  assert.equal((await call('/api/contacto',{method:'POST',body:JSON.stringify(lead)})).status,201);
  const save=async changes=>{assert.equal((await call('/api/admin/properties',post({...p,images:JSON.parse(p.images),...changes}))).status,200);p=(await list())[0]};
  await save({title:'Residencia confidencial editada'});assert.equal(p.private_token,old);
  await save({renewPrivateLink:true});assert.notEqual(p.private_token,old);assert.equal((await call('/off-market/'+old)).status,404);
  const renewed=p.private_token;assert.equal((await call('/off-market/'+renewed)).status,200);
  await save({status:'borrador'});assert.equal(p.private_token,null);assert.equal((await call('/off-market/'+renewed)).status,404);
  await save({status:'off_market'});assert.notEqual(p.private_token,renewed);
  const last=p.private_token;await save({status:'disponible'});assert.equal((await call('/off-market/'+last)).status,404);assert.equal((await call('/inmuebles/'+p.slug)).status,200);
 }finally{child.kill();await new Promise(r=>child.once('exit',r));rmSync(dir,{recursive:true,force:true})}
});
