import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting application...');
  
  const app = await NestFactory.create(AppModule);
  logger.log('NestJS application created');
  
  app.enableCors({
    origin: [
      'https://zest-quiz.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });
  logger.log('CORS configured');
  
  app.setGlobalPrefix('api');
  logger.log('Global prefix set to /api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  logger.log('Global pipes configured');
  
  const port = process.env.PORT || 8080;
  await app.listen(port);
  logger.log(`Application is running on port ${port}`);
}
bootstrap();
