import {
  findPublicCommunityPizzas,
  findPublicCreatorBySlug,
  findPublicSavedPizzaBySlug,
} from '../models/savedCustomPizzaModel.js';
import { findIngredientsByIds } from '../models/ingredientModel.js';

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

export async function listPublicPizzas(req, res, next) {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 48)
      : 24;
    const pizzas = await findPublicCommunityPizzas(limit);
    res.json({ status: 'success', data: await enrichRecipes(pizzas) });
  } catch (err) {
    next(err);
  }
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

async function enrichRecipes(pizzas) {
  const ingredientIds = [
    ...new Set(
      pizzas.flatMap((pizza) =>
        pizza.recipe.items.map((item) => item.ingredientId),
      ),
    ),
  ];
  const ingredients = await findIngredientsByIds(ingredientIds);
  const ingredientById = new Map(ingredients.map((item) => [item.id, item]));

  return pizzas.map((pizza) => ({
    ...pizza,
    recipe: {
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
    },
  }));
}

export async function getPublicCreator(req, res, next) {
  try {
    const profile = await findPublicCreatorBySlug(req.params.slug);
    if (!profile) throw notFound('Creador no encontrado');

    const pizzas = await enrichRecipes(profile.pizzas);
    res.json({
      status: 'success',
      data: { creator: profile.creator, pizzas },
    });
  } catch (err) {
    next(err);
  }
}
