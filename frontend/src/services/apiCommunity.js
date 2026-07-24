import { API_URL } from '../config/api';

async function getJson(res, fallbackMessage) {
  const body = await res.json().catch(() => null);
  if (!res.ok) throw Error(body?.message || fallbackMessage);
  return body;
}

export async function getPublicPizza(slug) {
  const res = await fetch(`${API_URL}/community/pizzas/${slug}`);
  const { data } = await getJson(res, 'No pudimos cargar esta pizza');
  return data;
}

export async function getCommunityPizzas({ limit } = {}) {
  const query = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${API_URL}/community/pizzas${query}`);
  const { data } = await getJson(res, 'No pudimos cargar las pizzas de la comunidad');
  return data;
}

export async function getPublicCreator(slug) {
  const res = await fetch(`${API_URL}/community/creators/${slug}`);
  const { data } = await getJson(res, 'No pudimos cargar este creador');
  return data;
}
