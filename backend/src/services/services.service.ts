import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return (this.prisma as any).serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const cat = await (this.prisma as any).serviceCategory.findUnique({ where: { slug } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const exists = await (this.prisma as any).serviceCategory.findUnique({ where: { slug: dto.slug } });
    if (exists) throw new ConflictException('El slug ya existe');
    return (this.prisma as any).serviceCategory.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateCategoryDto>) {
    const cat = await (this.prisma as any).serviceCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    return (this.prisma as any).serviceCategory.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const cat = await (this.prisma as any).serviceCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    await (this.prisma as any).serviceCategory.update({ where: { id }, data: { isActive: false } });
    return { message: 'Categoría desactivada' };
  }

  async seed() {
    const categories = [
      { name: 'Plomería', slug: 'plomeria', description: 'Reparación e instalación de tuberías' },
      { name: 'Electricidad', slug: 'electricidad', description: 'Instalaciones eléctricas' },
      { name: 'Soldadura', slug: 'soldadura', description: 'Trabajos de soldadura y metalmecánica' },
      { name: 'Pintura', slug: 'pintura', description: 'Pintura de interiores y exteriores' },
      { name: 'Carpintería', slug: 'carpinteria', description: 'Trabajos en madera y muebles' },
      { name: 'Cerrajería', slug: 'cerrajeria', description: 'Apertura y cambio de cerraduras' },
      { name: 'Jardinería', slug: 'jardineria', description: 'Mantenimiento de jardines' },
      { name: 'Limpieza', slug: 'limpieza', description: 'Limpieza de hogar y empresas' },
      { name: 'Aire Acondicionado', slug: 'aire-acondicionado', description: 'Instalación y mantenimiento de A/C' },
      { name: 'Mudanzas', slug: 'mudanzas', description: 'Servicio de trasteos y mudanzas' },
    ];

    for (const cat of categories) {
      await (this.prisma as any).serviceCategory.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      });
    }
    return { message: `${categories.length} categorías creadas` };
  }
}
