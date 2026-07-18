import {
  createSavedCustomPizza,
  deleteSavedCustomPizza,
  findSavedCustomPizzas,
  updateSavedCustomPizza,
} from '../models/savedCustomPizzaModel.js';

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function notFound(message) {
  const err = new Error(message);
  err.statusCode = 404;
  return err;
}

function validateRecipe(recipe) {
  return (
    recipe &&
    recipe.size &&
    Array.isArray(recipe.items) &&
    recipe.items.length > 0
  );
}

function normalizePayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) throw badRequest('El nombre de la pizza es requerido');
    payload.name = body.name.trim();
  }

  if (!partial || body.baseName !== undefined) {
    if (!body.baseName?.trim()) throw badRequest('El nombre base es requerido');
    payload.baseName = body.baseName.trim();
  }

  if (!partial || body.recipe !== undefined) {
    if (!validateRecipe(body.recipe)) throw badRequest('La receta es invalida');
    payload.recipe = body.recipe;
  }

  if (!partial || body.estimatedPrice !== undefined) {
    const estimatedPrice = Number(body.estimatedPrice);
    if (!Number.isFinite(estimatedPrice) || estimatedPrice < 0) {
      throw badRequest('El precio estimado es invalido');
    }
    payload.estimatedPrice = estimatedPrice;
  }

  return payload;
}

export async function listMySavedPizzas(req, res, next) {
  try {
    const pizzas = await findSavedCustomPizzas(req.user.id);
    res.json({ status: 'success', data: pizzas });
  } catch (err) {
    next(err);
  }
}

export async function createMySavedPizza(req, res, next) {
  try {
    const pizza = await createSavedCustomPizza(
      req.user.id,
      normalizePayload(req.body)
    );
    res.status(201).json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}

export async function updateMySavedPizza(req, res, next) {
  try {
    const pizza = await updateSavedCustomPizza(
      req.user.id,
      req.params.id,
      normalizePayload(req.body, { partial: true })
    );
    if (!pizza) throw notFound('Pizza guardada no encontrada');

    res.json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}

export async function deleteMySavedPizza(req, res, next) {
  try {
    const pizza = await deleteSavedCustomPizza(req.user.id, req.params.id);
    if (!pizza) throw notFound('Pizza guardada no encontrada');

    res.json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}
