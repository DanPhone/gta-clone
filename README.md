# Neon Boroughs (Original Browser Prototype)

A fully original top-down open-world crime-action sandbox prototype built with plain HTML/CSS/JavaScript and no external dependencies.

## How to run
1. Download or clone this folder.
2. Open `index.html` directly in a modern browser.
3. Play immediately (no install/build step needed).

## Controls
- **Move**: `WASD` or arrow keys
- **Sprint (on foot)**: `Shift`
- **Aim**: mouse cursor
- **Shoot**: left mouse button
- **Enter/Exit vehicle**: `E`
- **Handbrake/Drift**: `Space` (while driving)
- **Cycle weapons**: `Q`
- **Restart run**: `R`

## Gameplay features
- Large scrolling city with four districts:
  - Downtown
  - Industrial
  - Suburb
  - Waterfront
- On-foot movement, aiming, and projectile combat
- Vehicle driving with acceleration, braking/reverse, handbrake drift feel, steering by speed
- Vehicle HP with visible damage + smoke/spark/explosion particles
- Civilian traffic cars driving around road networks
- Gang enemies patrolling zones and attacking player
- Police response that scales with wanted level
- Pickups for cash, ammo, medkits, armor, and weapon unlocks
- Replayable looping missions:
  - Delivery
  - Time-trial checkpoint race
  - Survive in zone
  - Eliminate gang members
- HUD with health, armor, weapon/ammo, wanted, mission status, minimap, and help text

## File overview
- `index.html`: App shell and script loading order
- `style.css`: Canvas + overlay styling
- `assets.js`: Shared constants/utilities + particle class
- `world.js`: Procedural city generation, districts, roads/buildings, world rendering
- `player.js`: Player stats and on-foot controls
- `vehicles.js`: Vehicle physics, damage visuals, traffic spawning/logic
- `combat.js`: Weapons, bullets, hit handling
- `ai.js`: Gang and police AI + enemy drops/pickups
- `missions.js`: Mission generation/update/state + world markers
- `ui.js`: HUD/minimap rendering and game-over panel
- `main.js`: Bootstrapping, input, game loop, camera, system integration

## Future upgrade ideas
- Better road graph/pathfinding with lane-level traffic
- Building interiors and enterable safehouses
- More mission chains and narrative events
- Vehicle types (bike/truck), tuning, and garages
- Save/load slots in localStorage
- Sound effects and original procedural music
- Cover system and richer enemy squad behaviors
