import api from './client';
import type { Request } from '@/types';

export const requestsApi = {
  create: (data: {
    workerId: string; categoryId: string; title: string;
    description?: string; address?: string; scheduledAt?: string; budget?: number;
    latitude?: number; longitude?: number;
  }) => api.post<Request>('/requests', data),

  getAll: (status?: string) =>
    api.get<{ data: Request[] }>('/requests', { params: { status } }),

  getById: (id: string) => api.get<Request>(`/requests/${id}`),

  accept: (id: string) => api.patch(`/requests/${id}/accept`),
  reject: (id: string, reason?: string) => api.patch(`/requests/${id}/reject`, { reason }),
  start: (id: string) => api.patch(`/requests/${id}/start`),
  complete: (id: string, notes?: string) => api.patch(`/requests/${id}/complete`, { notes }),
  cancel: (id: string, reason?: string) => api.patch(`/requests/${id}/cancel`, { reason }),
};
