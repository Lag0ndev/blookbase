#!/usr/bin/env python3
from pathlib import Path
p = Path("index.html")
t = p.read_text(encoding="utf-8")
if 'bb-weekly-shop.js' not in t:
    if 'bb-leaks-tracker.js' in t:
        t = t.replace(
            '<script src="bb-leaks-tracker.js" defer></script>',
            '<script src="bb-leaks-tracker.js" defer></script>\n<script src="bb-weekly-shop.js" defer></script>',
            1,
        )
        print("injected weekly shop script")
    elif "</body>" in t:
        t = t.replace("</body>", '<script src="bb-weekly-shop.js" defer></script>\n</body>', 1)
        print("injected before body")
    p.write_text(t, encoding="utf-8")
    print("WROTE", len(t))
else:
    print("already present")
