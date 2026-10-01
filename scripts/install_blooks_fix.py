#!/usr/bin/env python3
import base64, runpy
from pathlib import Path
a = runpy.run_path("scripts/blooks_data_a.py")["DATA_A"]
b = runpy.run_path("scripts/blooks_data_b.py")["DATA_B"]
j = runpy.run_path("scripts/bbjs_data.py")["JS_DATA"]
Path("data").mkdir(exist_ok=True)
Path("data/blooks.json").write_bytes(base64.b64decode(a+b))
Path("bb-blooks.js").write_bytes(base64.b64decode(j))
print("ok", Path("data/blooks.json").stat().st_size, Path("bb-blooks.js").stat().st_size)
