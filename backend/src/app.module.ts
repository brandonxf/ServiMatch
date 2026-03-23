import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { ServicesModule } from './services/services.module';
import { GeoModule } from './geo/geo.module';
import { RequestsModule } from './requests/requests.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ChatModule } from './chat/chat.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    // Config global — lee .env automáticamente
    ConfigModule.forRoot({ isGlobal: true }),

    // Rate limiting global: 100 req / 60s por IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Base de datos (global, disponible en todos los módulos)
    PrismaModule,

    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    WorkersModule,
    ServicesModule,
    GeoModule,
    RequestsModule,
    ReviewsModule,
    ChatModule,
    NotificationsModule,
  ],
})
export class AppModule {}
