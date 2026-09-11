import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('krypton_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fires a GET /health request without blocking or throwing.
 * Used to wake up the backend as early as possible on a Render free-tier
 * cold start, well before the user reaches a page that needs real data.
 */
export const pingHealth = (): void => {
  apiClient.get('/health').catch(() => {});
};

export default apiClient;
