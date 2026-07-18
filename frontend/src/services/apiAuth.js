const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const AUTH_TOKEN_KEY = 'cosanostra_admin_token';
const AUTH_USER_KEY = 'cosanostra_admin_user';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw Error(body?.message || fallbackMessage);
  }

  return body;
}

export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  return rawUser ? JSON.parse(rawUser) : null;
}

export function storeSession({ token, user }) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function loginAdmin({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const { data } = await getJson(res, 'No pudimos iniciar sesion');

  if (data.user.role !== 'admin') {
    throw Error('Esta cuenta no tiene acceso admin');
  }

  storeSession(data);

  return data;
}

export async function getCurrentAdmin() {
  const token = getStoredToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const { data } = await getJson(res, 'Sesion invalida');

  if (data.user.role !== 'admin') return null;

  return data.user;
}
