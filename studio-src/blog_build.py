"""Genera el blog de COR STUDIO a partir de los ficheros de entradas.
Uso: python3 -I blog_build.py es
Pensado para varios idiomas: cada idioma tiene su bloque en LANG y sus entradas en
/home/claude/blog/posts_<lang>_*.py (lista POSTS)."""
import sys, re, html, json, glob, importlib.util, datetime

SITE = 'https://www.studio.cor.homes'
OUT = '/home/claude/corhomes/studio/'
IMG = lambda i, w=1200: f'https://images.unsplash.com/photo-{i}?w={w}&q=75&auto=format&fit=crop'

LANG = {
 'es': dict(prefix='', html_lang='es', locale='es_ES', home='Inicio', blog='Blog',
   blog_title='Blog de reformas | COR STUDIO',
   blog_desc='Guías de reforma para el Garraf y el Penedès: planificación, presupuesto, luz, climatización, casa casi pasiva, cocinas, baños y espacios de calma.',
   blog_h1='Reformar con calma', blog_eyebrow='BLOG DE REFORMAS',
   blog_intro='Lo que hemos aprendido dirigiendo obras, contado para que llegues a tu reforma con criterio: cómo planificar, qué pedir en un presupuesto, cómo iluminar, cómo climatizar y cómo conseguir una casa que se viva mejor. Escribimos desde el Garraf y el Penedès, pensando en sus casas, su clima y su luz.',
   read='min de lectura', updated='Actualizado', cta_h='¿Tienes una reforma en mente?',
   cta_p='Cuéntanos qué quieres hacer y te respondemos en 48 horas con una primera valoración. Trabajamos en el Garraf y el Penedès.',
   cta_btn='Pide presupuesto', related='Sigue leyendo', back='Todas las entradas',
   nav=[('/#servicios','Servicios'),('/#metodo','Cómo trabajamos'),('/blog/','Blog')],
   quote='/presupuesto', footer='COR STUDIO · una línea de', months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
   cats={'plan':'Planificar la obra','estetica':'Estética y bienestar','luz':'Luz','energia':'Energía y confort','espacios':'Espacios'}),
}
LANGS_HOME = {'es': '/', 'ca': '/ca/', 'en': '/en/', 'ru': '/ru/'}

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\[(.+?)\]\((.+?)\)', lambda m: f'<a href="{m.group(2)}">{m.group(1)}</a>', t)
    return t

def md(src):
    out, para, lst, kind = [], [], [], None
    def flush():
        nonlocal para, lst, kind
        if para: out.append('<p>' + inline(' '.join(para)) + '</p>'); para = []
        if lst: out.append(f'<{kind}>' + ''.join(f'<li>{inline(x)}</li>' for x in lst) + f'</{kind}>'); lst = []; kind = None
    for line in src.strip().split('\n'):
        s = line.strip()
        if not s: flush(); continue
        if s.startswith('## '): flush(); out.append(f'<h2 id="{slugify(s[3:])}">{inline(s[3:])}</h2>'); continue
        if s.startswith('### '): flush(); out.append(f'<h3>{inline(s[4:])}</h3>'); continue
        m = re.match(r'^(- |\d+\. )(.*)', s)
        if m:
            if para: flush()
            k = 'ul' if m.group(1) == '- ' else 'ol'
            if kind and kind != k: flush()
            kind = k; lst.append(m.group(2)); continue
        if lst: flush()
        para.append(s)
    flush()
    return '\n'.join(out)

def slugify(t):
    t = t.lower()
    for a, b in zip('áéíóúüñàèìòùç', 'aeiouunaeiouc'): t = t.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')

def words(src): return len(re.findall(r'\w+', re.sub(r'\[(.+?)\]\(.+?\)', r'\1', src)))

def langs_switch(cur):
    items = []
    for l in ['es', 'ca', 'en', 'ru']:
        if l == cur: items.append(f'<span aria-current="true" style="font-weight:600">{l.upper()}</span>')
        else: items.append(f'<a href="{LANGS_HOME[l]}" hreflang="{l}" lang="{l}" style="text-decoration:none">{l.upper()}</a>')
    return '<span class="langs" style="display:flex;gap:10px;font-size:14px;color:var(--soft)">' + ' · '.join(items) + '</span>'

def head(L, title, desc, url, img, extra=''):
    return f'''<!doctype html>
<html lang="{L['html_lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="COR STUDIO">
<meta property="og:locale" content="{L['locale']}">
<meta property="og:url" content="{url}">
<meta property="og:title" content="{html.escape(title)}">
<meta property="og:description" content="{html.escape(desc)}">
<meta property="og:image" content="{img}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#3F5F4A">
<link rel="icon" href="/logo/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/logo/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Prata&family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/styles.css">
{extra}</head>
<body>
'''

def header(L, cur):
    nav = ''.join(f'<a href="{h}">{t}</a>\n' for h, t in L['nav'])
    return f'''<div class="topbar"><header class="wrap site-header">
<a class="logo" href="{LANGS_HOME[cur]}" aria-label="COR STUDIO"><img src="/logo/isotipo-cor-studio-blanco.svg" alt="" width="44" height="44"><b>COR STUDIO</b><small>BY COR HOMES</small></a>
<nav class="nav">
{nav}{langs_switch(cur)}
<a class="btn btn-dark" href="{L['quote']}">{L['cta_btn']}</a>
</nav>
</header></div>
'''

def footer(L):
    return f'''<footer class="wrap site-footer">
<span>{L['footer']} <a href="https://cor.homes">COR HOMES</a></span>
<span><a href="{L['prefix']}/blog/">{L['blog']}</a> · www.studio.cor.homes</span>
</footer>
</body>
</html>
'''

def fdate(L, d):
    y, m, dd = map(int, d.split('-')); return f"{dd} de {L['months'][m-1]} de {y}" if L['html_lang'] in ('es',) else d

def card(L, p):
    return (f'<a class="post-card" href="{L["prefix"]}/blog/{p["slug"]}">'
            f'<img class="photo" src="{IMG(p["img"], 700)}" alt="{html.escape(p["alt"])}" loading="lazy" style="height:210px">'
            f'<span class="post-cat">{L["cats"][p["cat"]]}</span><strong>{html.escape(p["h1"])}</strong>'
            f'<span class="post-ex">{html.escape(p["desc"])}</span></a>')

def build(lang):
    L = LANG[lang]
    posts = []
    for f in sorted(glob.glob(f'/home/claude/blog/posts_{lang}_*.py')):
        spec = importlib.util.spec_from_file_location('m', f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        posts += m.POSTS
    by = {p['slug']: p for p in posts}
    base = f"{SITE}{L['prefix']}/blog/"
    report = []
    for p in posts:
        url = base + p['slug']
        w = words(p['body']) + words(p['intro']); mins = max(3, round(w / 220))
        rel = ''.join(card(L, by[s]) for s in p['related'] if s in by)
        missing = [s for s in p['related'] if s not in by]
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "BlogPosting", "headline": p['h1'], "description": p['desc'], "inLanguage": L['html_lang'],
             "image": IMG(p['img']), "datePublished": p['date'], "dateModified": p['date'], "mainEntityOfPage": url,
             "author": {"@type": "Organization", "name": "COR STUDIO", "url": SITE + LANGS_HOME[lang]},
             "publisher": {"@type": "Organization", "name": "COR STUDIO", "logo": {"@type": "ImageObject", "url": SITE + "/logo/apple-touch-icon.png"}}},
            {"@type": "BreadcrumbList", "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": L['home'], "item": SITE + LANGS_HOME[lang]},
             {"@type": "ListItem", "position": 2, "name": L['blog'], "item": base},
             {"@type": "ListItem", "position": 3, "name": p['h1'], "item": url}]}]}
        extra = f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
        page = head(L, p['seo_title'], p['desc'], url, IMG(p['img']), extra) + header(L, lang) + f'''<main class="wrap article">
<nav class="crumbs" aria-label="breadcrumb"><a href="{LANGS_HOME[lang]}">{L['home']}</a> › <a href="{L['prefix']}/blog/">{L['blog']}</a> › <span>{L['cats'][p['cat']]}</span></nav>
<p class="eyebrow">{L['cats'][p['cat']].upper()}</p>
<h1 class="serif">{html.escape(p['h1'])}</h1>
<p class="post-meta">{L['updated']} {fdate(L, p['date'])} · {mins} {L['read']}</p>
<img class="photo post-hero" src="{IMG(p['img'])}" alt="{html.escape(p['alt'])}" fetchpriority="high">
<div class="prose">
<p class="lead">{inline(p['intro'])}</p>
{md(p['body'])}
</div>
<aside class="post-cta">
<h2>{L['cta_h']}</h2>
<p>{L['cta_p']}</p>
<a class="btn btn-light" href="{L['quote']}">{L['cta_btn']}</a>
</aside>
<section class="related"><h2>{L['related']}</h2><div class="post-grid">{rel}</div>
<p><a href="{L['prefix']}/blog/">← {L['back']}</a></p></section>
</main>
''' + footer(L)
        open(f"{OUT}{L['prefix'].strip('/') + '/' if L['prefix'] else ''}blog/{p['slug']}.html", 'w').write(page)
        report.append((p['slug'], len(p['seo_title']), len(p['desc']), w, missing))
    # index
    secs = ''
    for c, name in L['cats'].items():
        ps = [p for p in posts if p['cat'] == c]
        if ps: secs += f'<section class="blog-sec"><h2>{name}</h2><div class="post-grid">' + ''.join(card(L, p) for p in ps) + '</div></section>\n'
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": L['blog_title'], "url": base, "inLanguage": L['html_lang'],
          "blogPost": [{"@type": "BlogPosting", "headline": p['h1'], "url": base + p['slug']} for p in posts]}
    idx = head(L, L['blog_title'], L['blog_desc'], base, IMG(posts[0]['img']), f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n') + header(L, lang) + f'''<main class="wrap">
<section class="blog-hero">
<p class="eyebrow">{L['blog_eyebrow']}</p>
<h1 class="serif">{L['blog_h1']}</h1>
<p class="lead">{L['blog_intro']}</p>
</section>
{secs}<aside class="post-cta"><h2>{L['cta_h']}</h2><p>{L['cta_p']}</p><a class="btn btn-light" href="{L['quote']}">{L['cta_btn']}</a></aside>
</main>
''' + footer(L)
    open(f"{OUT}{L['prefix'].strip('/') + '/' if L['prefix'] else ''}blog/index.html", 'w').write(idx)
    return posts, report

if __name__ == '__main__':
    import os
    lang = sys.argv[1] if len(sys.argv) > 1 else 'es'
    os.makedirs(OUT + (LANG[lang]['prefix'].strip('/') + '/' if LANG[lang]['prefix'] else '') + 'blog', exist_ok=True)
    posts, rep = build(lang)
    for r in rep: print(f'{r[0]:45} title={r[1]:2} desc={r[2]:3} words={r[3]:4} {"MISSING "+",".join(r[4]) if r[4] else ""}')
    print(len(posts), 'entradas')
