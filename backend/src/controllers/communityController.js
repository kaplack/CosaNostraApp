import { findPublicSavedPizzaBySlug } from '../models/savedCustomPizzaModel.js';
import { findIngredientsByIds } from '../models/ingredientModel.js';

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

export async function getPublicPizza(req, res, next) {
  try {
    const pizza = await findPublicSavedPizzaBySlug(req.params.slug);
    if (!pizza) throw notFound('Pizza publica no encontrada');

    const ingredients = await findIngredientsByIds(
      pizza.recipe.items.map((item) => item.ingredientId),
    );
    const ingredientById = new Map(ingredients.map((item) => [item.id, item]));
    const recipe = {
      ...pizza.recipe,
      items: pizza.recipe.items.map((item) => {
        const ingredient = ingredientById.get(item.ingredientId);
        return {
          ...item,
          imageUrl: ingredient?.imageUrl || null,
          selectorImageUrl:
            ingredient?.selectorImageUrl || ingredient?.imageUrl || null,
        };
      }),
    };

    res.json({ status: 'success', data: { ...pizza, recipe } });
  } catch (err) {
    next(err);
  }
}
