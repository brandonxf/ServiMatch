import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { AddServiceDto } from './dto/add-service.dto';

const WORKER_SELECT = {
  id: true, bio: true, basePrice: true, priceUnit: true,
  coverageRadiusKm: true, city: true, address: true, yearsExperience: true,
  averageRating: true, reviewCount: true, jobsCompleted: true,
  status: true, isAvailable: true, latitude: true, longitude: true,
  createdAt: true,
  user: { select: { id: true, fullName: true, email: true, avatarUrl: true, phone: true } },
  workerServices: {
    include: { category: { select: { id: true, name: true, slug: true, iconUrl: true } } },
  },
  photos: { select: { id: true, url: true, caption: true, order: true }, orderBy: { order: 'asc' as const } },
};

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateWorkerDto) {
    const existing = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (existing) throw new ConflictException('Ya tienes un perfil de trabajador');

    const [profile] = await this.prisma.$transaction([
      this.prisma.workerProfile.create({ data: { userId, ...dto }, include: { user: true } }),
      this.prisma.user.update({ where: { id: userId }, data: { isWorker: true } }),
    ]);
    return profile;
  }

  async findMyProfile(userId: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      select: WORKER_SELECT,
    });
    if (!profile) throw new NotFoundException('Perfil de trabajador no encontrado');
    return profile;
  }

  async findById(id: string) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { id },
      select: WORKER_SELECT,
    });
    if (!profile) throw new NotFoundException('Trabajador no encontrado');
    return profile;
  }

  async update(userId: string, dto: UpdateWorkerDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil no encontrado');
    return this.prisma.workerProfile.update({
      where: { userId },
      data: dto,
      select: WORKER_SELECT,
    });
  }

  async updateLocation(userId: string, lat: number, lng: number) {
    return this.prisma.workerProfile.update({
      where: { userId },
      data: { latitude: lat, longitude: lng },
      select: { id: true, latitude: true, longitude: true, updatedAt: true },
    });
  }

  async setAvailability(userId: string, isAvailable: boolean) {
    return this.prisma.workerProfile.update({
      where: { userId },
      data: { isAvailable },
      select: { id: true, isAvailable: true },
    });
  }

  async addService(userId: string, dto: AddServiceDto) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    const category = await this.prisma.serviceCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Categoría no encontrada');

    const existing = await this.prisma.workerService.findUnique({
      where: { workerId_categoryId: { workerId: profile.id, categoryId: dto.categoryId } },
    });
    if (existing) throw new ConflictException('Ya ofreces este servicio');

    const { categoryId, ...rest } = dto;
    return this.prisma.workerService.create({
      data: { workerId: profile.id, categoryId, ...rest },
      include: { category: true },
    });
  }

  async removeService(userId: string, serviceId: string) {
    const profile = await this.prisma.workerProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Perfil no encontrado');

    const ws = await this.prisma.workerService.findFirst({
      where: { id: serviceId, workerId: profile.id },
    });
    if (!ws) throw new ForbiddenException('No puedes eliminar este servicio');

    await this.prisma.workerService.delete({ where: { id: serviceId } });
    return { message: 'Servicio eliminado' };
  }

  async getReviews(workerId: string, page = 1, limit = 10) {
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
}