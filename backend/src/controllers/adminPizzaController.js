import {
  createMenuItem,
  deactivateMenuItem,
  findAdminMenuItems,
  findMenuItemInstance,
  updateMenuItem,
} from '../models/menuModel.js';
import { deleteObject, uploadPizzaImage } from '../services/s3Service.js';

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

function normalizePizzaPayload(body, { partial = false } = {}) {
  const payload = {};

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) throw badRequest('El nombre es requerido');
    payload.name = body.name.trim();
  }

  if (!partial || body.unitPrice !== undefined) {
    const unitPrice = Number(body.unitPrice);
    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw badRequest('El precio debe ser un numero valido');
    }
    payload.unitPrice = unitPrice;
  }

  if (!partial || body.ingredients !== undefined) {
    const ingredients = Array.isArray(body.ingredients)
      ? body.ingredients
      : String(body.ingredients || '')
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    payload.ingredients = ingredients;
  }

  if (!partial || body.imageUrl !== undefined) {
    payload.imageUrl = body.imageUrl?.trim() || null;
  }

  if (body.imageKey !== undefined) {
    payload.imageKey = body.imageKey?.trim() || null;
  }

  if (body.soldOut !== undefined) payload.soldOut = Boolean(body.soldOut);
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

  return payload;
}

export async function listAdminPizzas(req, res, next) {
  try {
    const pizzas = await findAdminMenuItems();
    res.json({ status: 'success', data: pizzas });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPizza(req, res, next) {
  try {
    const pizza = await createMenuItem(normalizePizzaPayload(req.body));
    res.status(201).json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPizza(req, res, next) {
  try {
    const pizza = await updateMenuItem(
      req.params.id,
      normalizePizzaPayload(req.body, { partial: true })
    );

    if (!pizza) throw notFound(`Pizza ${req.params.id} no encontrada`);

    res.json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdminPizza(req, res, next) {
  try {
    const pizza = await deactivateMenuItem(req.params.id);
    if (!pizza) throw notFound(`Pizza ${req.params.id} no encontrada`);

    res.json({ status: 'success', data: pizza });
  } catch (err) {
    next(err);
  }
}

export async function uploadAdminPizzaImage(req, res, next) {
  try {
    const pizza = await findMenuItemInstance(req.params.id);
    if (!pizza) throw notFound(`Pizza ${req.params.id} no encontrada`);

    const previousImageKey = pizza.imageKey;
    const imageKey = await uploadPizzaImage({
      pizzaId: pizza.id,
      file: req.file,
    });

    const updatedPizza = await updateMenuItem(pizza.id, {
      imageKey,
      imageUrl: null,
    });

    if (previousImageKey) await deleteObject(previousImageKey);

    res.json({ status: 'success', data: updatedPizza });
  } catch (err) {
    next(err);
  }
}
