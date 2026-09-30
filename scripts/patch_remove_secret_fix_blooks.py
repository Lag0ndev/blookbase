#!/usr/bin/env python3
"""Fully remove Secret page; fix Blooks sidebar icon + routing."""
from pathlib import Path
import re

p = Path("index.html")
t = p.read_text(encoding="utf-8")

# 1) Remove secret sidebar
t, n = re.subn(
    r'\s*<li>\s*<button class="sidebar-link" data-view="secret"[^>]*>[\s\S]*?</button>\s*</li>',
    '',
    t,
)
print("removed secret sidebar", n)

# 2) Remove Open Secret settings section
t, n = re.subn(
    r'\s*<div class="settings-section">\s*<h3>Secret</h3>[\s\S]*?Open Secret</button>\s*</div>',
    '',
    t,
)
print("removed settings secret", n)

# 3) Path map
new_map = "const map = { home: 'home', countdown: 'countdown', whatsnew: 'whatsnew', leaks: 'whatsnew', videos: 'videos', gamemodes: 'gamemodes', banners: 'banners', market: 'market', packsim: 'packsim', updates: 'updates', settings: 'settings', about: 'about', blooks: 'blooks' };"
t2, n = re.subn(r"const map = \{ home: 'home'[^;]+;", new_map, t, count=1)
t = t2
print("path map", n)

# 4) allowed
new_a = "const allowed = ['home', 'countdown', 'whatsnew', 'videos', 'gamemodes', 'banners', 'market', 'packsim', 'updates', 'settings', 'about', 'blooks', '404'];"
t2, n = re.subn(r"const allowed = \[[^\]]+\];", new_a, t, count=1)
t = t2
print("allowed", n)

# 5) Clean old multi-view hooks
t = re.sub(
    r"\n\s*\['secret'[^\]]*\]\.forEach\([\s\S]{0,600}?__bbRenderSecret\(\);\n?",
    "\n",
    t,
)
t = re.sub(
    r"\n\s*\['secret','blooks'\]\.forEach\([\s\S]{0,500}?__bbRenderBlooks\(\);\n?",
    "\n",
    t,
)
t = re.sub(
    r"\n\s*if \(view === 'secret' && typeof window\.__bbRenderSecret === 'function'\) window\.__bbRenderSecret\(\);\n?",
    "\n",
    t,
)

marker = "if (v404) v404.style.display = view === '404' ? 'flex' : 'none';"
snippet = t[t.find(marker):t.find(marker)+900] if marker in t else ""
if marker in t and "__bbRenderBlooks" not in snippet:
    block = """
            (function(){
                var el = document.getElementById('view-blooks');
                if (el) el.style.display = view === 'blooks' ? 'flex' : 'none';
            })();
            if (view === 'blooks' && typeof window.__bbRenderBlooks === 'function') window.__bbRenderBlooks();
"""
    t = t.replace(marker, marker + block, 1)
    print("blooks hooks added")
else:
    print("blooks hooks skip/already", "__bbRenderBlooks" in snippet)

# 6) Remove view-secret HTML
if 'id="view-secret"' in t:
    s = t.find('id="view-secret"')
    st = t.rfind("<div", 0, s)
    nxt = t.find('id="view-', s + 10)
    if nxt > 0:
        div_next = t.rfind("<div", 0, nxt)
        t = t[:st] + t[div_next:]
        print("removed view-secret")
    else:
        print("warn no next after secret")

# 7) Ensure view-blooks
if 'id="view-blooks"' not in t:
    i = t.find('id="view-404"')
    st = t.rfind("<div", 0, i)
    shell = (
        '\n    <div class="main-content" id="view-blooks" '
        'style="display:none;flex-direction:column;align-items:center;">\n'
        '      <h1 class="header-title">Blooks</h1>\n'
        '      <div class="leaks-wrap"><p style="font-weight:800;">Loading blooks…</p></div>\n'
        '    </div>\n'
    )
    t = t[:st] + shell + t[st:]
    print("inserted view-blooks")
else:
    print("view-blooks exists")

# 8) Rebuild Blooks sidebar with suitcase icon
t, n = re.subn(
    r'\s*<li>\s*<button class="sidebar-link" data-view="blooks"[^>]*>[\s\S]*?</button>\s*</li>',
    '',
    t,
)
print("cleared old blooks sidebar", n)

m = re.search(r'data-view="market"[\s\S]*?</li>', t)
if not m:
    raise SystemExit("market sidebar not found")
insert = (
    '\n                <li>\n'
    '                    <button class="sidebar-link" data-view="blooks" '
    "onclick=\"switchView('blooks')\" type=\"button\">\n"
    '                        <span class="sidebar-listIcon"><i class="fas fa-suitcase"></i></span>\n'
    '                        <span class="sidebar-text">Blooks</span>\n'
    '                    </button>\n'
    '                </li>'
)
t = t[: m.end()] + insert + t[m.end() :]
print("added blooks sidebar suitcase")

p.write_text(t, encoding="utf-8")
print("OK", len(t))
sb = t[t.find('<ul class="sidebar-list">'): t.find('<ul class="sidebar-list">') + 5000] if '<ul class="sidebar-list">' in t else ''
print("sidebar secret", 'data-view="secret"' in sb)
print("fa-suitcase", "fa-suitcase" in t)
print("Open Secret", "Open Secret" in t)
print("view-secret", 'id="view-secret"' in t)
print("view-blooks", 'id="view-blooks"' in t)
