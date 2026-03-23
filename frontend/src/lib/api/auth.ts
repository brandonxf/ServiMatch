import api from './client';
import type { AuthResponse, User } from '@/types';

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; phone?: string; role: string }) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),
};
