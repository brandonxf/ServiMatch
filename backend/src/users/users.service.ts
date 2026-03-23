import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await (this.prisma as any).user.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, email: true, phone: true,
        avatarUrl: true, role: true, isWorker: true, isVerified: true, createdAt: true,
        workerProfile: {
          select: {
            id: true, bio: true, basePrice: true, priceUnit: true,
            averageRating: true, reviewCount: true, jobsCompleted: true,
            status: true, isAvailable: true, city: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return (this.prisma as any).user.update({
      where: { id },
      data: dto,
      select: {
        id: true, fullName: true, email: true, phone: true,
        avatarUrl: true, role: true, updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await (this.prisma as any).user.update({
      where: { id },
      data: { isActive: false },
    });
    return { message: 'Cuenta desactivada' };
  }

  // Solo para admin
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      (this.prisma as any).user.findMany({
        skip, take: limit,
        select: {
          id: true, fullName: true, email: true, role: true,
          isActive: true, isVerified: true, createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      (this.prisma as any).user.count(),
    ]);
    return { data: users, meta: { total, page, limit } };
  }
}
