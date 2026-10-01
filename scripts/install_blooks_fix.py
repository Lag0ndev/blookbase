#!/usr/bin/env python3
import base64
from pathlib import Path
bc = []
for i in range(4):
  bc.append(Path(f'scripts/blooks_chunk_{i}.b64').read_text().strip())
jc = []
for i in range(2):
  jc.append(Path(f'scripts/bbjs_chunk_{i}.b64').read_text().strip())
Path('data').mkdir(exist_ok=True)
Path('data/blooks.json').write_bytes(base64.b64decode(''.join(bc)))
Path('bb-blooks.js').write_bytes(base64.b64decode(''.join(jc)))
print('installed', Path('data/blooks.json').stat().st_size, Path('bb-blooks.js').stat().st_size)
