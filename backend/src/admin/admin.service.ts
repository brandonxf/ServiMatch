import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalWorkers,
      totalRequests,
      completedRequests,
      pendingRequests,
      activeRequests,
      newUsersThisMonth,
      newUsersLastMonth,
      requestsThisMonth,
      requestsLastMonth,
      revenueResult,
      recentRequests,
      recentUsers,
      topWorkers,
      requestsByStatus,
      requestsByCategory,
    ] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.workerProfile.count({ where: { status: 'ACTIVE' } }),
      this.prisma.request.count(),
      this.prisma.request.count({ where: { status: 'COMPLETED' } }),
      this.prisma.request.count({ where: { status: 'PENDING' } }),
      this.prisma.request.count({ where: { status: { in: ['ACCEPTED', 'IN_PROGRESS'] } } }),

      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.user.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),

      this.prisma.request.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.request.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),

      // Suma total de trabajos completados (ingreso simulado como 10% comisión)
      this.prisma.request.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { finalPrice: true, budget: true },
      }),

      // Solicitudes recientes
      this.prisma.request.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          client: { select: { fullName: true, avatarUrl: true } },
          worker: { include: { user: { select: { fullName: true } } } },
          category: { select: { name: true } },
        },
      }),

      // Usuarios recientes
      this.prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, fullName: true, email: true,
          role: true, isVerified: true, createdAt: true,
          avatarUrl: true,
        },
      }),

      // Top trabajadores por rating
      this.prisma.workerProfile.findMany({
        take: 5,
        where: { status: 'ACTIVE', reviewCount: { gt: 0 } },
        orderBy: { averageRating: 'desc' },
        include: {
          user: { select: { fullName: true, avatarUrl: true } },
          workerServices: {
            take: 1,
            include: { category: { select: { name: true } } },
          },
        },
      }),

      // Solicitudes por estado
      this.prisma.request.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // Solicitudes por categoría (top 5)
      this.prisma.request.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 5,
      }),
    ]);

    // Calcular ingresos (comisión 10% sobre trabajos completados)
    const totalVolume = Number(revenueResult._sum.finalPrice ?? revenueResult._sum.budget ?? 0);
    const totalRevenue = Math.round(totalVolume * 0.1);

    // Calcular cambios porcentuales
    const usersGrowth = newUsersLastMonth > 0
      ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
      : newUsersThisMonth > 0 ? 100 : 0;
    const requestsGrowth = requestsLastMonth > 0
      ? Math.round(((requestsThisMonth - requestsLastMonth) / requestsLastMonth) * 100)
      : requestsThisMonth > 0 ? 100 : 0;

    // Obtener nombres de categorías para el groupBy
    const categoryIds = requestsByCategory.map((r: any) => r.categoryId);
    const categories = await this.prisma.serviceCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(categories.map((c: any) => [c.id, c.name]));

    return {
      // KPIs principales
      totalUsers,
      totalWorkers,
      totalRequests,
      completedRequests,
      pendingRequests,
      activeRequests,
      totalRevenue,
      totalVolume,

      // Métricas de crecimiento
      newUsersThisMonth,
      requestsThisMonth,
      usersGrowth,
      requestsGrowth,

      // Distribución de solicitudes
      requestsByStatus: requestsByStatus.map((r: any) => ({
        status: r.status,
        count: r._count.status,
      })),

      // Top categorías
      topCategories: requestsByCategory.map((r: any) => ({
        name: categoryMap[r.categoryId] ?? 'Desconocida',
        count: r._count.categoryId,
      })),

      // Listas recientes
      recentRequests,
      recentUsers,

      // Top trabajadores
      topWorkers: topWorkers.map((w: any) => ({
        id: w.id,
        fullName: w.user.fullName,
        avatarUrl: w.user.avatarUrl,
        averageRating: Number(w.averageRating),
        reviewCount: w.reviewCount,
        jobsCompleted: w.jobsCompleted,
        service: w.workerServices[0]?.category?.name ?? '—',
      })),
    };
  }

  async getUsers(page = 1, limit = 20, role?: string) {
    const skip = (page - 1) * limit;
    const where: any = { isActive: true };
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, fullName: true, email: true, phone: true,
          role: true, isActive: true, isVerified: true, isWorker: true,
          createdAt: true, avatarUrl: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users, meta: { total, page, limit } };
  }

  async suspendUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activateUser(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
