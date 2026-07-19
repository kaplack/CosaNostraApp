const configuredApiUrl =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001/api';

const apiUrlWithoutTrailingSlash = configuredApiUrl.replace(/\/+$/, '');

export const API_URL = apiUrlWithoutTrailingSlash.endsWith('/api')
  ? apiUrlWithoutTrailingSlash
  : `${apiUrlWithoutTrailingSlash}/api`;
