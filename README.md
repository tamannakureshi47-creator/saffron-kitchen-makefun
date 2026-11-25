# saffron-kitchen-makefun

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/tamannakureshi47-creator/saffron-kitchen-makefun/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/tamannakureshi47-creator/saffron-kitchen-makefun/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Saffron Kitchen — Dinner Rush is an original 150-second restaurant cooking game: read the order board, grill what needs cooking, stack each dish on the plate, and serve it before the customer's patience runs out. Orders get faster, new recipes unlock as you level up, and combos and time bonuses reward quick, accurate serving.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome and click **Start Shift**.

No build step, no network requests, no external assets. All art is CSS and emoji, and all sounds are synthesised with WebAudio.

## How to play

- **Read the order board** — each card shows the dish, every ingredient it needs, its price, and a patience bar.
- **Tap ingredients** on the counter, or drag them to the plate. Patty, Bacon and Egg go to the grill for 3 seconds first; tap the green ready card to plate them.
- **Serve** when the plate exactly matches an order. A wrong dish costs 15 points and breaks your combo.
- **Beat the clock** — the shift lasts 150 seconds. Fast serves earn time bonuses, consecutive serves build a combo, and every 4 dishes served levels you up and unlocks new recipes.
- **Controls:** mouse click or drag, Space to start, P / Esc to pause, M to mute.

## Recipes

- Classic Burger — Bun + Grilled Patty + Cheese + Lettuce + Tomato — $14
- Cheese Melt — Bread + Cheese + Tomato — $9
- Garden Salad — Lettuce + Tomato + Onion + Avocado — $11
- Bacon Stack (Level 2) — Bun + Grilled Patty + Crispy Bacon + Cheese — $16
- Mushroom Melt (Level 2) — Bread + Mushroom + Cheese + Sauce — $12
- Sunrise Plate (Level 3) — Fried Egg + Crispy Bacon + Bread + Tomato — $15

## Screenshots

Screenshots are in `screenshots/` — 1-play.jpg is the cover: the kitchen, order board, ingredients on the counter, a dish mid-assembly, the timer, and a plate ready to serve.

## Project layout

- `main.ts` — Node 22 hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json` with `vendor/makefun-game.ts`.
- `game/index.html` — the game page.
- `game/styles.css` — all styling.
- `game/src/config.js` — tuning, ingredients, recipes.
- `game/src/world.js` — orders, grill, plate, timer, scoring, levels.
- `game/src/recipes.js` — recipe matching.
- `game/src/render.js` — DOM rendering.
- `game/src/input.js` — click, drag-and-drop and keyboard input.
- `game/src/audio.js` — synthesised WebAudio sound effects, with mute.
- `game/src/shots.js` — deterministic `?shot=start|play|end` scenes for screenshots.
- `game/src/main.js` — boot and game loop.
- `vendor/makefun-game.ts` — the kit's copy, unchanged.
- `serve.ts` — local static server for `game/`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
