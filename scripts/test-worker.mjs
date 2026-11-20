import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from '../worker/index.js';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync(new URL('../drizzle/0000_cor_homes.sql',import.meta.url),'utf8'));
const DB={prepare(sql){return {bind(...v){const s=sqlite.prepare(sql);return {all:async()=>({results:s.all(...v)}),first:async()=>s.get(...v)||null,run:async()=>s.run(...v)}}}}};
const origin='https://cor-homes-real-estate.deepbasil20.chatgpt.site';
const call=(path,options={})=>worker.fetch(new Request(origin+path,options),{DB,ADMIN_EMAIL:'owner@example.com'});
for(const path of ['/','/inmuebles','/contacto','/vender','/robots.txt','/sitemap.xml','/css/inmobiliaria.css','/assets/images/hero-home.jpg'])assert.equal((await call(path)).status,200,path);
assert.equal((await call('/api/admin/properties')).status,401);
const headers={'Content-Type':'application/json','Origin':origin,'oai-authenticated-user-id':'owner','oai-authenticated-user-email':'owner@example.com'};
const post=p=>({method:'POST',headers,body:JSON.stringify(p)});
let p={title:'Prueba privada',slug:'prueba-privada',city:'Barcelona',operation:'venta',price:100000,area:90,rooms:2,description:'Solo para pruebas',images:[],status:'off_market'};
assert.equal((await call('/api/admin/properties',post(p))).status,200);
let list=await(await call('/api/admin/properties',{headers})).json();assert.equal(list.length,1);p=list[0];
assert.equal((await call('/inmuebles/prueba-privada')).status,404);
let response=await call('/off-market/'+p.private_token);assert.equal(response.status,200);assert.match(response.headers.get('x-robots-tag'),/noindex/);
for(const path of ['/','/inmuebles','/sitemap.xml'])assert.doesNotMatch(await(await call(path)).text(),/Prueba privada|prueba-privada/);
assert.equal((await call('/api/contacto',post({name:'Ana',email:'ana@example.com',message:'Consulta',consent:'on',propertyId:p.id,privateToken:p.private_token}))).status,201);
assert.equal((await(await call('/api/admin/leads',{headers})).json()).length,1);
const previous=p.private_token;
assert.equal((await call('/api/admin/properties',post({...p,images:[],renewPrivateLink:true}))).status,200);
assert.equal((await call('/off-market/'+previous)).status,404);
assert.equal((await call('/api/admin/properties',{...post({...p,images:[]}),headers:{...headers,Origin:'https://evil.example'}})).status,403);
console.log('Hosted Worker checks passed: pages, assets, owner access, durable data, off-market exclusion, revocation and enquiries.');
for(const path of ['/comprar','/autopromocion','/proyectos','/en','/en/comprar','/en/vender','/en/autopromocion','/en/proyectos','/en/contacto','/en/inmuebles'])assert.equal((await call(path)).status,200,path);
const es=await(await call('/')).text();assert.match(es,/Lo encontramos/);assert.match(es,/Quiero vender/);assert.match(es,/Quiero construir/);assert.doesNotMatch(es,/Eva|Hay lugares|Estamos preparando nuestra selección/);
const en=await(await call('/en')).text();assert.match(en,/<html lang="en">/);assert.match(en,/Your next home/);assert.match(en,/href="\/en\/comprar"/);assert.match(en,/hreflang="es"/);
assert.match(await(await call('/en/comprar')).text(),/Property Finder/);
assert.match(await(await call('/proyectos')).text(),/permuta de suelo por viviendas/);
assert.match(await(await call('/autopromocion')).text(),/href="\/configurador\/configurador-v2.html"/);
for(const path of ['/configurador/configurador-v2.html','/js/configurador-data.js','/js/configurador-v2.js','/js/leads.js','/css/configurador-v2.css','/configurador/BA%C3%91OS_files/cor-bano-serena.png'])assert.equal((await call(path)).status,200,path);
const config=await(await call('/js/configurador-data.js')).text();assert.match(config,/Esencial 2H/);assert.match(config,/Horizonte 5H/);
console.log('Concept checks passed: ES/EN services, clear value proposition, original configurator and all referenced resources.');

assert.equal((await call('/admin',{redirect:'manual'})).status,302);
assert.equal((await call('/admin',{headers})).status,200);
const other={...headers,'oai-authenticated-user-email':'other@example.com'};
assert.equal((await call('/admin',{headers:other})).status,403);
assert.equal((await call('/api/admin/properties',{headers:other})).status,401);
assert.equal((await call('/api/admin/leads',{headers:other})).status,401);
assert.equal((await call('/api/admin/properties',{method:'POST',headers:other,body:JSON.stringify(p)})).status,401);
assert.equal((await call('/en/admin',{headers:other})).status,403);
assert.equal((await worker.fetch(new Request(origin+'/api/admin/properties',{headers}),{DB})).status,401);
assert.equal((await call('/')).headers.get('cache-control'),'no-store');
assert.equal((await call('/configurador/assets/images/isotipo-cor-homes-sin-fondo.png')).status,200);
console.log('Public-site access checks passed: anonymous, non-owner and unset-owner access cannot read or write administration data.');
// Each service must describe the visible content and resolve its graph references.
for(const prefix of ['', '/en'])for(const path of ['/comprar','/vender','/autopromocion','/proyectos','/contacto']){
 const html=await(await call(prefix+path)).text();
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 assert.equal(schema['@context'],'https://schema.org');
 const nodes=schema['@graph'],page=nodes.find(n=>['WebPage','ContactPage'].includes(n['@type']));
 assert.equal(page.url,html.match(/<link rel="canonical" href="([^"]+)"/)[1]);
 assert.equal(page.inLanguage,prefix?'en':'es');
 assert.ok(html.includes(page.description));
 if(path!='/contacto'){
  const service=nodes.find(n=>n['@type']==='Service');
  assert.equal(page.mainEntity['@id'],service['@id']);
  assert.equal(service.mainEntityOfPage['@id'],page['@id']);
  assert.ok(nodes.some(n=>n['@id']===service.provider['@id']&&n.name==='COR HOMES'));
 }
}
console.log('Structured data checks passed: ES/EN service graphs match canonical URLs, language and visible descriptions.');
// Permanent host redirects preserve paths, encoded values, queries and HTTP methods.
for(const protocol of ['http:', 'https:'])for(const path of ['/','/vender?origen=seo','/en/proyectos','/configurador/configurador-v2.html?paso=2','/inmuebles/casa%20prueba?zona=A%2FB']){
 const response=await worker.fetch(new Request(protocol+'//www.cor.homes'+path),{});
 assert.equal(response.status,308);
 assert.equal(response.headers.get('Location'),'https://cor.homes'+path);
}
const postRedirect=await worker.fetch(new Request('https://www.cor.homes/api/contacto',{method:'POST',body:'test'}),{});
assert.equal(postRedirect.status,308);
assert.equal(postRedirect.headers.get('Location'),'https://cor.homes/api/contacto');
const httpRedirect=await worker.fetch(new Request('http://cor.homes/vender?origen=seo'),{});
assert.equal(httpRedirect.status,308);
assert.equal(httpRedirect.headers.get('Location'),'https://cor.homes/vender?origen=seo');
const canonicalResponse=await worker.fetch(new Request('https://cor.homes/vender'),{});
assert.equal(canonicalResponse.status,200);
assert.match(await canonicalResponse.text(),/<link rel="canonical" href="https:\/\/cor.homes\/vender">/);
console.log('Domain consolidation checks passed: permanent redirects, preserved URLs and canonical host without loops.');
for(const prefix of ['', '/en']){
 const response=await call(prefix+'/index.md');
 assert.equal(response.status,200);
 assert.match(response.headers.get('Content-Type'),/^text\/markdown; charset=utf-8$/);
 assert.equal(response.headers.get('X-Robots-Tag'),'noindex');
 const markdown=await response.text();
 assert.match(markdown,/^# COR HOMES/);
 assert.ok(markdown.includes(prefix? 'Your next home.':'Tu próximo hogar.'));
 assert.doesNotMatch(markdown,/<(?:script|form|div|main)\b|Prueba privada/);
 assert.ok(markdown.includes('https://cor-homes-real-estate.deepbasil20.chatgpt.site'+prefix+'/comprar'));
 const html=await(await call(prefix||'/')).text();
 assert.ok(html.includes('rel="alternate" type="text/markdown" href="'+origin+prefix+'/index.md"'));
}
console.log('Markdown checks passed: ES/EN discovery, content type, language, public content and links.');
const llmsResponse=await call('/llms.txt');
assert.equal(llmsResponse.status,200);
assert.match(llmsResponse.headers.get('Content-Type'),/^text\/plain; charset=utf-8$/);
const llmsText=await llmsResponse.text();
assert.match(llmsText,/^# COR HOMES\n\n> /);
assert.match(llmsText,/## Español/);assert.match(llmsText,/## English/);
assert.doesNotMatch(llmsText,/\/admin|\/api\/|\/off-market\/|Prueba privada/);
const llmsLinks=[...llmsText.matchAll(/\]\((https?:\/\/[^)]+)\)/g)].map(m=>new URL(m[1]));
assert.ok(llmsLinks.length>=15);
for(const url of llmsLinks){assert.equal(url.origin,origin);assert.equal((await call(url.pathname)).status,200,url.pathname)}
assert.match(await(await call('/')).text(),/rel="describedby"[^>]+\/llms.txt/);
console.log('llms.txt checks passed: format, public-only index, discovery and all linked pages respond 200.');
// Blog: all eight full articles, metadata, discovery, internal links and unknown routes.
const blogResponse=await call('/blog');assert.equal(blogResponse.status,200);
const blogHtml=await blogResponse.text();
const blogSlugs=[...new Set([...blogHtml.matchAll(/href="\/blog\/([^"#?]+)"/g)].map(m=>m[1]))];
assert.equal(blogSlugs.length,8);
const sitemap=await(await call('/sitemap.xml')).text(),index=await(await call('/llms.txt')).text();
for(const slug of blogSlugs){
 const path='/blog/'+slug,response=await call(path);assert.equal(response.status,200,path);
 const html=await response.text();assert.equal([...html.matchAll(/<h1>/g)].length,1);
 assert.ok(html.includes('<link rel="canonical" href="'+origin+path+'">'));
 assert.ok(!html.includes('hreflang="en"'));
 const schema=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const article=schema['@graph'].find(n=>n['@type']==='BlogPosting');
 assert.equal(article.url,origin+path);assert.equal(article.datePublished,'2026-10-25');
 assert.ok(html.includes(article.headline.replace(/&/g,'&amp;')));
 assert.ok(sitemap.includes('<loc>'+origin+path+'</loc>'));assert.ok(index.includes(origin+path));
 for(const link of new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map(m=>m[1])))assert.equal((await call(link)).status,200,link);
}
const missing=await call('/blog/no-existe');assert.equal(missing.status,404);assert.match(await missing.text(),/noindex,follow/);
const english=await call('/en/blog');assert.equal(english.status,301);assert.equal(english.headers.get('Location'),'/blog');
assert.match(await(await call('/')).text(),/href="\/blog"/);
assert.match(await(await call('/en')).text(),/Blog \(ES\)/);
console.log('Blog checks passed: eight complete articles, canonicals, schema, public links, sitemap, llms.txt and 404 handling.');
// Catalan is a full public service locale with reciprocal language navigation.
for(const path of ['/ca','/ca/comprar','/ca/vender','/ca/autopromocion','/ca/proyectos','/ca/contacto','/ca/inmuebles']){
 const res=await call(path);assert.equal(res.status,200,path);const html=await res.text();
 assert.match(html,/<html lang="ca">/);assert.ok(html.includes('rel="canonical" href="'+origin+path+'"'));
 assert.match(html,/hreflang="ca"/);assert.match(html,/content="ca_ES"/);
 assert.ok(html.includes('href="/ca/contacto"'));assert.ok(html.includes('href="/ca/comprar"'));
 assert.ok(!html.includes('href="/en/ca'));
 if(path!=='/ca/inmuebles'&&path!=='/ca'){
  assert.match(html,/name="language" value="ca"/);assert.match(html,/Telèfon \(opcional\)/);
  assert.match(html,/Consulta rebuda/);assert.match(html,/Sol·licito que COR HOMES/);
 }
 for(const link of new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map(m=>m[1])))assert.equal((await call(link)).status,200,link);
}
assert.match(await(await call('/ca')).text(),/La teva pròxima llar/);
assert.match(await(await call('/ca/index.md')).text(),/La teva pròxima llar/);
assert.match(await(await call('/sitemap.xml')).text(),/<loc>[^<]+\/ca\/contacto<\/loc>/);
assert.equal((await call('/ca/admin')).status,302);
assert.equal((await call('/ca/admin',{headers:{'oai-authenticated-user-email':'stranger@example.com'}})).status,403);
assert.equal((await call('/ca/blog')).status,200);
const caSchemaHTML=await(await call('/ca/comprar')).text();
const caSchema=JSON.parse(caSchemaHTML.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1]);
assert.equal(caSchema['@graph'].find(n=>n['@type']==='WebPage').inLanguage,'ca');
assert.equal(caSchema['@graph'].find(n=>n['@type']==='Service').url,origin+'/ca/comprar');
const caLead=await call('/api/contacto',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin,'CF-Connecting-IP':'ca-visitor'},body:JSON.stringify({name:'Prova català',email:'ca@example.com',message:'Busco un habitatge al Garraf',consent:true,language:'ca',service:'Personal Shopper Immobiliari'})});
assert.equal(caLead.status,201);assert.match(sqlite.prepare("SELECT message FROM leads WHERE email='ca@example.com'").get().message,/ · CA\]/);
console.log('Catalan checks passed: pages, links, metadata, forms, stored language, Markdown, sitemap and admin access.');

// All Catalan articles preserve the complete source structure and point to their own locale.
const {articles:esArticles,articlesFor}=await import('../app/server/blog.mjs');
const caArticles=articlesFor('ca');assert.equal(caArticles.length,8);
const caBlogHTML=await(await call('/ca/blog')).text();assert.match(caBlogHTML,/Decidir millor/);
assert.match(caBlogHTML,/Llegeix la guia/);
for(const [i,a] of caArticles.entries()){
 const original=esArticles[i];assert.equal(a.slug,original.slug);assert.equal(a.sections.length,original.sections.length);
 for(const [j,section] of a.sections.entries())for(const field of ['paragraphs','items','after'])assert.equal(section[field]?.length,original.sections[j][field]?.length);
 assert.deepEqual(a.sources.map(s=>s[1]),original.sources.map(s=>s[1]));
 const path='/ca/blog/'+a.slug,res=await call(path);assert.equal(res.status,200,path);const html=await res.text();
 assert.ok(html.includes('<h1>'+a.title.replace(/&/g,'&amp;')+'</h1>'));
 assert.ok(html.includes('rel="canonical" href="'+origin+path+'"'));assert.match(html,/<html lang="ca">/);
 assert.ok(html.includes('hreflang="es" href="'+origin+'/blog/'+a.slug+'"'));
 assert.ok(html.includes('hreflang="ca" href="'+origin+path+'"'));assert.ok(!html.includes('hreflang="en"'));
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/)[1])['@graph'];
 const article=graph.find(n=>n['@type']==='BlogPosting');assert.equal(article.inLanguage,'ca');assert.equal(article.url,origin+path);assert.equal(article.headline,a.title);
 for(const link of new Set([...html.matchAll(/href="(\/[^"#?]*)"/g)].map(m=>m[1])))assert.equal((await call(link)).status,200,link);
 assert.ok((await(await call('/sitemap.xml')).text()).includes('<loc>'+origin+path+'</loc>'));
 assert.ok((await(await call('/llms.txt')).text()).includes(origin+path));
 assert.equal((await call(path+'/')).headers.get('Location'),path);
}
assert.equal((await call('/ca/blog/')).headers.get('Location'),'/ca/blog');
const ca404=await call('/ca/blog/no-existe');assert.equal(ca404.status,404);assert.match(await ca404.text(),/Aquest article no està disponible/);
assert.match(await(await call('/ca')).text(),/href="\/ca\/blog"/);
console.log('Catalan blog checks passed: all eight complete translations, reciprocal languages, internal links, schema, sitemap and redirects.');
