import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { MessageType } from '../types/prisma.types';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  private async verifyAccess(requestId: string, userId: string) {
    const request = await (this.prisma as any).request.findUnique({
      where: { id: requestId },
      include: { worker: true },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    const isClient = request.clientId === userId;
    const isWorker = request.worker.userId === userId;
    if (!isClient && !isWorker) throw new ForbiddenException('Sin acceso al chat');
    return request;
  }

  async sendMessage(senderId: string, dto: SendMessageDto) {
    await this.verifyAccess(dto.requestId, senderId);
    return (this.prisma as any).message.create({
      data: {
        requestId: dto.requestId,
        senderId,
        content: dto.content,
        type: dto.type ?? MessageType.TEXT,
        mediaUrl: dto.mediaUrl,
      },
      include: {
        sender: { select: { id: true, fullName: true, avatarUrl: true } },
      },
    });
  }

  async getMessages(requestId: string, userId: string, page = 1, limit = 50) {
    await this.verifyAccess(requestId, userId);
    const skip = (page - 1) * limit;
    const messages = await (this.prisma as any).message.findMany({
      where: { requestId },
      skip, take: limit,
      orderBy: { createdAt: 'asc' },
      include: { sender: { select: { id: true, fullName: true, avatarUrl: true } } },
    });
    // Marcar como leídos los mensajes del otro
    await (this.prisma as any).message.updateMany({
      where: { requestId, senderId: { not: userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return messages;
  }

  async getConversations(userId: string) {
    // Obtener requests donde el usuario participa, con último mensaje
    const requests = await (this.prisma as any).request.findMany({
      where: {
        OR: [
          { clientId: userId },
          { worker: { userId } },
        ],
        status: { notIn: ['REJECTED', 'CANCELLED'] },
      },
      include: {
        client: { select: { id: true, fullName: true, avatarUrl: true } },
        worker: { include: { user: { select: { id: true, fullName: true, avatarUrl: true } } } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { sender: { select: { fullName: true } } },
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return requests.map(r => ({
      requestId: r.id,
      title: r.title,
      status: r.status,
      otherUser: r.clientId === userId
        ? { id: r.worker.user.id, fullName: r.worker.user.fullName, avatarUrl: r.worker.user.avatarUrl }
        : { id: r.client.id, fullName: r.client.fullName, avatarUrl: r.client.avatarUrl },
      lastMessage: r.messages[0] ?? null,
      updatedAt: r.updatedAt,
    }));
  }
}
