import api from './client';

export const reviewsApi = {
  create: (data: { requestId: string; rating: number; comment?: string }) =>
    api.post('/reviews', data),

  reply: (reviewId: string, reply: string) =>
    api.patch(`/reviews/${reviewId}/reply`, { reply }),
};
