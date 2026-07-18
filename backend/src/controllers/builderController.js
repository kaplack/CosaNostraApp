import { findBuilderIngredients } from '../models/ingredientModel.js';
import { findActivePizzaSizes } from '../models/pizzaSizeModel.js';

export async function listBuilderPizzaSizes(req, res, next) {
  try {
    const sizes = await findActivePizzaSizes();
    res.json({ status: 'success', data: sizes });
  } catch (err) {
    next(err);
  }
}

export async function listBuilderIngredients(req, res, next) {
  try {
    const ingredients = await findBuilderIngredients();
    res.json({ status: 'success', data: ingredients });
  } catch (err) {
    next(err);
  }
}
