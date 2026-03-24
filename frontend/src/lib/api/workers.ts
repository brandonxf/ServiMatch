import api from './client';
import type { WorkerProfile, SearchResult } from '@/types';

export const workersApi = {
  search: (params: {
    city?: string; category?: string;
    minRating?: number; maxPrice?: number; page?: number; limit?: number;
  }) => api.get<SearchResult>('/geo/workers', { params }),

  getById: (id: string) => api.get<WorkerProfile>(`/workers/${id}`),

  getReviews: (id: string, page?: number) =>
    api.get(`/workers/${id}/reviews`, { params: { page } }),

  getCategories: () => api.get('/services'),

  createProfile: (data: any) => api.post<WorkerProfile>('/workers/profile', data),

  updateProfile: (data: any) => api.patch<WorkerProfile>('/workers/me', data),

  getMyProfile: () => api.get<WorkerProfile>('/workers/me'),

  updateLocation: (lat: number, lng: number) =>
    api.patch('/workers/me/location', { lat, lng }),

  setAvailability: (isAvailable: boolean) =>
    api.patch('/workers/me/availability', { isAvailable }),

  addService: (data: { categoryId: string; customPrice?: number; description?: string }) =>
    api.post('/workers/me/services', data),

  removeService: (serviceId: string) =>
    api.delete(`/workers/me/services/${serviceId}`),
};
