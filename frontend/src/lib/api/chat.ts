import api from './client';
import type { Message, Conversation } from '@/types';

export const chatApi = {
  getConversations: () => api.get<Conversation[]>('/chat/conversations'),
  getMessages: (requestId: string, page?: number) =>
    api.get<Message[]>(`/chat/${requestId}/messages`, { params: { page } }),
  send: (requestId: string, content: string) =>
    api.post<Message>(`/chat/${requestId}/messages`, { requestId, content }),
};
