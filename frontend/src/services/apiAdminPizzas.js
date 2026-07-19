import { getStoredToken } from './apiAuth';

import { API_URL } from '../config/api';

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

export async function getAdminPizzas() {
  const res = await fetch(`${API_URL}/admin/pizzas`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar las pizzas');

  return data;
}

export async function createAdminPizza(pizza) {
  const res = await fetch(`${API_URL}/admin/pizzas`, {
    method: 'POST',
    body: JSON.stringify(pizza),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos crear la pizza');

  return data;
}

export async function updateAdminPizza(id, pizza) {
  const res = await fetch(`${API_URL}/admin/pizzas/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(pizza),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar la pizza');

  return data;
}

export async function deactivateAdminPizza(id) {
  const res = await fetch(`${API_URL}/admin/pizzas/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos ocultar la pizza');

  return data;
}

export async function uploadAdminPizzaImage(id, file) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/admin/pizzas/${id}/image`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await getJson(res, 'No pudimos subir la imagen');

  return data;
}
