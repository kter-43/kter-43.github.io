
# Diplomacy — Development Notes

| File | Purpose |
|------|---------|
|index.html|Main HTML scaffold. Loads all scripts and styles, defines the UI containers.|
|styles.css|All visual styling for the board, controls, overlays, and responsive layout.|
|map.js|Defines the game map: provinces, adjacency, powers, and starting positions.|
|rules.js|Core game logic: movement adjudication, support, bounces, convoys, and phase helpers.|
|app.js|UI logic: rendering, event handling, state management, and user interaction.|

## Key Design Principles
-	**Separation of Concerns:** Data (map, units) is separate from logic (rules) and UI (app).
-	**Stateless Rules:** rules.js functions are pure: they take state as input and return new state, with no side effects.
-	**Declarative Rendering:** The board is always redrawn from state; no incremental DOM updates.
