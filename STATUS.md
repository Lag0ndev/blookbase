# Blookbase status

## Working

| Item | Status |
|------|--------|
| Site https://blookbase.vercel.app | Live |
| index.html SPA | OK |
| data/*.json | OK |
| bb-leaks-tracker.js | OK |
| /api/session.js | Fixed (serves JS + loads tracker) |
| vercel.json | Simple SPA rewrite |
| GitHub Action tracker | Every 5 min |

## Leaks + Tracker

Loaded automatically via `/api/session.js` \u2192 `/bb-leaks-tracker.js`.

Sidebar gets **Leaks** and **Tracker** after the main page loads.

Hard refresh after deploy: Ctrl+Shift+R

## Note on failed GitHub checks

Old commits can show red Vercel checks. Only the **latest main** deploy matters.
