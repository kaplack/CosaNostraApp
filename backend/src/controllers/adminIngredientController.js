import {
  createIngredient,
  findIngredientInstance,
  findAdminIngredients,
  INGREDIENT_CATEGORIES,
  INGREDIENT_UNITS,
  INGREDIENT_VISUAL_MODES,
  updateIngredient,
} from '../models/ingredientModel.js';
import {
  deleteObject,
  uploadIngredientImage,
  uploadIngredientSelectorImage,
} from '../services/s3Service.js';

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

function normalizePayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) throw badRequest('El nombre es requerido');
    payload.name = body.name.trim();
  }

  if (!partial || body.category !== undefined) {
    if (!INGREDIENT_CATEGORIES.includes(body.category)) {
      throw badRequest('Categoria invalida');
    }
    payload.category = body.category;
  }

  if (!partial || body.unit !== undefined) {
    if (!INGREDIENT_UNITS.includes(body.unit)) throw badRequest('Unidad invalida');
    payload.unit = body.unit;
  }

  ['portionQuantity', 'costPerPortion', 'pricePerPortion'].forEach((field) => {
    if (!partial || body[field] !== undefined) {
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0) {
        throw badRequest(`${field} debe ser un numero valido`);
      }
      payload[field] = value;
    }
  });

  if (!partial || body.maxPortions !== undefined) {
    const maxPortions = Number(body.maxPortions);
    if (!Number.isInteger(maxPortions) || maxPortions < 1) {
      throw badRequest('El maximo de porciones debe ser mayor a cero');
    }
    payload.maxPortions = maxPortions;
  }

  if (!partial || body.visualMode !== undefined) {
    if (!INGREDIENT_VISUAL_MODES.includes(body.visualMode)) {
      throw badRequest('Modo visual invalido');
    }
    payload.visualMode = body.visualMode;
  }

  if (!partial || body.spritesPerPortion !== undefined) {
    const spritesPerPortion = Number(body.spritesPerPortion);
    if (!Number.isInteger(spritesPerPortion) || spritesPerPortion < 0) {
      throw badRequest('Sprites por porcion debe ser un entero mayor o igual a cero');
    }
    payload.spritesPerPortion = spritesPerPortion;
  }

  if (body.visualSizeCm !== undefined) {
    const visualSizeCm =
      body.visualSizeCm === '' || body.visualSizeCm === null
        ? null
        : Number(body.visualSizeCm);
    if (visualSizeCm !== null && (!Number.isFinite(visualSizeCm) || visualSizeCm < 0)) {
      throw badRequest('Tamano visual debe ser un numero valido');
    }
    payload.visualSizeCm = visualSizeCm;
  }

  if (body.supportsPartialArea !== undefined) {
    payload.supportsPartialArea = Boolean(body.supportsPartialArea);
  }

  if (body.imageUrl !== undefined) payload.imageUrl = body.imageUrl?.trim() || null;
  if (body.selectorImageUrl !== undefined) {
    payload.selectorImageUrl = body.selectorImageUrl?.trim() || null;
  }
  if (body.isAvailable !== undefined) {
    payload.isAvailable = Boolean(body.isAvailable);
  }
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

  return payload;
}

export async function listAdminIngredients(req, res, next) {
  try {
    const { category, isAvailable, isActive } = req.query;

    if (category && !INGREDIENT_CATEGORIES.includes(category)) {
      throw badRequest('Categoria invalida');
    }

    const ingredients = await findAdminIngredients({
      category,
      isAvailable:
        isAvailable === undefined ? undefined : isAvailable === 'true',
      isActive: isActive === undefined ? undefined : isActive === 'true',
    });

    res.json({ status: 'success', data: ingredients });
  } catch (err) {
    next(err);
  }
}

export async function createAdminIngredient(req, res, next) {
  try {
    const ingredient = await createIngredient(normalizePayload(req.body));
    res.status(201).json({ status: 'success', data: ingredient });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminIngredient(req, res, next) {
  try {
    const ingredient = await updateIngredient(
      req.params.id,
      normalizePayload(req.body, { partial: true })
    );
    if (!ingredient) throw notFound('Insumo no encontrado');

    res.json({ status: 'success', data: ingredient });
  } catch (err) {
    next(err);
  }
}

export async function uploadAdminIngredientImage(req, res, next) {
  try {
    const ingredient = await findIngredientInstance(req.params.id);
    if (!ingredient) throw notFound('Insumo no encontrado');

    const previousImageKey = ingredient.imageKey;
    const imageKey = await uploadIngredientImage({
      ingredientId: ingredient.id,
      file: req.file,
    });

    const updatedIngredient = await updateIngredient(ingredient.id, {
      imageKey,
      imageUrl: null,
    });

    if (previousImageKey) await deleteObject(previousImageKey);

    res.json({ status: 'success', data: updatedIngredient });
  } catch (err) {
    next(err);
  }
}

export async function uploadAdminIngredientSelectorImage(req, res, next) {
  try {
    const ingredient = await findIngredientInstance(req.params.id);
    if (!ingredient) throw notFound('Insumo no encontrado');

    const previousImageKey = ingredient.selectorImageKey;
    const selectorImageKey = await uploadIngredientSelectorImage({
      ingredientId: ingredient.id,
      file: req.file,
    });

    const updatedIngredient = await updateIngredient(ingredient.id, {
      selectorImageKey,
      selectorImageUrl: null,
    });

    if (previousImageKey) await deleteObject(previousImageKey);

    res.json({ status: 'success', data: updatedIngredient });
  } catch (err) {
    next(err);
  }
}
