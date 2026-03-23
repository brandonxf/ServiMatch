import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus, UserRole } from '../types/prisma.types';
import { NotificationsService } from '../notifications/notifications.service';

const REQUEST_INCLUDE = {
  client: { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
  worker: {
    include: {
      user: { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
    },
  },
  category: { select: { id: true, name: true, slug: true } },
};

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(clientId: string, dto: CreateRequestDto) {
    const worker = await (this.prisma as any).workerProfile.findUnique({ where: { id: dto.workerId } });
    if (!worker) throw new NotFoundException('Trabajador no encontrado');
    if (!worker.isAvailable || worker.status !== 'ACTIVE')
      throw new BadRequestException('El trabajador no está disponible');

    const request = await (this.prisma as any).request.create({
      data: {
        clientId,
        workerId: dto.workerId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        address: dto.address,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        budget: dto.budget,
        clientNotes: dto.clientNotes,
      },
      include: REQUEST_INCLUDE,
    });

    await this.notifications.create({
      userId: worker.userId,
      type: 'NEW_REQUEST',
      title: 'Nueva solicitud de servicio',
      body: `${request.client.fullName} solicita: ${dto.title}`,
      data: { requestId: request.id },
    });

    return request;
  }

  async findAll(userId: string, role: UserRole, status?: RequestStatus) {
    const where: any = status ? { status } : {};

    if (role === UserRole.CLIENT) {
      where.clientId = userId;
    } else if (role === UserRole.WORKER) {
      const profile = await (this.prisma as any).workerProfile.findUnique({ where: { userId } });
      if (!profile) return { data: [], meta: { total: 0 } };
      where.workerId = profile.id;
    }

    const [requests, total] = await Promise.all([
      (this.prisma as any).request.findMany({
        where, include: REQUEST_INCLUDE,
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).request.count({ where }),
    ]);
    return { data: requests, meta: { total } };
  }

  async findById(id: string, userId: string) {
    const request = await (this.prisma as any).request.findUnique({
      where: { id },
      include: { ...REQUEST_INCLUDE, review: true, messages: { take: 1 } },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const profile = await (this.prisma as any).workerProfile.findUnique({ where: { userId } });
    const isOwner = request.clientId === userId || profile?.id === request.workerId;
    if (!isOwner) throw new ForbiddenException('Sin acceso a esta solicitud');

    return request;
  }

  async changeStatus(
    id: string,
    userId: string,
    newStatus: 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    notes?: string,
  ) {
    const request = await (this.prisma as any).request.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, fullName: true } },
        worker: { include: { user: { select: { id: true } } } },
      },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    const profile = await (this.prisma as any).workerProfile.findUnique({ where: { userId } });
    const isClient = request.clientId === userId;
    const isWorker = profile?.id === request.workerId;

    // Validar permisos por transición
    if (['ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].includes(newStatus) && !isWorker)
      throw new ForbiddenException('Solo el trabajador puede hacer este cambio');
    if (newStatus === 'CANCELLED' && !isClient && !isWorker)
      throw new ForbiddenException('Sin permisos');

    const data: any = { status: newStatus };
    if (newStatus === 'COMPLETED') {
      data.completedAt = new Date();
      // Incrementar contador de trabajos
      await (this.prisma as any).workerProfile.update({
        where: { id: profile!.id },
        data: { jobsCompleted: { increment: 1 } },
      });
    }
    if (newStatus === 'CANCELLED') {
      data.cancelledBy = userId;
      data.cancelReason = notes;
    }
    if (notes && newStatus !== 'CANCELLED') {
      data.workerNotes = notes;
    }

    const updated = await (this.prisma as any).request.update({ where: { id }, data, include: REQUEST_INCLUDE });

    // Notificar a la otra parte
    const notifyUserId = isWorker ? request.clientId : request.worker.user.id;
    const notifMap: Record<string, { type: any; title: string; body: string }> = {
      ACCEPTED: { type: 'REQUEST_ACCEPTED', title: 'Solicitud aceptada', body: `Tu solicitud "${request.title}" fue aceptada` },
      REJECTED: { type: 'REQUEST_REJECTED', title: 'Solicitud rechazada', body: `Tu solicitud "${request.title}" fue rechazada` },
      COMPLETED: { type: 'REQUEST_COMPLETED', title: 'Trabajo completado', body: `El trabajo "${request.title}" fue completado` },
    };
    if (notifMap[newStatus]) {
      await this.notifications.create({
        userId: notifyUserId,
        ...notifMap[newStatus],
        data: { requestId: id },
      });
    }

    return updated;
  }
}
