import { getStoredToken } from './apiAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(body?.message || fallbackMessage);
  }

  return body;
}

function authHeaders() {
  const token = getStoredToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getPaymentSettings() {
  const res = await fetch(`${API_URL}/payment-settings`);
  const { data } = await getJson(res, 'No pudimos cargar los medios de pago');

  return data;
}

export async function getAdminPaymentSettings() {
  const res = await fetch(`${API_URL}/admin/payment-settings`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar los medios de pago');

  return data;
}

export async function updateAdminPaymentSetting(method, payload) {
  const res = await fetch(`${API_URL}/admin/payment-settings/${method}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos guardar el medio de pago');

  return data;
}

export async function uploadAdminPaymentQr(method, file) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('qrImage', file);

  const res = await fetch(`${API_URL}/admin/payment-settings/${method}/qr`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await getJson(res, 'No pudimos subir el QR');

  return data;
}
