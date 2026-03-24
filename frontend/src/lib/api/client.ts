import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh automático en 401
let isRefreshing = false;
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !isRefreshing) {
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('access_token', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        isRefreshing = false;
        return api(original);
      } catch {
        isRefreshing = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('servimatch-auth'); // Limpiar caché de Zustand para evitar auto-rehidratación
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
