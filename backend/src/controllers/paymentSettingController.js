import {
  findPaymentSettingInstance,
  findPaymentSettings,
  PAYMENT_SETTING_METHODS,
  updatePaymentSetting,
} from '../models/paymentSettingModel.js';
import { deleteObject, uploadPaymentQr } from '../services/s3Service.js';

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

function assertValidMethod(method) {
  if (!PAYMENT_SETTING_METHODS.includes(method)) {
    throw badRequest('Metodo de pago invalido');
  }
}

function normalizePayload(body) {
  const payload = {};

  if (body.displayName !== undefined) {
    if (!body.displayName?.trim()) throw badRequest('El nombre es requerido');
    payload.displayName = body.displayName.trim();
  }

  if (body.phone !== undefined) payload.phone = body.phone.trim();
  if (body.accountHolder !== undefined) {
    payload.accountHolder = body.accountHolder.trim();
  }
  if (body.isActive !== undefined) payload.isActive = Boolean(body.isActive);

  return payload;
}

function isPaymentSettingReady(setting) {
  return Boolean(
    setting.isActive &&
      setting.accountHolder?.trim() &&
      (setting.phone?.trim() || setting.qrImageKey)
  );
}

export async function listPaymentSettings(req, res, next) {
  try {
    const settings = await findPaymentSettings({ activeOnly: true });
    res.json({
      status: 'success',
      data: settings.filter(isPaymentSettingReady),
    });
  } catch (err) {
    next(err);
  }
}

export async function listAdminPaymentSettings(req, res, next) {
  try {
    const settings = await findPaymentSettings();
    res.json({ status: 'success', data: settings });
  } catch (err) {
    next(err);
  }
}

export async function updateAdminPaymentSetting(req, res, next) {
  try {
    const method = req.params.method;
    assertValidMethod(method);

    const setting = await updatePaymentSetting(method, normalizePayload(req.body));
    if (!setting) throw notFound(`Metodo ${method} no encontrado`);

    res.json({ status: 'success', data: setting });
  } catch (err) {
    next(err);
  }
}

export async function uploadAdminPaymentQr(req, res, next) {
  try {
    const method = req.params.method;
    assertValidMethod(method);

    const setting = await findPaymentSettingInstance(method);
    if (!setting) throw notFound(`Metodo ${method} no encontrado`);

    const previousQrImageKey = setting.qrImageKey;
    const qrImageKey = await uploadPaymentQr({ method, file: req.file });
    const updatedSetting = await updatePaymentSetting(method, { qrImageKey });

    if (previousQrImageKey) await deleteObject(previousQrImageKey);

    res.json({ status: 'success', data: updatedSetting });
  } catch (err) {
    next(err);
  }
}
