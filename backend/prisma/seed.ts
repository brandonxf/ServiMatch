/* eslint-disable @typescript-eslint/no-var-requires */
// Usar require para evitar errores de TS antes de `prisma generate`
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  const categories = [
    { name: 'Plomería',          slug: 'plomeria',          description: 'Reparación e instalación de tuberías' },
    { name: 'Electricidad',      slug: 'electricidad',      description: 'Instalaciones eléctricas' },
    { name: 'Soldadura',         slug: 'soldadura',         description: 'Soldadura y metalmecánica' },
    { name: 'Pintura',           slug: 'pintura',           description: 'Pintura de interiores y exteriores' },
    { name: 'Carpintería',       slug: 'carpinteria',       description: 'Trabajos en madera y muebles' },
    { name: 'Cerrajería',        slug: 'cerrajeria',        description: 'Apertura y cambio de cerraduras' },
    { name: 'Jardinería',        slug: 'jardineria',        description: 'Mantenimiento de jardines' },
    { name: 'Limpieza',          slug: 'limpieza',          description: 'Limpieza de hogar y empresas' },
    { name: 'Aire Acondicionado',slug: 'aire-acondicionado',description: 'Instalación y mantenimiento A/C' },
    { name: 'Mudanzas',          slug: 'mudanzas',          description: 'Servicio de trasteos' },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log(`✅ ${categories.length} categorías`);

  const adminPass = await bcrypt.hash('Admin123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@servimatch.com' }, update: {},
    create: { email: 'admin@servimatch.com', passwordHash: adminPass, fullName: 'Admin ServiMatch', role: 'ADMIN', isVerified: true },
  });

  const clientPass = await bcrypt.hash('Cliente123!', 12);
  await prisma.user.upsert({
    where: { email: 'cliente@test.com' }, update: {},
    create: { email: 'cliente@test.com', passwordHash: clientPass, fullName: 'Carlos Martínez', phone: '+573001234567', role: 'CLIENT', isVerified: true },
  });

  const workerPass = await bcrypt.hash('Worker123!', 12);
  const workerUser = await prisma.user.upsert({
    where: { email: 'plomero@test.com' }, update: {},
    create: { email: 'plomero@test.com', passwordHash: workerPass, fullName: 'Juan García', phone: '+573009876543', role: 'WORKER', isWorker: true, isVerified: true },
  });

  const plomeria = await prisma.serviceCategory.findUnique({ where: { slug: 'plomeria' } });
  if (plomeria) {
    const existing = await prisma.workerProfile.findUnique({ where: { userId: workerUser.id } });
    if (!existing) {
      await prisma.workerProfile.create({
        data: {
          userId: workerUser.id, bio: 'Plomero con 8 años de experiencia.', basePrice: 50000,
          priceUnit: 'HOUR', coverageRadiusKm: 15, latitude: 4.710989, longitude: -74.072092,
          city: 'Bogotá', yearsExperience: 8, averageRating: 4.8, reviewCount: 47,
          jobsCompleted: 152, status: 'ACTIVE', isAvailable: true,
          workerServices: { create: { categoryId: plomeria.id, customPrice: 50000 } },
        },
      });
    }
  }
  console.log('🎉 Seed completado');
  console.log('  admin@servimatch.com   / Admin123!');
  console.log('  cliente@test.com       / Cliente123!');
  console.log('  plomero@test.com       / Worker123!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
