import { API_URL } from '../config/api';
const CUSTOMER_TOKEN_KEY = 'cosanostra_customer_token';
const CUSTOMER_USER_KEY = 'cosanostra_customer_user';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(body?.message || fallbackMessage);
  }

  return body;
}

export function getStoredCustomerToken() {
  return localStorage.getItem(CUSTOMER_TOKEN_KEY);
}

export function getStoredCustomer() {
  const token = getStoredCustomerToken();
  if (!token) {
    localStorage.removeItem(CUSTOMER_USER_KEY);
    return null;
  }

  const rawUser = localStorage.getItem(CUSTOMER_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    clearCustomerSession();
    return null;
  }
}

export function storeCustomerSession({ token, user }) {
  localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(user));
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
}

export async function loginCustomer({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { data } = await getJson(res, 'No pudimos iniciar sesion');

  if (data.user.role !== 'customer') {
    throw Error('Esta cuenta no es de cliente');
  }

  storeCustomerSession(data);

  return data;
}

export async function registerCustomer({ name, email, phone, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { data } = await getJson(res, 'No pudimos crear la cuenta');

  storeCustomerSession(data);

  return data;
}

export async function getCurrentCustomer() {
  const token = getStoredCustomerToken();
  if (!token) {
    clearCustomerSession();
    return null;
  }

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    clearCustomerSession();
    return null;
  }

  const { data } = await getJson(res, 'Sesion invalida');

  if (data.user.role !== 'customer') {
    clearCustomerSession();
    return null;
  }

  storeCustomerSession({ token, user: data.user });

  return data.user;
}
