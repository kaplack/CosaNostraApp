import {
  createCustomerAddress,
  deleteCustomerAddress,
  findCustomerAddresses,
  updateCustomerAddress,
} from '../models/customerAddressModel.js';

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

  if (!partial || body.label !== undefined) {
    if (!body.label?.trim()) throw badRequest('El nombre de la direccion es requerido');
    payload.label = body.label.trim();
  }

  if (!partial || body.address !== undefined) {
    if (!body.address?.trim()) throw badRequest('La direccion es requerida');
    payload.address = body.address.trim();
  }

  if (body.position !== undefined) payload.position = body.position?.trim() || null;
  if (body.isDefault !== undefined) payload.isDefault = Boolean(body.isDefault);

  return payload;
}

export async function listMyAddresses(req, res, next) {
  try {
    const addresses = await findCustomerAddresses(req.user.id);
    res.json({ status: 'success', data: addresses });
  } catch (err) {
    next(err);
  }
}

export async function createMyAddress(req, res, next) {
  try {
    const address = await createCustomerAddress(
      req.user.id,
      normalizePayload(req.body)
    );
    res.status(201).json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
}

export async function updateMyAddress(req, res, next) {
  try {
    const address = await updateCustomerAddress(
      req.user.id,
      req.params.id,
      normalizePayload(req.body, { partial: true })
    );
    if (!address) throw notFound('Direccion no encontrada');

    res.json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyAddress(req, res, next) {
  try {
    const address = await deleteCustomerAddress(req.user.id, req.params.id);
    if (!address) throw notFound('Direccion no encontrada');

    res.json({ status: 'success', data: address });
  } catch (err) {
    next(err);
  }
}
