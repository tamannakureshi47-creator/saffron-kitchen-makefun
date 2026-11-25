// Saffron Kitchen: every tuning number, colour, ingredient and recipe in one place.
// The game is a 150-second dinner rush. Orders arrive, you grill what needs cooking,
// stack the dish on the plate in any order, and serve it before the customer's
// patience runs out. Later levels unlock harder recipes and faster orders.

export const SHIFT_SECONDS = 150;
export const MAX_ORDERS = 3;
export const BEST_KEY = 'saffron-kitchen.best';

export const TUNING = {
  firstOrderDelaySeconds: 1.5,
  spawnIntervalStart: 13,
  spawnIntervalEnd: 7,
  patienceStart: 38,
  patienceEnd: 24,
  grillSeconds: 3,
  grillSlots: 2,
  levelEveryServed: 4,
  maxLevel: 6,
  wrongServePenalty: 15,
  expiredPenalty: 10,
};

export const PALETTE = {
  cream: '#fff7e6',
  wall: '#ffdf9e',
  counter: '#b4713a',
  counterDark: '#8a4f24',
  tile: '#fff3d6',
  ink: '#3a2415',
  muted: '#8a6d4d',
  green: '#2e9e5b',
  amber: '#f2a413',
  red: '#e5534b',
  gold: '#f2c94c',
  panel: '#ffffff',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** An ingredient the player can put on a plate. cookedOf names the ready version. */
export const INGREDIENTS = [
  { id: 'bun', name: 'Bun', emoji: '🥯', colour: '#e8a94e', cooks: false },
  { id: 'bread', name: 'Bread', emoji: '🍞', colour: '#e8c07a', cooks: false },
  { id: 'patty', name: 'Patty', emoji: '🥩', colour: '#c65a4a', cooks: true, cookedId: 'patty-cooked', cookedName: 'Grilled Patty', cookedEmoji: '🍖' },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', colour: '#d97b6c', cooks: true, cookedId: 'bacon-cooked', cookedName: 'Crispy Bacon', cookedEmoji: '🥓' },
  { id: 'egg', name: 'Egg', emoji: '🥚', colour: '#f7e8b0', cooks: true, cookedId: 'egg-cooked', cookedName: 'Fried Egg', cookedEmoji: '🍳' },
  { id: 'cheese', name: 'Cheese', emoji: '🧀', colour: '#f2c94c', cooks: false },
  { id: 'tomato', name: 'Tomato', emoji: '🍅', colour: '#e5534b', cooks: false },
  { id: 'lettuce', name: 'Lettuce', emoji: '🥬', colour: '#5cb85c', cooks: false },
  { id: 'onion', name: 'Onion', emoji: '🧅', colour: '#d9a0c8', cooks: false },
  { id: 'avocado', name: 'Avocado', emoji: '🥑', colour: '#7a9a4d', cooks: false },
  { id: 'mushroom', name: 'Mushroom', emoji: '🍄', colour: '#d8c8b8', cooks: false },
  { id: 'sauce', name: 'Sauce', emoji: '🥣', colour: '#f28c28', cooks: false },
];

export function ingredientById(id) {
  return INGREDIENTS.find((item) => item.id === id)
    || INGREDIENTS.flatMap((item) => (item.cookedId ? [{ id: item.cookedId, name: item.cookedName, emoji: item.cookedEmoji, colour: item.colour, cooks: false }] : [])).find((item) => item.id === id)
    || null;
}

/** Recipes unlock as the level rises. ingredients are ids; cooked ids count as served. */
export const RECIPES = [
  { id: 'classic-burger', name: 'Classic Burger', emoji: '🍔', price: 14, level: 1, ingredients: ['bun', 'patty-cooked', 'cheese', 'lettuce', 'tomato'] },
  { id: 'cheese-melt', name: 'Cheese Melt', emoji: '🧀', price: 9, level: 1, ingredients: ['bread', 'cheese', 'tomato'] },
  { id: 'garden-salad', name: 'Garden Salad', emoji: '🥗', price: 11, level: 1, ingredients: ['lettuce', 'tomato', 'onion', 'avocado'] },
  { id: 'bacon-stack', name: 'Bacon Stack', emoji: '🥓', price: 16, level: 2, ingredients: ['bun', 'patty-cooked', 'bacon-cooked', 'cheese'] },
  { id: 'mushroom-melt', name: 'Mushroom Melt', emoji: '🍄', price: 12, level: 2, ingredients: ['bread', 'mushroom', 'cheese', 'sauce'] },
  { id: 'sunrise-plate', name: 'Sunrise Plate', emoji: '🍳', price: 15, level: 3, ingredients: ['egg-cooked', 'bacon-cooked', 'bread', 'tomato'] },
];

export function recipesForLevel(level) {
  return RECIPES.filter((recipe) => recipe.level <= level);
}

export const CUSTOMERS = [
  { emoji: '👩', name: 'Maya' },
  { emoji: '🧔', name: 'Arjun' },
  { emoji: '👵', name: 'Rosa' },
  { emoji: '👨', name: 'Leo' },
  { emoji: '👩‍🦰', name: 'Priya' },
  { emoji: '🧑', name: 'Sam' },
  { emoji: '👴', name: 'Omar' },
  { emoji: '👩‍🦱', name: 'Nina' },
];
