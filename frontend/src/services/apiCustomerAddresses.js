import { getStoredCustomerToken } from './apiCustomerAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(body?.message || fallbackMessage);
  }

  return body;
}

function authHeaders() {
  const token = getStoredCustomerToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getMyAddresses() {
  const res = await fetch(`${API_URL}/customer/addresses`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar tus direcciones');

  return data;
}

export async function createMyAddress(payload) {
  const res = await fetch(`${API_URL}/customer/addresses`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos guardar la direccion');

  return data;
}

export async function updateMyAddress(id, payload) {
  const res = await fetch(`${API_URL}/customer/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar la direccion');

  return data;
}

export async function deleteMyAddress(id) {
  const res = await fetch(`${API_URL}/customer/addresses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos eliminar la direccion');

  return data;
}
