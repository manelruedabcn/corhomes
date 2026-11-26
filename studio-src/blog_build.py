"""Genera el blog de COR STUDIO en varios idiomas.
Uso: python3 -I blog_build.py            (todos los idiomas con entradas)
Las entradas base están en posts_es_*.py (lista POSTS con slug, cat, img, date, related...).
Las traducciones están en posts_<lang>_*.py: cada entrada lleva 'key' (slug en castellano)
y 'slug' traducido; hereda cat, img, date y related de la versión castellana.
En el cuerpo se enlaza siempre con slugs castellanos (/blog/<slug-es>) y /presupuesto;
el generador los traduce a cada idioma."""
import sys, re, html, json, glob, os, importlib.util

SRC = os.environ.get('BLOG_SRC', '/home/claude/blog')
SITE = 'https://www.studio.cor.homes'
OUT = os.environ.get('BLOG_OUT', '/home/claude/corhomes/studio/')
IMG = lambda i, w=1200: f'https://images.unsplash.com/photo-{i}?w={w}&q=75&auto=format&fit=crop'
LANGS = ['es', 'ca', 'en', 'ru']
HOME = {'es': '/', 'ca': '/ca/', 'en': '/en/', 'ru': '/ru/'}

LANG = {
 'es': dict(prefix='', locale='es_ES', home='Inicio', blog='Blog', quote='/presupuesto',
   blog_title='Blog de reformas | COR STUDIO',
   blog_desc='Guías de reforma para el Garraf y el Penedès: planificación, presupuesto, luz, climatización, casa casi pasiva, cocinas, baños y espacios de calma.',
   blog_h1='Reformar con calma', blog_eyebrow='BLOG DE REFORMAS',
   blog_intro='Lo que hemos aprendido dirigiendo obras, contado para que llegues a tu reforma con criterio: cómo planificar, qué pedir en un presupuesto, cómo iluminar, cómo climatizar y cómo conseguir una casa que se viva mejor. Escribimos desde el Garraf y el Penedès, pensando en sus casas, su clima y su luz.',
   read='min de lectura', updated='Actualizado', cta_h='¿Tienes una reforma en mente?',
   cta_p='Cuéntanos qué quieres hacer y te respondemos en 48 horas con una primera valoración. Trabajamos en el Garraf y el Penedès.',
   cta_btn='Pide presupuesto', related='Sigue leyendo', back='Todas las entradas',
   nav=[('/#servicios', 'Servicios'), ('/#metodo', 'Cómo trabajamos'), ('/blog/', 'Blog')],
   footer='COR STUDIO · una línea de',
   date=lambda y, m, d: f"{d} de {['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m-1]} de {y}",
   cats={'plan': 'Planificar la obra', 'estetica': 'Estética y bienestar', 'luz': 'Luz', 'energia': 'Energía y confort', 'espacios': 'Espacios'}),
 'ca': dict(prefix='/ca', locale='ca_ES', home='Inici', blog='Blog', quote='/ca/pressupost',
   blog_title='Blog de reformes | COR STUDIO',
   blog_desc="Guies de reforma per al Garraf i el Penedès: planificació, pressupost, llum, climatització, casa gairebé passiva, cuines, banys i espais de calma.",
   blog_h1='Reformar amb calma', blog_eyebrow='BLOG DE REFORMES',
   blog_intro="El que hem après dirigint obres, explicat perquè arribis a la teva reforma amb criteri: com planificar, què demanar en un pressupost, com il·luminar, com climatitzar i com aconseguir una casa que es visqui millor. Escrivim des del Garraf i el Penedès, pensant en les seves cases, el seu clima i la seva llum.",
   read='min de lectura', updated='Actualitzat', cta_h='Tens una reforma al cap?',
   cta_p="Explica'ns què vols fer i et responem en 48 hores amb una primera valoració. Treballem al Garraf i el Penedès.",
   cta_btn='Demana pressupost', related='Continua llegint', back='Totes les entrades',
   nav=[('/ca/#servicios', 'Serveis'), ('/ca/#metodo', 'Com treballem'), ('/ca/blog/', 'Blog')],
   footer='COR STUDIO · una línia de',
   date=lambda y, m, d: f"{d} {['de gener','de febrer','de març',"d'abril",'de maig','de juny','de juliol',"d'agost",'de setembre',"d'octubre",'de novembre','de desembre'][m-1]} de {y}",
   cats={'plan': "Planificar l'obra", 'estetica': 'Estètica i benestar', 'luz': 'Llum', 'energia': 'Energia i confort', 'espacios': 'Espais'}),
 'en': dict(prefix='/en', locale='en_GB', home='Home', blog='Blog', quote='/en/quote',
   blog_title='Renovation blog | COR STUDIO',
   blog_desc='Renovation guides for Garraf and Penedès: planning, quotes, lighting, heating and cooling, near passive houses, kitchens, bathrooms and calm spaces.',
   blog_h1='Renovating, calmly', blog_eyebrow='RENOVATION BLOG',
   blog_intro='What we have learned managing renovations, written so you can approach yours with judgement: how to plan, what to ask for in a quote, how to light, heat and cool your home, and how to end up with a house that is better to live in. We write from Garraf and Penedès, with their homes, climate and light in mind.',
   read='min read', updated='Updated', cta_h='Planning a renovation?',
   cta_p='Tell us what you want to do and we will reply within 48 hours with an initial assessment. We work across Garraf and Penedès.',
   cta_btn='Get a quote', related='Keep reading', back='All posts',
   nav=[('/en/#servicios', 'Services'), ('/en/#metodo', 'How we work'), ('/en/blog/', 'Blog')],
   footer='COR STUDIO · a line by',
   date=lambda y, m, d: f"{d} {['January','February','March','April','May','June','July','August','September','October','November','December'][m-1]} {y}",
   cats={'plan': 'Planning the works', 'estetica': 'Style and wellbeing', 'luz': 'Light', 'energia': 'Energy and comfort', 'espacios': 'Spaces'}),
 'ru': dict(prefix='/ru', locale='ru_RU', home='Главная', blog='Блог', quote='/ru/quote',
   blog_title='Блог о ремонте | COR STUDIO',
   blog_desc='Гиды по ремонту в Гаррафе и Пенедесе: планирование, смета, свет, отопление и охлаждение, почти пассивный дом, кухни, ванные и спокойные зоны.',
   blog_h1='Ремонт без стресса', blog_eyebrow='БЛОГ О РЕМОНТЕ',
   blog_intro='То, чему мы научились, управляя ремонтами, — чтобы вы подошли к своему с пониманием дела: как планировать, что требовать в смете, как организовать свет, отопление и охлаждение и как получить дом, в котором приятнее жить. Мы пишем из Гаррафа и Пенедеса, думая о местных домах, климате и свете.',
   read='мин чтения', updated='Обновлено', cta_h='Планируете ремонт?',
   cta_p='Расскажите, что вы хотите сделать, и мы ответим в течение 48 часов с первичной оценкой. Работаем в Гаррафе и Пенедесе.',
   cta_btn='Запросить смету', related='Читайте также', back='Все статьи',
   nav=[('/ru/#servicios', 'Услуги'), ('/ru/#metodo', 'Как мы работаем'), ('/ru/blog/', 'Блог')],
   footer='COR STUDIO · направление',
   date=lambda y, m, d: f"{d} {['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][m-1]} {y} г.",
   cats={'plan': 'Планирование', 'estetica': 'Стиль и благополучие', 'luz': 'Свет', 'energia': 'Энергия и комфорт', 'espacios': 'Пространства'}),
}

def load(lang):
    posts = []
    for f in sorted(glob.glob(f'{SRC}/posts_{lang}_*.py')):
        spec = importlib.util.spec_from_file_location('m', f); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        posts += m.POSTS
    return posts

BASE = {p['slug']: p for p in load('es')}
DATA = {'es': {k: dict(v, key=k) for k, v in BASE.items()}}
for l in LANGS[1:]:
    d = {}
    for p in load(l):
        b = BASE[p['key']]
        d[p['key']] = dict({k: b[k] for k in ('cat', 'img', 'date', 'related')}, **p)
    if d: DATA[l] = d

def url_of(lang, key=None):
    L = LANG[lang]
    if key is None: return f"{L['prefix']}/blog/"
    return f"{L['prefix']}/blog/{DATA[lang][key]['slug']}"

def inline(t, lang):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    def link(m):
        href = m.group(2)
        mm = re.match(r'^/blog/([a-z0-9-]+)$', href)
        if mm and mm.group(1) in DATA[lang]: href = url_of(lang, mm.group(1))
        elif mm: raise SystemExit(f'enlace a entrada inexistente {href} ({lang})')
        elif href == '/presupuesto': href = LANG[lang]['quote']
        return f'<a href="{href}">{m.group(1)}</a>'
    return re.sub(r'\[(.+?)\]\((.+?)\)', link, t)

def slugify(t):
    t = t.lower()
    for a, b in zip('áéíóúüñàèìòùçï·', 'aeiouunaeioucil'): t = t.replace(a, b)
    return re.sub(r'[^a-z0-9а-яё]+', '-', t).strip('-')

def md(src, lang):
    out, para, lst, kind = [], [], [], None
    def flush():
        nonlocal para, lst, kind
        if para: out.append('<p>' + inline(' '.join(para), lang) + '</p>'); para = []
        if lst: out.append(f'<{kind}>' + ''.join(f'<li>{inline(x, lang)}</li>' for x in lst) + f'</{kind}>'); lst = []; kind = None
    for line in src.strip().split('\n'):
        s = line.strip()
        if not s: flush(); continue
        if s.startswith('## '): flush(); out.append(f'<h2 id="{slugify(s[3:])}">{inline(s[3:], lang)}</h2>'); continue
        if s.startswith('### '): flush(); out.append(f'<h3>{inline(s[4:], lang)}</h3>'); continue
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

def words(src): return len(re.findall(r'\w+', re.sub(r'\[(.+?)\]\(.+?\)', r'\1', src)))

def alternates(key=None):
    """{lang: path} de las versiones existentes de una entrada (o del índice)."""
    return {l: (url_of(l, key) if key is None or key in DATA[l] else None) for l in LANGS if l in DATA}

def langs_switch(cur, alts):
    items = []
    for l in LANGS:
        href = alts.get(l) or HOME[l]
        if l == cur: items.append(f'<span aria-current="true" style="font-weight:600">{l.upper()}</span>')
        else: items.append(f'<a href="{href}" hreflang="{l}" lang="{l}" style="text-decoration:none">{l.upper()}</a>')
    return '<span class="langs" style="display:flex;gap:10px;font-size:14px;color:var(--soft)">' + ' · '.join(items) + '</span>'

def head(lang, title, desc, path, img, alts, kind, extra=''):
    L = LANG[lang]
    hl = ''.join(f'<link rel="alternate" hreflang="{l}" href="{SITE}{p}">' for l, p in alts.items() if p)
    ru = '<style>:root{--serif:Prata,Georgia,serif}</style>\n' if lang == 'ru' else ''
    return f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{SITE}{path}">
{hl}
<meta property="og:type" content="{kind}">
<meta property="og:site_name" content="COR STUDIO">
<meta property="og:locale" content="{L['locale']}">
<meta property="og:url" content="{SITE}{path}">
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
{ru}{extra}</head>
<body>
'''

def header(lang, alts):
    L = LANG[lang]
    nav = ''.join(f'<a href="{h}">{t}</a>\n' for h, t in L['nav'])
    return f'''<div class="topbar"><header class="wrap site-header">
<a class="logo" href="{HOME[lang]}" aria-label="COR STUDIO"><img src="/logo/isotipo-cor-studio-blanco.svg" alt="" width="44" height="44"><b>COR STUDIO</b><small>BY COR HOMES</small></a>
<nav class="nav">
{nav}{langs_switch(lang, alts)}
<a class="btn btn-dark" href="{L['quote']}">{L['cta_btn']}</a>
</nav>
</header></div>
'''

def footer(lang):
    L = LANG[lang]
    return f'''<footer class="wrap site-footer">
<span>{L['footer']} <a href="https://cor.homes">COR HOMES</a></span>
<span><a href="{url_of(lang)}">{L['blog']}</a> · www.studio.cor.homes</span>
</footer>
</body>
</html>
'''

def card(lang, p):
    L = LANG[lang]
    return (f'<a class="post-card" href="{url_of(lang, p["key"])}">'
            f'<img class="photo" src="{IMG(p["img"], 700)}" alt="{html.escape(p["alt"])}" loading="lazy" style="height:210px">'
            f'<span class="post-cat">{L["cats"][p["cat"]]}</span><strong>{html.escape(p["h1"])}</strong>'
            f'<span class="post-ex">{html.escape(p["desc"])}</span></a>')

def outpath(lang, name):
    d = OUT + (lang + '/' if lang != 'es' else '') + 'blog/'
    os.makedirs(d, exist_ok=True)
    return d + name

def build(lang):
    L = LANG[lang]; posts = list(DATA[lang].values()); rep = []
    for p in posts:
        path = url_of(lang, p['key']); alts = alternates(p['key'])
        w = words(p['body']) + words(p['intro']); mins = max(3, round(w / 220))
        y, m, d = map(int, p['date'].split('-'))
        rel = ''.join(card(lang, DATA[lang][k]) for k in p['related'] if k in DATA[lang])
        ld = {"@context": "https://schema.org", "@graph": [
            {"@type": "BlogPosting", "headline": p['h1'], "description": p['desc'], "inLanguage": lang,
             "image": IMG(p['img']), "datePublished": p['date'], "dateModified": p['date'], "mainEntityOfPage": SITE + path,
             "author": {"@type": "Organization", "name": "COR STUDIO", "url": SITE + HOME[lang]},
             "publisher": {"@type": "Organization", "name": "COR STUDIO", "logo": {"@type": "ImageObject", "url": SITE + "/logo/apple-touch-icon.png"}}},
            {"@type": "BreadcrumbList", "itemListElement": [
             {"@type": "ListItem", "position": 1, "name": L['home'], "item": SITE + HOME[lang]},
             {"@type": "ListItem", "position": 2, "name": L['blog'], "item": SITE + url_of(lang)},
             {"@type": "ListItem", "position": 3, "name": p['h1'], "item": SITE + path}]}]}
        extra = f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n'
        page = head(lang, p['seo_title'], p['desc'], path, IMG(p['img']), alts, 'article', extra) + header(lang, alts) + f'''<main class="wrap article">
<nav class="crumbs" aria-label="breadcrumb"><a href="{HOME[lang]}">{L['home']}</a> › <a href="{url_of(lang)}">{L['blog']}</a> › <span>{L['cats'][p['cat']]}</span></nav>
<p class="eyebrow">{L['cats'][p['cat']].upper()}</p>
<h1 class="serif">{html.escape(p['h1'])}</h1>
<p class="post-meta">{L['updated']} {L['date'](y, m, d)} · {mins} {L['read']}</p>
<img class="photo post-hero" src="{IMG(p['img'])}" alt="{html.escape(p['alt'])}" fetchpriority="high">
<div class="prose">
<p class="lead">{inline(p['intro'], lang)}</p>
{md(p['body'], lang)}
</div>
<aside class="post-cta">
<h2>{L['cta_h']}</h2>
<p>{L['cta_p']}</p>
<a class="btn btn-light" href="{L['quote']}">{L['cta_btn']}</a>
</aside>
<section class="related"><h2>{L['related']}</h2><div class="post-grid">{rel}</div>
<p><a href="{url_of(lang)}">← {L['back']}</a></p></section>
</main>
''' + footer(lang)
        open(outpath(lang, p['slug'] + '.html'), 'w').write(page)
        rep.append((lang, p['slug'], len(p['seo_title']), len(p['desc']), w))
    secs = ''
    for c, name in L['cats'].items():
        ps = [p for p in posts if p['cat'] == c]
        if ps: secs += f'<section class="blog-sec"><h2>{name}</h2><div class="post-grid">' + ''.join(card(lang, p) for p in ps) + '</div></section>\n'
    ld = {"@context": "https://schema.org", "@type": "Blog", "name": L['blog_title'], "url": SITE + url_of(lang), "inLanguage": lang,
          "blogPost": [{"@type": "BlogPosting", "headline": p['h1'], "url": SITE + url_of(lang, p['key'])} for p in posts]}
    alts = alternates()
    idx = head(lang, L['blog_title'], L['blog_desc'], url_of(lang), IMG(posts[0]['img']), alts, 'website', f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n') + header(lang, alts) + f'''<main class="wrap">
<section class="blog-hero">
<p class="eyebrow">{L['blog_eyebrow']}</p>
<h1 class="serif">{L['blog_h1']}</h1>
<p class="lead">{L['blog_intro']}</p>
</section>
{secs}<aside class="post-cta"><h2>{L['cta_h']}</h2><p>{L['cta_p']}</p><a class="btn btn-light" href="{L['quote']}">{L['cta_btn']}</a></aside>
</main>
''' + footer(lang)
    open(outpath(lang, 'index.html'), 'w').write(idx)
    return rep

def sitemap():
    urls = ['/', '/ca/', '/en/', '/ru/', '/presupuesto', '/ca/pressupost', '/en/quote', '/ru/quote']
    for l in DATA:
        urls.append(url_of(l)); urls += [url_of(l, k) for k in DATA[l]]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + ''.join(
        f'<url><loc>{SITE}{u}</loc><lastmod>2026-11-26</lastmod></url>\n' for u in urls) + '</urlset>\n'
    open(OUT + 'sitemap.xml', 'w').write(sm)
    return len(urls)

if __name__ == '__main__':
    for l in DATA:
        for r in build(l):
            flag = '' if r[2] <= 60 and 150 <= r[3] <= 160 else '  <-- REVISAR'
            print(f'{r[0]} {r[1]:48} title={r[2]:2} desc={r[3]:3} words={r[4]:4}{flag}')
    print(sitemap(), 'URLs en el sitemap;', {l: len(DATA[l]) for l in DATA})
