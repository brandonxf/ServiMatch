import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './setup';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  configureApp(app);

  const port = config.get<number>('PORT', 3001);
  await app.listen(port, '0.0.0.0');
  logger.log(`🚀 ServiMatch API corriendo en http://0.0.0.0:${port}/v1`);
  if (config.get('NODE_ENV') !== 'production') {
    logger.log(`📚 Swagger docs en http://localhost:${port}/docs`);
  }
}

bootstrap();
