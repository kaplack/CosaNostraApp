import { API_URL } from '../config/api';
const CUSTOMER_TOKEN_KEY = 'cosanostra_customer_token';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(body?.message || fallbackMessage);
  }

  return body;
}

export async function getMenu() {
  const res = await fetch(`${API_URL}/menu`);
  const { data } = await getJson(res, 'No pudimos cargar el menu');

  return data;
}

export async function getBuilderPizzaSizes() {
  const res = await fetch(`${API_URL}/builder/sizes`);
  const { data } = await getJson(res, 'No pudimos cargar los tamanos');

  return data;
}

export async function getBuilderIngredients() {
  const res = await fetch(`${API_URL}/builder/ingredients`);
  const { data } = await getJson(res, 'No pudimos cargar los insumos');

  return data;
}

export async function getOrder(id) {
  const res = await fetch(`${API_URL}/order/${id}`);
  const { data } = await getJson(res, `No encontramos el pedido #${id}`);

  return data;
}

export async function createOrder(newOrder) {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  const res = await fetch(`${API_URL}/order`, {
    method: 'POST',
    body: JSON.stringify(newOrder),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const { data } = await getJson(res, 'No pudimos crear el pedido');

  return data;
}

export async function getMyOrders() {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
  const res = await fetch(`${API_URL}/order/mine/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await getJson(res, 'No pudimos cargar tus pedidos');

  return data;
}

export async function updateOrder(id, updateObj) {
  const res = await fetch(`${API_URL}/order/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateObj),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  await getJson(res, 'No pudimos actualizar el pedido');
}

export async function uploadPaymentProof(id, file) {
  const formData = new FormData();
  formData.append('paymentProof', file);

  const res = await fetch(`${API_URL}/order/${id}/payment-proof`, {
    method: 'POST',
    body: formData,
  });
  const { data } = await getJson(res, 'No pudimos subir el comprobante');

  return data;
}
