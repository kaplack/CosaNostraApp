import {
  createPizzaSize,
  findAdminPizzaSizes,
  updatePizzaSize,
} from '../models/pizzaSizeModel.js';

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

  ['diameterCm', 'portionMultiplier', 'basePrice'].forEach((field) => {
    if (!partial || body[field] !== undefined) {
      const value = Number(body[field]);
      if (!Number.isFinite(value) || value < 0) {
        throw badRequest(`${field} debe ser un numero valido`);
      }
      payload[field] = value;
    }
  });

  if (!partial || body.slices !== undefined) {
    const slices = Number(body.slices);
    if (!Number.isInteger(slices) || slices < 1) {
      throw badRequest('Las tajadas deben ser un entero mayor a cero');
    }
    payload.slices = slices;
  }

  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

  return payload;
}

export async function listAdminPizzaSizes(req, res, next) {
  try {
    const sizes = await findAdminPizzaSizes();
    res.json({ status: 'success', data: sizes });
  } catch (err) {
    next(err);
  }
}

export async function createAdminPizzaSize(req, res, next) {
  try {
    const size = await createPizzaSize(normalizePayload(req.body));
    res.status(201).json({ status: 'success', data: size });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPizzaSize(req, res, next) {
  try {
    const size = await updatePizzaSize(
      req.params.id,
      normalizePayload(req.body, { partial: true })
    );
    if (!size) throw notFound('Tamano no encontrado');

    res.json({ status: 'success', data: size });
  } catch (err) {
    next(err);
  }
}
