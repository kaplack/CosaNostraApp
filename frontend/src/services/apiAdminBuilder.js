import { getStoredToken } from './apiAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) throw Error(body?.message || fallbackMessage);

  return body;
}

function authHeaders() {
  const token = getStoredToken();

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminPizzaSizes() {
  const res = await fetch(`${API_URL}/admin/pizza-sizes`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar los tamanos');

  return data;
}

export async function createAdminPizzaSize(payload) {
  const res = await fetch(`${API_URL}/admin/pizza-sizes`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos crear el tamano');

  return data;
}

export async function updateAdminPizzaSize(id, payload) {
  const res = await fetch(`${API_URL}/admin/pizza-sizes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar el tamano');

  return data;
}

export async function getAdminIngredients(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, value);
  });

  const query = params.toString();
  const res = await fetch(
    `${API_URL}/admin/ingredients${query ? `?${query}` : ''}`,
    { headers: authHeaders() },
  );
  const { data } = await getJson(res, 'No pudimos cargar los insumos');

  return data;
}

export async function createAdminIngredient(payload) {
  const res = await fetch(`${API_URL}/admin/ingredients`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos crear el insumo');

  return data;
}

export async function updateAdminIngredient(id, payload) {
  const res = await fetch(`${API_URL}/admin/ingredients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar el insumo');

  return data;
}

export async function uploadAdminIngredientImage(id, file) {
  const token = getStoredToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/admin/ingredients/${id}/image`, {
    method: 'POST',
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await getJson(res, 'No pudimos subir la imagen del insumo');

  return data;
}
