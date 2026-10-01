#!/usr/bin/env python3
import json, base64, zlib
from pathlib import Path

SPOOKY_BLOOKS = [{"name": "Pumpkin", "rarity": "Uncommon", "chance": 15.2, "url": "https://ac.blooket.com/marketassets/blooks/pumpkin.svg"}, {"name": "Swamp Monster", "rarity": "Uncommon", "chance": 15.2, "url": "https://ac.blooket.com/marketassets/blooks/swampmonster.svg"}, {"name": "Frankenstein", "rarity": "Uncommon", "chance": 15.2, "url": "https://ac.blooket.com/marketassets/blooks/frankenstein.svg"}, {"name": "Vampire", "rarity": "Uncommon", "chance": 15.2, "url": "https://ac.blooket.com/marketassets/blooks/vampire.svg"}, {"name": "Zombie", "rarity": "Uncommon", "chance": 15.2, "url": "https://ac.blooket.com/marketassets/blooks/zombie.svg"}, {"name": "Mummy", "rarity": "Rare", "chance": 4, "url": "https://ac.blooket.com/marketassets/blooks/mummy.svg"}, {"name": "Caramel Apple", "rarity": "Rare", "chance": 4, "url": "https://ac.blooket.com/marketassets/blooks/caramelapple.svg"}, {"name": "Candy Corn", "rarity": "Rare", "chance": 4, "url": "https://ac.blooket.com/marketassets/blooks/candycorn.svg"}, {"name": "Crow", "rarity": "Rare", "chance": 4, "url": "https://ac.blooket.com/marketassets/blooks/crow.svg"}, {"name": "Vampire Bat", "rarity": "Rare", "chance": 4, "url": "https://ac.blooket.com/marketassets/blooks/vampirebat.svg"}, {"name": "Werewolf", "rarity": "Epic", "chance": 1.65, "url": "https://ac.blooket.com/marketassets/blooks/werewolf.svg"}, {"name": "Goo Monster", "rarity": "Epic", "chance": 1.65, "url": "https://ac.blooket.com/marketassets/blooks/goomonster.svg"}, {"name": "Ghost", "rarity": "Legendary", "chance": 0.65, "url": "https://ac.blooket.com/marketassets/blooks/ghost.svg"}, {"name": "Spooky Moth", "rarity": "Chroma", "chance": 0.05, "url": "https://ac.blooket.com/marketassets/blooks/spookymoth.svg"}]

packs_path = Path("data/packs.json")
data = json.loads(packs_path.read_text())
packs = data.get("packs", data if isinstance(data, list) else [])
for i, p in enumerate(packs):
  if p.get("id") == "spooky" or p.get("name") == "Spooky Pack":
    packs[i] = {
      **p,
      "id": "spooky",
      "name": "Spooky Pack",
      "cost": p.get("cost", 25),
      "type": "seasonal",
      "status": "live",
      "packBottom": p.get("packBottom") or "https://ac.blooket.com/dashclassic/assets/SpookyPackBottom-Bb7nZ1oD.png",
      "blookBackground": p.get("blookBackground") or "https://ac.blooket.com/dashclassic/assets/Highlighted_Background_Spooky-BE3Q44ax.svg",
      "blooks": SPOOKY_BLOOKS,
      "released": "2026-09-30",
      "notes": "LIVE. Drop rates from in-game Pack modal. Goo Monster + Spooky Moth confirmed on CDN.",
    }
    break
else:
  packs.insert(0, {
    "id": "spooky", "name": "Spooky Pack", "cost": 25, "type": "seasonal", "status": "live",
    "packBottom": "https://ac.blooket.com/dashclassic/assets/SpookyPackBottom-Bb7nZ1oD.png",
    "blooks": SPOOKY_BLOOKS, "released": "2026-09-30",
  })
data = {"lastUpdated": "2026-10-01", "packs": packs}
packs_path.write_text(json.dumps(data, indent=2) + "\n")
print("packs updated")

countdown = {
  "lastUpdated": "2026-10-01",
  "events": [
    {
      "id": "spooky-2026",
      "name": "Spooky Pack",
      "start": "2026-09-30",
      "end": "2026-11-01",
      "status": "live",
      "notes": "LIVE NOW in Market. 14 blooks incl. Goo Monster (Epic 1.65%) and Spooky Moth (Chroma 0.05%). End date estimated from prior Halloween windows — not confirmed by Blooket."
    },
    {
      "id": "blizzard-2026",
      "name": "Blizzard Pack",
      "start": "2026-12-01",
      "end": "2027-01-05",
      "status": "upcoming",
      "notes": "Typical winter holiday window. Not confirmed — estimated on previous data."
    }
  ]
}
Path("data/countdown.json").write_text(json.dumps(countdown, indent=2) + "\n")
print("countdown updated")

up = json.loads(Path("data/updates.json").read_text())
entry = {
  "date": "2026-09-30",
  "time": "23:06:00Z",
  "type": "pack",
  "title": "Spooky Pack is LIVE",
  "body": "Spooky Pack is out in the Market with 14 blooks. Drop rates: Pumpkin/Swamp Monster/Frankenstein/Vampire/Zombie 15.2%, Mummy/Caramel Apple/Candy Corn/Crow/Vampire Bat 4%, Werewolf/Goo Monster 1.65%, Ghost 0.65%, Spooky Moth 0.05%.",
  "images": [
    {"label": "Goo Monster", "src": "https://ac.blooket.com/marketassets/blooks/goomonster.svg"},
    {"label": "Spooky Moth", "src": "https://ac.blooket.com/marketassets/blooks/spookymoth.svg"},
    {"label": "Caramel Apple", "src": "https://ac.blooket.com/marketassets/blooks/caramelapple.svg"},
    {"label": "Crow", "src": "https://ac.blooket.com/marketassets/blooks/crow.svg"},
    {"label": "Vampire Bat", "src": "https://ac.blooket.com/marketassets/blooks/vampirebat.svg"},
    {"label": "Ghost", "src": "https://ac.blooket.com/marketassets/blooks/ghost.svg"},
  ]
}
entries = up.get("entries") or []
if not entries or entries[0].get("title") != entry["title"]:
  entries.insert(0, entry)
up["entries"] = entries
up["lastUpdated"] = "2026-10-01"
Path("data/updates.json").write_text(json.dumps(up, indent=2) + "\n")
print("updates updated")

B = Path("scripts/blooks_z.txt").read_text().strip()
Path("data/blooks.json").write_bytes(zlib.decompress(base64.b64decode(B)))
print("blooks", Path("data/blooks.json").stat().st_size)
