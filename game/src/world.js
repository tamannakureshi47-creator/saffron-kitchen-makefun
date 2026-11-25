// The kitchen's state and rules: orders, the grill, the plate, the shift
// timer, scoring, combos and levels. No DOM lives here, so the rules can be
// stepped forward by the game loop, by tests, or by the screenshot scenes.

import { CUSTOMERS, INGREDIENTS, RECIPES, SHIFT_SECONDS, TUNING, MAX_ORDERS, recipesForLevel } from './config.js';
import { matchingRecipe, plateFitsRecipe, recipeById } from './recipes.js';

export const EVENT_NONE = 0;
export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_LEVEL_UP = 8;
export const EVENT_GRILL_DONE = 16;
export const EVENT_OVER = 32;

let orderCounter = 0;

function randomCustomer(random) {
  return CUSTOMERS[Math.floor(random() * CUSTOMERS.length)];
}

function randomRecipe(level, random) {
  const pool = recipesForLevel(level);
  return pool[Math.floor(random() * pool.length)];
}

function patienceFor(level) {
  const t = Math.min(1, (level - 1) / (TUNING.maxLevel - 1));
  return TUNING.patienceStart + (TUNING.patienceEnd - TUNING.patienceStart) * t;
}

function spawnIntervalFor(level) {
  const t = Math.min(1, (level - 1) / (TUNING.maxLevel - 1));
  return TUNING.spawnIntervalStart + (TUNING.spawnIntervalEnd - TUNING.spawnIntervalStart) * t;
}

/** A fresh, empty kitchen. random is () => a number in [0, 1). */
export function createWorld(random) {
  const state = {
    screen: 'title',
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    failed: 0,
    combo: 0,
    bestCombo: 0,
    level: 1,
    orders: [],
    plate: [],
    grill: [],
    ready: [],
    spawnIn: TUNING.firstOrderDelaySeconds,
    message: '',
    messageKind: '',
    lastServedName: '',
    accuracy: 100,
    attempts: 0,
  };

  function spawnOrder() {
    if (state.orders.length >= MAX_ORDERS) return null;
    const recipe = randomRecipe(state.level, random);
    const customer = randomCustomer(random);
    orderCounter += 1;
    const order = {
      id: orderCounter,
      recipeId: recipe.id,
      customer,
      patience: patienceFor(state.level),
      patienceMax: patienceFor(state.level),
      mood: 'waiting',
    };
    state.orders.push(order);
    return order;
  }

  function levelFromServed() {
    return Math.min(TUNING.maxLevel, 1 + Math.floor(state.served / TUNING.levelEveryServed));
  }

  return {
    state,
    reset() {
      state.timeLeft = SHIFT_SECONDS;
      state.score = 0;
      state.coins = 0;
      state.served = 0;
      state.failed = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.level = 1;
      state.orders = [];
      state.plate = [];
      state.grill = [];
      state.ready = [];
      state.spawnIn = TUNING.firstOrderDelaySeconds;
      state.message = '';
      state.messageKind = '';
      state.lastServedName = '';
      state.accuracy = 100;
      state.attempts = 0;
      state.screen = 'play';
    },

    /** Advance timers by dt seconds. Returns an event bitmask. */
    step(dt) {
      let events = EVENT_NONE;
      if (state.screen !== 'play') return events;
      state.timeLeft = Math.max(0, state.timeLeft - dt);
      if (state.timeLeft <= 0) {
        state.screen = 'over';
        return EVENT_OVER;
      }
      state.spawnIn -= dt;
      if (state.spawnIn <= 0) {
        spawnOrder();
        state.spawnIn = spawnIntervalFor(state.level);
      }
      for (const order of state.orders) {
        order.patience = Math.max(0, order.patience - dt);
        order.mood = order.patience < order.patienceMax * 0.33 ? 'angry' : order.patience < order.patienceMax * 0.6 ? 'impatient' : 'waiting';
      }
      const expired = state.orders.filter((order) => order.patience <= 0);
      if (expired.length > 0) {
        state.orders = state.orders.filter((order) => order.patience > 0);
        state.failed += expired.length;
        state.combo = 0;
        state.score = Math.max(0, state.score - TUNING.expiredPenalty * expired.length);
        state.message = `⏰ ${expired[0].customer.name} left hungry! -${TUNING.expiredPenalty * expired.length} pts`;
        state.messageKind = 'bad';
        events |= EVENT_EXPIRED;
      }
      for (const slot of state.grill) {
        slot.left -= dt;
        if (slot.left <= 0 && !slot.done) {
          slot.done = true;
          events |= EVENT_GRILL_DONE;
        }
      }
      const done = state.grill.filter((slot) => slot.done);
      for (const slot of done) {
        state.ready.push(slot.cookedId);
        state.grill = state.grill.filter((item) => item !== slot);
      }
      if (done.length > 0) {
        state.message = `🔔 ${done.length === 1 ? 'Grill ready!' : 'Grill ready!'} Tap the cooked food to plate it.`;
        state.messageKind = 'good';
      }
      return events;
    },

    /** Click an ingredient on the counter. Raw grill food goes to the grill. */
    addIngredient(id) {
      const item = INGREDIENTS.find((entry) => entry.id === id);
      if (!item) return { ok: false, reason: 'unknown ingredient' };
      if (item.cooks) {
        if (state.grill.length >= TUNING.grillSlots) {
          state.message = '🔥 Grill is full! Wait for a slot.';
          state.messageKind = 'bad';
          return { ok: false, reason: 'grill full' };
        }
        state.grill.push({ id: item.id, cookedId: item.cookedId, name: item.cookedName, emoji: item.cookedEmoji, left: TUNING.grillSeconds, total: TUNING.grillSeconds, done: false });
        state.message = `🔥 ${item.name} on the grill — ${TUNING.grillSeconds}s`;
        state.messageKind = '';
        return { ok: true, grilled: true };
      }
      if (state.plate.includes(id)) {
        state.message = `That ${item.name.toLowerCase()} is already on the plate.`;
        state.messageKind = 'bad';
        return { ok: false, reason: 'already on plate' };
      }
      state.plate.push(id);
      return { ok: true, grilled: false };
    },

    /** Click a cooked item in the ready tray to add it to the plate. */
    addReady(cookedId) {
      if (!state.ready.includes(cookedId)) return { ok: false, reason: 'not ready' };
      if (state.plate.includes(cookedId)) return { ok: false, reason: 'already on plate' };
      state.ready = state.ready.filter((id) => id !== cookedId);
      state.plate.push(cookedId);
      return { ok: true };
    },

    undoPlate() {
      const removed = state.plate.pop();
      if (removed) {
        state.message = 'Removed the last ingredient.';
        state.messageKind = '';
      }
      return removed || null;
    },

    clearPlate() {
      state.plate = [];
      state.message = 'Plate cleared.';
      state.messageKind = '';
    },

    /** Serve the plate to the first order it matches. Returns the outcome. */
    serve() {
      state.attempts += 1;
      if (state.plate.length === 0) {
        state.message = 'The plate is empty — add ingredients first!';
        state.messageKind = 'bad';
        return { ok: false, reason: 'empty plate', events: EVENT_WRONG };
      }
      const dish = matchingRecipe(state.plate);
      if (!dish) {
        const fitsAny = state.orders.some((order) => plateFitsRecipe(state.plate, recipeById(order.recipeId)));
        state.combo = 0;
        state.failed += 1;
        state.score = Math.max(0, state.score - TUNING.wrongServePenalty);
        state.accuracy = Math.round((state.served / Math.max(1, state.attempts)) * 100);
        state.message = fitsAny
          ? `Not finished yet — check the order card for what's missing. -${TUNING.wrongServePenalty} pts`
          : `That dish matches no order! -${TUNING.wrongServePenalty} pts`;
        state.messageKind = 'bad';
        state.plate = [];
        return { ok: false, reason: 'no matching order', events: EVENT_WRONG };
      }
      const orderIndex = state.orders.findIndex((order) => order.recipeId === dish.id);
      if (orderIndex === -1) {
        state.combo = 0;
        state.failed += 1;
        state.score = Math.max(0, state.score - TUNING.wrongServePenalty);
        state.accuracy = Math.round((state.served / Math.max(1, state.attempts)) * 100);
        state.message = `No one ordered a ${dish.name} right now. -${TUNING.wrongServePenalty} pts`;
        state.messageKind = 'bad';
        state.plate = [];
        return { ok: false, reason: 'no customer for this dish', events: EVENT_WRONG };
      }
      const order = state.orders[orderIndex];
      const timeBonus = Math.round((order.patience / order.patienceMax) * 20);
      const comboBonus = state.combo * 5;
      const points = dish.price * 10 + timeBonus + comboBonus;
      state.orders.splice(orderIndex, 1);
      state.plate = [];
      state.served += 1;
      state.combo += 1;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.coins += dish.price;
      state.score += points;
      state.lastServedName = dish.name;
      state.accuracy = Math.round((state.served / Math.max(1, state.attempts)) * 100);
      const oldLevel = state.level;
      state.level = levelFromServed();
      state.message = `🎉 Served ${dish.name} to ${order.customer.name}! +${points} pts${state.combo > 1 ? ` · Combo x${state.combo}` : ''}`;
      state.messageKind = 'good';
      let events = EVENT_SERVED;
      if (state.level > oldLevel) {
        const unlocked = RECIPES.filter((recipe) => recipe.level === state.level);
        state.message += ` · Level ${state.level}! New: ${unlocked.map((recipe) => recipe.name).join(', ')}`;
        events |= EVENT_LEVEL_UP;
      }
      return { ok: true, dish, order, points, events };
    },

    spawnOrder,
    patienceFor,
  };
}
