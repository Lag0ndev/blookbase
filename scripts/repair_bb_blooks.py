#!/usr/bin/env python3
from pathlib import Path
p = Path('bb-blooks.js')
t = p.read_text(encoding='utf-8')
# Fix accidental literal +\\n from bad pushes
t2 = t.replace("+\\n", "+")
t2 = t2.replace("+\n    '", "+'")
# More aggressive: remove backslash-n sequences that broke JS
import re
t2 = re.sub(r"'\+\\n\s*'", "'+'", t2)
t2 = re.sub(r"\+\\n\s*'", "+'", t2)
if t2 == t:
    # try alternate form already in file
    t2 = t.replace("'+
", "'+")
p.write_text(t2)
print('repaired', len(t), '->', len(t2))
# basic check
if "SyntaxError" in t2:
    raise SystemExit('still bad')
print('ok')
