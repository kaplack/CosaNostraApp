import { getStoredCustomerToken } from './apiCustomerAuth';

import { API_URL } from '../config/api';

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

export async function getMySavedPizzas() {
  const res = await fetch(`${API_URL}/customer/pizzas`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar tus pizzas');

  return data;
}

export async function createMySavedPizza(payload) {
  const res = await fetch(`${API_URL}/customer/pizzas`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos guardar la pizza');

  return data;
}

export async function deleteMySavedPizza(id) {
  const res = await fetch(`${API_URL}/customer/pizzas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos eliminar la pizza');

  return data;
}

export async function updateMySavedPizzaPublication(id, payload) {
  const res = await fetch(`${API_URL}/customer/pizzas/${id}/publication`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(
    res,
    payload.isPublic ? 'No pudimos publicar la pizza' : 'No pudimos retirar la pizza',
  );

  return data;
}
