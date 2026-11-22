import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';
import { configureApp } from './setup';

let cached: express.Express | undefined;

/** Crea la app Nest una sola vez por instancia fría y la reutiliza entre invocaciones. */
export async function getServer(): Promise<express.Express> {
  if (!cached) {
    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });
    configureApp(app);
    await app.init();
    cached = server;
  }
  return cached;
}
