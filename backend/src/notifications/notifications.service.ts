import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateNotificationDto) {
    return (this.prisma as any).notification.create({ data: dto });
  }

  async findAll(userId: string, onlyUnread = false) {
    const where: any = { userId };
    if (onlyUnread) where.isRead = false;
    const [notifications, unreadCount] = await Promise.all([
      (this.prisma as any).notification.findMany({
        where, orderBy: { createdAt: 'desc' }, take: 50,
      }),
      (this.prisma as any).notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data: notifications, unreadCount };
  }

  async markAsRead(id: string, userId: string) {
    return (this.prisma as any).notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await (this.prisma as any).notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { updated: result.count };
  }
}
