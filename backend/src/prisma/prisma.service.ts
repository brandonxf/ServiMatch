import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';

// Importación dinámica — el cliente se genera en runtime con `prisma generate`
// eslint-disable-next-line @typescript-eslint/no-var-requires
let PrismaClientClass: any;
try {
  PrismaClientClass = require('@prisma/client').PrismaClient;
} catch {
  // Durante compilación sin generate, usar proxy vacío
  PrismaClientClass = class MockPrismaClient {};
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    this.client = new PrismaClientClass({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  // Proxy dinámico: this.prisma.user, this.prisma.request, etc.
  get user() { return this.client.user; }
  get workerProfile() { return this.client.workerProfile; }
  get serviceCategory() { return this.client.serviceCategory; }
  get workerService() { return this.client.workerService; }
  get workerPhoto() { return this.client.workerPhoto; }
  get request() { return this.client.request; }
  get review() { return this.client.review; }
  get message() { return this.client.message; }
  get notification() { return this.client.notification; }
  get refreshToken() { return this.client.refreshToken; }
  get $queryRaw() { return this.client.$queryRaw.bind(this.client); }
  get $executeRaw() { return this.client.$executeRaw.bind(this.client); }
  get $transaction() { return this.client.$transaction.bind(this.client); }
}
