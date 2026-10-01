#!/usr/bin/env python3
"""Patch index.html: home Spooky LIVE + What's New clickable blooks + bb-ui-fixes script."""
import re
from pathlib import Path

path = Path("index.html")
html = path.read_text(encoding="utf-8")
changed = False

old_banner = """                    <img class=\"home-banner-logo\" src=\"https://ac.blooket.com/marketassets/blooks/pumpkin.svg\" alt=\"Spooktober\" draggable=\"false\" width=\"56\" height=\"56\">
                    <div>
                        <div class=\"home-banner-label\">Spooktober</div>
                        <h2>Spooktober is coming!</h2>
                        <p>The Halloween event countdown is live \u2014 track days until Spooktober, plus Season 9 and more event timers.</p>
                    </div>"""

# Try both em-dash encodings
candidates = [
    (
        '''                    <img class="home-banner-logo" src="https://ac.blooket.com/marketassets/blooks/pumpkin.svg" alt="Spooktober" draggable="false" width="56" height="56">
                    <div>
                        <div class="home-banner-label">Spooktober</div>
                        <h2>Spooktober is coming!</h2>
                        <p>The Halloween event countdown is live \u2014 track days until Spooktober, plus Season 9 and more event timers.</p>
                    </div>''',
        '''                    <img class="home-banner-logo" src="https://ac.blooket.com/marketassets/blooks/spookymoth.svg" alt="Spooky Pack" draggable="false" width="56" height="56">
                    <div>
                        <div class="home-banner-label">Spooktober \u00b7 LIVE</div>
                        <h2>Spooky Pack is LIVE!</h2>
                        <p>Halloween is here \u2014 Spooky Pack is in the Market with 14 blooks. Open Countdown for event timers and Season updates.</p>
                    </div>''',
    ),
]

# Plain unicode versions
old1 = (
    '                    <img class="home-banner-logo" src="https://ac.blooket.com/marketassets/blooks/pumpkin.svg" '
    'alt="Spooktober" draggable="false" width="56" height="56">\n'
    '                    <div>\n'
    '                        <div class="home-banner-label">Spooktober</div>\n'
    '                        <h2>Spooktober is coming!</h2>\n'
)
if old1 in html:
    # replace line by line more robustly
    html2 = html.replace(
        'src="https://ac.blooket.com/marketassets/blooks/pumpkin.svg" alt="Spooktober"',
        'src="https://ac.blooket.com/marketassets/blooks/spookymoth.svg" alt="Spooky Pack"',
        1,
    )
    html2 = html2.replace(
        '<div class="home-banner-label">Spooktober</div>',
        '<div class="home-banner-label">Spooktober \u00b7 LIVE</div>',
        1,
    )
    html2 = html2.replace(
        '<h2>Spooktober is coming!</h2>',
        '<h2>Spooky Pack is LIVE!</h2>',
        1,
    )
    # replace home banner paragraph - match flexible dash
    html2, n = re.subn(
        r'(<div class="home-banner">[\s\S]*?<p>)The Halloween event countdown is live.{0,120}?(</p>)',
        r'\1Halloween is here \u2014 Spooky Pack is in the Market with 14 blooks. Open Countdown for event timers and Season updates.\2',
        html2,
        count=1,
    )
    if html2 != html:
        html = html2
        changed = True
        print("banner patched", n)
else:
    if "Spooky Pack is LIVE!" in html and "Spooktober is coming!" not in html:
        print("banner already LIVE")
    else:
        print("WARNING: banner pattern not found")

# What's New clickable blooks
start = html.find('id="view-whatsnew"')
end = html.find('id="view-videos"')
if start > 0 and end > start:
    section = html[start:end]
    idx = section.find("pack-blooks-grid")
    g_end = section.find('<div class="leaks-section">\n                <h3>Contest of Candy</h3>')
    if g_end < 0:
        g_end = section.rfind('<div class="leaks-section"', idx if idx > 0 else 0)
    if idx >= 0 and g_end > idx:
        grid = section[idx:g_end]
        count = 0

        def r2(m):
            nonlocal count
            inner = m.group(1)
            if "onclick=" in m.group(0) or "bb-click" in m.group(0):
                return m.group(0)
            name_m = re.search(r'class="bn">([^<]+)', inner)
            rar_m = re.search(r'class="br[^"]*">([^<]+)', inner)
            ch_m = re.search(r'class="chance">([^<%]+)', inner)
            if not name_m:
                return m.group(0)
            n = name_m.group(1).strip()
            r = rar_m.group(1).strip() if rar_m else "Uncommon"
            c = ch_m.group(1).strip() if ch_m else None
            try:
                carg = str(float(c)) if c is not None else "null"
            except Exception:
                carg = "null"
            count += 1
            return (
                f'<div class="pack-blook bb-click" style="cursor:pointer" '
                f'onclick="openBlookDetail(\'{n}\', \'{r}\', {carg}, \'Spooky Pack\')">{inner}</div>'
            )

        grid2 = re.sub(r'<div class="pack-blook">([\s\S]*?)</div>', r2, grid)
        if count:
            section2 = section[:idx] + grid2 + section[g_end:]
            html = html[:start] + section2 + html[end:]
            changed = True
            print("whatsnew clickable", count)
        else:
            print("whatsnew already clickable or no matches")
    else:
        print("WARNING: whatsnew grid not found", idx, g_end)
else:
    print("WARNING: whatsnew section not found")

# script tag
if "bb-ui-fixes.js" not in html:
    old = (
        '<script src="bb-settings-enhance.js" defer></script>\n'
        '<script src="bb-leaks-tracker.js" defer></script>\n'
        '<script src="bb-weekly-shop.js" defer></script>'
    )
    new = old + '\n<script src="bb-ui-fixes.js" defer></script>'
    if old in html:
        html = html.replace(old, new, 1)
        changed = True
        print("script tag added")
    else:
        print("WARNING: script block not found")
else:
    print("script already present")

if changed:
    path.write_text(html, encoding="utf-8")
    print("wrote index.html", len(html))
else:
    print("no changes")
