#!/usr/bin/env python3
import base64, zlib
from pathlib import Path
B = Path("scripts/blooks_z.txt").read_text().strip()
J = Path("scripts/bbjs_z1.txt").read_text().strip() + Path("scripts/bbjs_z2.txt").read_text().strip()
Path("data").mkdir(exist_ok=True)
Path("data/blooks.json").write_bytes(zlib.decompress(base64.b64decode(B)))
Path("bb-blooks.js").write_bytes(zlib.decompress(base64.b64decode(J)))
print("ok", Path("data/blooks.json").stat().st_size, Path("bb-blooks.js").stat().st_size)
