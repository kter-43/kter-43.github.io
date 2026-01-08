
# Diplomacy (Vanilla JS) — v5 (globals export fix)

**Fix addressed**: earlier versions checked for globals on `window` while using `const` declarations, which don’t attach to `window`. This caused the orders pane to stay blank.

**What changed**
- `map.js` now **exports key objects to `window`** (`POWERS`, `PROVINCES`, `START_UNITS`, `START_OWNERSHIP`, `byPower`).
- `app.js` guards use `typeof` checks (not `window.*`).
- Startup still runs on `DOMContentLoaded` with deferred scripts.

**Use**: unzip, open `index.html`. The left pane should now list all countries and every unit’s order options.
