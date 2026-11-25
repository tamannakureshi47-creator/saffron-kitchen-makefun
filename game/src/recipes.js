// Recipe matching: a plate is a list of ingredient ids, a recipe is the exact
// set it must contain. Order on the plate does not matter, duplicates do not
// count, and a raw ingredient never stands in for its cooked version.

import { RECIPES, ingredientById } from './config.js';

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id) || null;
}

/** The recipe whose ingredient set exactly equals the plate, or null. */
export function matchingRecipe(plate) {
  const plateSet = new Set(plate);
  return RECIPES.find((recipe) => recipe.ingredients.length === plateSet.size
    && recipe.ingredients.every((id) => plateSet.has(id))) || null;
}

/** True when every ingredient on the plate belongs to this recipe. */
export function plateFitsRecipe(plate, recipe) {
  return plate.every((id) => recipe.ingredients.includes(id));
}

/** Ingredients of the recipe that are not on the plate yet, in recipe order. */
export function missingIngredients(plate, recipe) {
  return recipe.ingredients.filter((id) => !plate.includes(id));
}

/** Ingredients on the plate that this recipe does not want. */
export function wrongIngredients(plate, recipe) {
  return plate.filter((id) => !recipe.ingredients.includes(id));
}

/** A friendly label for an ingredient id, raw or cooked. */
export function ingredientLabel(id) {
  const item = ingredientById(id);
  return item ? `${item.emoji} ${item.name}` : id;
}
