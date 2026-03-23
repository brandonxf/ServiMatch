import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Categorías
  const categories = [
    { name: 'Plomería', slug: 'plomeria', description: 'Reparación e instalación de tuberías y sistemas de agua' },
    { name: 'Electricidad', slug: 'electricidad', description: 'Instalaciones eléctricas residenciales y comerciales' },
    { name: 'Soldadura', slug: 'soldadura', description: 'Trabajos de soldadura y metalmecánica' },
    { name: 'Pintura', slug: 'pintura', description: 'Pintura de interiores y exteriores' },
    { name: 'Carpintería', slug: 'carpinteria', description: 'Trabajos en madera, muebles y acabados' },
    { name: 'Cerrajería', slug: 'cerrajeria', description: 'Apertura, cambio e instalación de cerraduras' },
    { name: 'Jardinería', slug: 'jardineria', description: 'Mantenimiento y diseño de jardines' },
    { name: 'Limpieza', slug: 'limpieza', description: 'Limpieza de hogar, oficinas y empresas' },
    { name: 'Aire Acondicionado', slug: 'aire-acondicionado', description: 'Instalación y mantenimiento de A/C' },
    { name: 'Mudanzas', slug: 'mudanzas', description: 'Servicio de trasteos y mudanzas' },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categorías creadas`);

  // Usuario admin
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@servimatch.com' },
    update: {},
    create: {
      email: 'admin@servimatch.com',
      passwordHash: adminPassword,
      fullName: 'Administrador ServiMatch',
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log(`✅ Admin creado: ${admin.email}`);

  // Usuario cliente de prueba
  const clientPassword = await bcrypt.hash('Cliente123!', 12);
  const client = await prisma.user.upsert({
    where: { email: 'cliente@test.com' },
    update: {},
    create: {
      email: 'cliente@test.com',
      passwordHash: clientPassword,
      fullName: 'Carlos Martínez',
      phone: '+573001234567',
      role: 'CLIENT',
      isVerified: true,
    },
  });
  console.log(`✅ Cliente de prueba: ${client.email}`);

  // Usuario trabajador de prueba
  const workerPassword = await bcrypt.hash('Worker123!', 12);
  const workerUser = await prisma.user.upsert({
    where: { email: 'plomero@test.com' },
    update: {},
    create: {
      email: 'plomero@test.com',
      passwordHash: workerPassword,
      fullName: 'Juan Plomero',
      phone: '+573009876543',
      role: 'WORKER',
      isWorker: true,
      isVerified: true,
    },
  });

  const plomeria = await prisma.serviceCategory.findUnique({ where: { slug: 'plomeria' } });
  if (plomeria) {
    await prisma.workerProfile.upsert({
      where: { userId: workerUser.id },
      update: {},
      create: {
        userId: workerUser.id,
        bio: 'Plomero con 8 años de experiencia. Especialista en reparaciones de emergencia y instalaciones nuevas.',
        basePrice: 50000,
        priceUnit: 'HOUR',
        coverageRadiusKm: 15,
        latitude: 4.710989,
        longitude: -74.072092,
        city: 'Bogotá',
        yearsExperience: 8,
        averageRating: 4.8,
        reviewCount: 47,
        jobsCompleted: 152,
        status: 'ACTIVE',
        isAvailable: true,
        workerServices: {
          create: {
            categoryId: plomeria.id,
            customPrice: 50000,
            description: 'Plomería general, reparación de tuberías, instalaciones',
          },
        },
      },
    });
    console.log(`✅ Trabajador de prueba: ${workerUser.email}`);
  }

  console.log('\n🎉 Seed completado');
  console.log('Credenciales:');
  console.log('  Admin:    admin@servimatch.com / Admin123!');
  console.log('  Cliente:  cliente@test.com / Cliente123!');
  console.log('  Trabajador: plomero@test.com / Worker123!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
