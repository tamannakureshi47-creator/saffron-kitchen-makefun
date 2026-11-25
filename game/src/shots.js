// Screenshot scenes behind ?shot=start|play|end. Each one builds a real game
// state with the game's own rules, so the frame is what a short game really
// looks like and the same seed always gives the same frame.

import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/** Stage `world` for the named scene and return the screen to draw. */
export function stageShot(name, world) {
  world.reset();
  const state = world.state;
  if (name === 'end') {
    state.screen = 'over';
    state.score = 642;
    state.coins = 58;
    state.served = 9;
    state.failed = 1;
    state.bestCombo = 4;
    state.accuracy = 90;
    state.timeLeft = 0;
    state.level = 3;
    return { screen: SCREEN_OVER, best: 642 };
  }
  if (name === 'play') {
    state.screen = 'play';
    state.timeLeft = 118;
    state.score = 210;
    state.coins = 23;
    state.served = 3;
    state.combo = 2;
    state.level = 2;
    // Two orders waiting, one dish mid-assembly, one plate ready to serve.
    world.spawnOrder();
    world.spawnOrder();
    world.spawnOrder();
    // Build the first order's dish on the plate, leaving one ingredient out
    // so the frame reads as mid-assembly, and grill a patty for the rush.
    const first = state.orders[0];
    if (first) {
      const recipe = state.orders[0];
      void recipe;
    }
    // Plate: bun + cheese + lettuce (a Classic Burger in progress).
    state.plate = ['bun', 'cheese', 'lettuce'];
    state.grill = [{ id: 'patty', cookedId: 'patty-cooked', name: 'Grilled Patty', emoji: '🍖', left: 1.2, total: 3, done: false }];
    state.ready = ['bacon-cooked'];
    state.message = '🍔 Classic Burger in progress — grill the patty, then serve!';
    state.messageKind = '';
    return { screen: SCREEN_PLAY, best: 210 };
  }
  // start: title over a kitchen that already has orders waiting behind it.
  state.screen = 'title';
  state.timeLeft = 150;
  world.spawnOrder();
  world.spawnOrder();
  state.plate = ['bun', 'cheese'];
  return { screen: SCREEN_TITLE, best: 0 };
}
