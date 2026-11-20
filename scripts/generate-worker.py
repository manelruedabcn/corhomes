from pathlib import Path
import json,re,base64
root=Path(__file__).resolve().parent.parent
s=(root/'app/server/app.mjs').read_text()
s=s[s.index('export const esc='):]
s=(root/'app/server/content.mjs').read_text().replace('export function content','function content')+'\n'+s
s=(root/'app/server/blog-ca.mjs').read_text().replace('export const catalanArticles','const catalanArticles')+'\n'+(root/'app/server/blog.mjs').read_text().replace("import {catalanArticles} from './blog-ca.mjs';",'').replace('export const articles','const articles').replace('export function articlesFor','function articlesFor')+'\n'+s
s=s.replace('export const esc=','const esc=')
s=s.replace('process.env.WEB3FORMS_ACCESS_KEY', 'env.WEB3FORMS_ACCESS_KEY')
s=s[:s.index('\nserver.listen')]
s=s.replace('const rows=()=>','const rows=async()=>')
s=s.replace('homeMarkdown(c,lang,rows())','homeMarkdown(c,lang,await rows())')
s=s.replace('rows().','(await rows()).').replace('let list=rows();','let list=await rows();').replace('const selection=rows();','const selection=await rows();')
s=s.replace("const server=http.createServer(async(req,res)=>{",'async function handler(req,res){')
s=s.removesuffix(');\n').removesuffix(');') # callback closure remains }}
# Convert sync SQLite calls to awaited D1 adapter calls, with balanced argument scanning.
def closing(text,start):
 depth=0;quote=None;escape=False
 for i in range(start,len(text)):
  c=text[i]
  if quote:
   if escape:escape=False
   elif c=='\\':escape=True
   elif c==quote:quote=None
  elif c in "'\"`":quote=c
  elif c=='(':depth+=1
  elif c==')':
   depth-=1
   if depth==0:return i
 raise ValueError('unbalanced')
pos=0
while True:
 start=s.find('db.prepare(',pos)
 if start<0:break
 end=closing(s,start+10)
 m=re.match(r'\.(all|get|run)\(',s[end+1:])
 if not m:raise ValueError(s[start:start+150])
 final=closing(s,end+1+len(m.group(0))-1)
 expr=s[start:final+1]
 s=s[:start]+'(await '+expr+')'+s[final+1:]
 pos=start+len(expr)+8
s=s.replace("const auth=sessions.get(token)>Date.now();", "const auth=Boolean(env.ADMIN_EMAIL)&&request.headers.get('oai-authenticated-user-email')?.toLowerCase()===env.ADMIN_EMAIL.toLowerCase();")
a=s.index("if(path==='/api/login'");b=s.index("if(path.startsWith('/api/admin/'))",a)
s=s[:a]+"if(path==='/api/login')return json(401,{error:'Accede con tu cuenta de ChatGPT para administrar este sitio.'});\n"+s[b:]
s=s.replace("sessions.delete(token);",'')
s=s.replace("readFileSync(resolve(root,'server/admin.html'))",'ADMIN_HTML')
a=s.index("if(/^\\/(assets");b=s.index("res.setHeader('X-Robots-Tag','noindex');return send(404",a)
s=s[:a]+s[b:]
assets={}
for folder in ['assets','css','js','configurador']:
 for f in (root/'app'/folder).rglob('*'):
  if not f.is_file():continue
  data=f.read_bytes()
  mime={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.html':'text/html; charset=utf-8'}.get(f.suffix.lower())
  if data.startswith(b'\xff\xd8'):mime='image/jpeg'
  if mime:assets['/'+f.relative_to(root/'app').as_posix()]={'type':mime,'base64':base64.b64encode(data).decode()}
admin=(root/'app/server/admin.html').read_text().replace('<form id="login">','<form id="login" hidden>')
admin=admin.replace("$('#logout').onclick=async()=>{try{await api('admin/logout',post({}));location.reload()}catch(e){notice(e)}}", "$('#logout').onclick=()=>{location.href='/signout-with-chatgpt?return_to=/'}")
admin=admin.replace("load().catch(()=>{});", "load().catch(e=>{notice('Inicia sesión con tu cuenta para gestionar la web.');$('#workspace').hidden=true});")
prefix='''const attempts=new Map();
const randomBytes=n=>({toString:()=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,'0')).join('')});
'''
worker=prefix+'const ASSETS='+json.dumps(assets)+';\nconst ADMIN_HTML='+json.dumps(admin)+';\n'+r'''export default {async fetch(request,env){
const url=new URL(request.url);
// Consolidate the public domain before routing, authentication or asset delivery.
if(url.hostname==='www.cor.homes'||(url.hostname==='cor.homes'&&url.protocol!=='https:')){
 url.hostname='cor.homes';url.protocol='https:';url.port='';
 return new Response(null,{status:308,headers:{Location:url.href,'Cache-Control':'public,max-age=3600'}});
}
const base=url.origin;
const adminPath=/^\/(?:(?:en|ca)\/)?admin\/?$/.test(url.pathname);
const adminEmail=(env.ADMIN_EMAIL||'').trim().toLowerCase();
const visitorEmail=(request.headers.get('oai-authenticated-user-email')||'').trim().toLowerCase();
if(adminPath){
 if(!visitorEmail)return new Response(null,{status:302,headers:{Location:'/signin-with-chatgpt?return_to='+encodeURIComponent(url.pathname),'Cache-Control':'no-store'}});
 if(!adminEmail||visitorEmail!==adminEmail)return new Response('Acceso reservado a administración.',{status:403,headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
}
if(url.pathname==='/configurador/'||url.pathname==='/configurador')return Response.redirect(base+'/configurador/configurador-v2.html',301);
if(url.pathname==='/es/index.html')return Response.redirect(base+'/',301);

let assetPath;try{assetPath=decodeURIComponent(url.pathname)}catch{return new Response('Bad request',{status:400})}if(assetPath==='/configurador/assets/images/isotipo-cor-homes-sin-fondo.png')assetPath='/assets/images/isotipo-cor-homes-sin-fondo.png';if(ASSETS[assetPath]){const a=ASSETS[assetPath];return new Response(Uint8Array.from(atob(a.base64),c=>c.charCodeAt(0)),{headers:{'Content-Type':a.type,'Cache-Control':'public,max-age=3600','X-Content-Type-Options':'nosniff'}})}
const db={prepare(sql){return {all:async(...v)=>(await env.DB.prepare(sql).bind(...v).all()).results,get:async(...v)=>await env.DB.prepare(sql).bind(...v).first(),run:async(...v)=>await env.DB.prepare(sql).bind(...v).run()}}};
const req={url:request.url,method:request.method,headers:Object.fromEntries(request.headers),socket:{remoteAddress:request.headers.get('oai-authenticated-user-id')||request.headers.get('CF-Connecting-IP')||'anonymous'},async *[Symbol.asyncIterator](){yield await request.text()}};
let status=200,payload='',headers=new Headers();
const res={setHeader(k,v){headers.set(k,v)},writeHead(s,h){status=s;for(const [k,v]of Object.entries(h))headers.set(k,v)},end(d){payload=d}};
'''+s+'''
await handler(req,res);
if((headers.get('Content-Type')||'').includes('text/html'))headers.set('Cache-Control','no-store');return new Response(request.method==='HEAD'?null:payload,{status,headers});
}};
'''
(root/'worker/index.js').write_text(worker)
print('Worker generated from COR HOMES source; assets embedded, D1 persistence and Sites identity enabled.')
