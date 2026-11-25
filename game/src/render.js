// Painting the kitchen: every DOM update lives here, driven by world state.
// The layout is one readable frame: timer and score on top, the order board
// next, ingredients on the counter, then the grill and the plate ready to serve.

import { INGREDIENTS, RECIPES, ingredientById, recipesForLevel } from './config.js';
import { recipeById } from './recipes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
}

function ingredientChip(id, extra = '') {
  const item = ingredientById(id);
  if (!item) return '';
  return `<span class="chip ${extra}" title="${item.name}">${item.emoji} ${item.name}</span>`;
}

export function createRenderer() {
  const el = (id) => document.getElementById(id);
  // The game loop paints every animation frame. Rebuilding innerHTML that
  // often recreates every button 60 times a second, so a click or a drag
  // can lose the element mid-gesture. Each section below only rebuilds
  // when its visible content actually changes (patience/grill times are
  // rounded to whole seconds, so updates happen about once a second).
  let lastOrdersKey = null;
  let lastCounterKey = null;
  let lastGrillKey = null;
  let lastPlateKey = null;
  let lastBookKey = null;

  function renderOrders(state) {
    const board = el('order-board');
    if (!board) return;
    const key = state.orders.map((o) => `${o.id}:${o.recipeId}:${Math.ceil(o.patience)}:${o.mood}`).join('|');
    if (key === lastOrdersKey) return;
    lastOrdersKey = key;
    if (state.orders.length === 0) {
      board.innerHTML = '<div class="order-empty">No orders yet — the first customer is on their way…</div>';
      return;
    }
    board.innerHTML = state.orders.map((order) => {
      const recipe = recipeById(order.recipeId);
      const fraction = order.patience / order.patienceMax;
      const mood = order.mood === 'angry' ? '😡' : order.mood === 'impatient' ? '😟' : '😊';
      return `<article class="order-card ${order.mood}" data-order="${order.id}">
        <div class="order-head"><span class="customer">${order.customer.emoji} ${order.customer.name}</span><span class="mood">${mood}</span></div>
        <div class="order-dish">${recipe.emoji} ${recipe.name}</div>
        <div class="order-needs">${recipe.ingredients.map((id) => ingredientChip(id)).join('')}</div>
        <div class="patience"><div class="patience-fill" style="width:${Math.round(fraction * 100)}%"></div></div>
        <div class="order-price">$${recipe.price} · ${Math.ceil(order.patience)}s left</div>
      </article>`;
    }).join('');
  }

  function renderCounter(state) {
    const counter = el('ingredient-counter');
    if (!counter) return;
    const key = `${state.plate.join(',')}|${state.grill.map((s) => s.id).join(',')}`;
    if (key === lastCounterKey) return;
    lastCounterKey = key;
    counter.innerHTML = INGREDIENTS.map((item) => {
      const onPlate = state.plate.includes(item.id) || state.plate.includes(item.cookedId);
      const grilling = state.grill.some((slot) => slot.id === item.id);
      return `<button type="button" class="ingredient ${onPlate ? 'on-plate' : ''} ${grilling ? 'grilling' : ''}" data-ingredient="${item.id}" draggable="true" aria-label="Add ${item.name}${item.cooks ? ' to the grill' : ' to the plate'}">
        <span class="ingredient-emoji">${item.emoji}</span>
        <span class="ingredient-name">${item.name}</span>
        <span class="ingredient-note">${item.cooks ? '🔥 grill first' : 'tap to plate'}</span>
      </button>`;
    }).join('');
  }

  function renderGrill(state) {
    const grill = el('grill-slots');
    if (!grill) return;
    const key = `${state.grill.map((s) => `${s.id}:${Math.ceil(s.left)}`).join(',')}|${state.ready.join(',')}`;
    if (key === lastGrillKey) return;
    lastGrillKey = key;
    if (state.grill.length === 0 && state.ready.length === 0) {
      grill.innerHTML = '<div class="grill-empty">Grill is empty — tap Patty, Bacon or Egg on the counter.</div>';
      return;
    }
    const slots = state.grill.map((slot) => {
      const fraction = Math.max(0, Math.min(1, 1 - slot.left / slot.total));
      return `<div class="grill-slot cooking"><span class="grill-emoji">${slot.emoji}</span><span>${slot.name}</span><div class="grill-bar"><div style="width:${Math.round(fraction * 100)}%"></div></div><span class="grill-time">${Math.ceil(slot.left)}s</span></div>`;
    }).join('');
    const ready = state.ready.map((id) => {
      const item = ingredientById(id);
      return `<button type="button" class="grill-slot ready" data-ready="${id}"><span class="grill-emoji">${item.emoji}</span><span>${item.name}</span><span class="ready-tag">Ready — tap to plate!</span></button>`;
    }).join('');
    grill.innerHTML = slots + ready;
  }

  function renderPlate(state) {
    const plate = el('plate-items');
    if (!plate) return;
    const key = state.plate.join(',');
    if (key === lastPlateKey) return;
    lastPlateKey = key;
    if (state.plate.length === 0) {
      plate.innerHTML = '<div class="plate-empty">Your plate is empty.<br>Tap ingredients on the counter to build a dish.</div>';
      return;
    }
    plate.innerHTML = state.plate.map((id) => {
      const item = ingredientById(id);
      return `<div class="plate-item"><span class="plate-emoji">${item.emoji}</span><span>${item.name}</span></div>`;
    }).join('');
    const dish = state.plate.length > 0 ? null : null;
    void dish;
  }

  function renderRecipeBook(state) {
    const book = el('recipe-book');
    if (!book) return;
    const key = String(state.level);
    if (key === lastBookKey) return;
    lastBookKey = key;
    book.innerHTML = recipesForLevel(state.level).map((recipe) => `<div class="recipe-line"><strong>${recipe.emoji} ${recipe.name}</strong> — ${recipe.ingredients.map((id) => ingredientById(id).emoji).join(' + ')} · $${recipe.price}</div>`).join('')
      + RECIPES.filter((recipe) => recipe.level > state.level).map((recipe) => `<div class="recipe-line locked">🔒 ${recipe.name} — unlocks at Level ${recipe.level}</div>`).join('');
  }

  return {
    draw(state, screen, best, muted) {
      const timer = el('shift-timer');
      if (timer) {
        timer.textContent = `⏱ ${formatTime(state.timeLeft)}`;
        timer.classList.toggle('urgent', state.timeLeft <= 20 && screen === SCREEN_PLAY);
      }
      const score = el('score-value');
      if (score) score.textContent = String(state.score);
      const coins = el('coins-value');
      if (coins) coins.textContent = `$${state.coins}`;
      const level = el('level-value');
      if (level) level.textContent = `Level ${state.level}`;
      const served = el('served-value');
      if (served) served.textContent = `${state.served} served`;
      const mute = el('mute-button');
      if (mute) mute.textContent = muted ? '🔇 Muted' : '🔊 Sound';
      const message = el('game-message');
      if (message) {
        message.textContent = state.message || 'Welcome to Saffron Kitchen — serve every order before patience runs out!';
        message.className = `game-message ${state.messageKind || ''}`;
      }
      renderOrders(state);
      renderCounter(state);
      renderGrill(state);
      renderPlate(state);
      renderRecipeBook(state);

      const title = el('screen-title');
      const paused = el('screen-paused');
      const over = el('screen-over');
      if (title) title.classList.toggle('hidden', screen !== SCREEN_TITLE);
      if (paused) paused.classList.toggle('hidden', screen !== SCREEN_PAUSED);
      if (over) over.classList.toggle('hidden', screen !== SCREEN_OVER);
      if (screen === SCREEN_OVER && over) {
        const finalScore = el('final-score');
        if (finalScore) finalScore.textContent = String(state.score);
        const finalServed = el('final-served');
        if (finalServed) finalServed.textContent = String(state.served);
        const finalCoins = el('final-coins');
        if (finalCoins) finalCoins.textContent = `$${state.coins}`;
        const finalCombo = el('final-combo');
        if (finalCombo) finalCombo.textContent = `x${state.bestCombo}`;
        const finalAccuracy = el('final-accuracy');
        if (finalAccuracy) finalAccuracy.textContent = `${state.accuracy}%`;
        const finalBest = el('final-best');
        if (finalBest) finalBest.textContent = String(Math.max(best, state.score));
        const stars = el('final-stars');
        if (stars) {
          const starCount = state.score >= 600 ? 3 : state.score >= 350 ? 2 : state.score >= 150 ? 1 : 0;
          stars.textContent = '★'.repeat(starCount) + '☆'.repeat(3 - starCount);
          stars.setAttribute('aria-label', `${starCount} out of 3 stars`);
        }
        const verdict = el('final-verdict');
        if (verdict) verdict.textContent = state.score >= 600 ? 'A five-star dinner rush! The kitchen is yours.' : state.score >= 350 ? 'A great shift — the regulars are happy.' : state.score >= 150 ? 'A solid shift. A little more speed and you will shine.' : 'A tough shift — try again and watch the patience bars!';
      }
      document.body.dataset.screen = screen;
    },
  };
}
