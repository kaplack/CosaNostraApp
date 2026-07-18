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

export async function getAdminOrders(filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, value);
  });

  const query = params.toString();
  const res = await fetch(`${API_URL}/admin/orders${query ? `?${query}` : ''}`, {
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos cargar los pedidos');

  return data;
}

export async function updateAdminOrderStatus(id, status) {
  const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar el pedido');

  return data;
}

export async function updateAdminPaymentStatus(id, paymentStatus) {
  const res = await fetch(`${API_URL}/admin/orders/${id}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentStatus }),
    headers: authHeaders(),
  });
  const { data } = await getJson(res, 'No pudimos actualizar el pago');

  return data;
}
