import {
  Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(reviewerId: string, dto: CreateReviewDto) {
    const request = await this.prisma.request.findUnique({
      where: { id: dto.requestId },
      include: { worker: { include: { user: true } } },
    });
    if (!request) throw new NotFoundException('Solicitud no encontrada');
    if (request.clientId !== reviewerId)
      throw new ForbiddenException('Solo el cliente puede calificar');
    if (request.status !== 'COMPLETED')
      throw new BadRequestException('Solo se puede calificar un trabajo completado');

    const exists = await this.prisma.review.findUnique({ where: { requestId: dto.requestId } });
    if (exists) throw new ConflictException('Ya calificaste este servicio');

    const review = await this.prisma.review.create({
      data: {
        requestId: dto.requestId,
        reviewerId,
        workerId: request.workerId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: { reviewer: { select: { fullName: true, avatarUrl: true } } },
    });

    // Recalcular rating promedio del trabajador
    await this.recalcRating(request.workerId);

    await this.notifications.create({
      userId: request.worker.userId,
      type: 'REVIEW_RECEIVED',
      title: 'Nueva calificación recibida',
      body: `Recibiste ${dto.rating} estrellas por "${request.title}"`,
      data: { reviewId: review.id, rating: dto.rating },
    });

    return review;
  }

  async replyToReview(workerId: string, reviewId: string, reply: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (review.workerId !== workerId) throw new ForbiddenException('Sin permisos');
    if (review.workerReply) throw new ConflictException('Ya respondiste esta reseña');

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { workerReply: reply },
    });
  }

  async findByWorker(workerId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { workerId },
        skip, take: limit,
        include: { reviewer: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { workerId } }),
    ]);
    return { data: reviews, meta: { total, page, limit } };
  }

  private async recalcRating(workerId: string) {
    const result = await this.prisma.review.aggregate({
      where: { workerId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.workerProfile.update({
      where: { id: workerId },
      data: {
        averageRating: result._avg.rating ?? 0,
        reviewCount: result._count.rating,
      },
    });
  }
}
