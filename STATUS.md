# Blookbase status

## Working

| Item | Status |
|------|--------|
| Site https://blookbase.vercel.app | Live |
| index.html SPA | OK |
| data/*.json | OK |
| bb-leaks-tracker.js | OK (loads implementation from pinned commit + local) |
| /api/session.js | Fixed (serves JS + loads tracker) |
| vercel.json | SPA routes only (not catch-all) |
| app.js | Fixed — no longer concatenates missing app_part*.js |
| GitHub Action tracker | Every 5 min |

## Leaks + Tracker

Loaded via `/api/session.js` and/or `app.js` → `/bb-leaks-tracker.js`.

Sidebar gets **Leaks** and **Tracker** after the main page loads.

Hard refresh after deploy: Ctrl+Shift+R

## Recent fixes (2026-10-01)

- Restricted Vercel rewrites to real app paths so static `.js` / assets are not forced through `index.html`.
- Replaced broken `app.js` part0+part1 loader with a simple enhancer loader.

## Note on failed GitHub checks

Old commits can show red Vercel checks. Only the **latest main** deploy matters.
