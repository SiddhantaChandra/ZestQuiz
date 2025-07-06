console.log('Current directory:', process.cwd());
console.log('Files in dist:', require('fs').readdirSync('./dist').join(', '));

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

console.log('=== BACKEND STARTING ===');
console.log('Current time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 3001);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    console.log('NestJS application created');
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
    
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    
    const port = process.env.PORT || 3001;
    console.log(`Attempting to start server on port ${port}`);
    logger.log(`Attempting to start server on port ${port}`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`Database URL exists: ${!!process.env.DATABASE_URL}`);
    logger.log(`JWT Secret exists: ${!!process.env.JWT_SECRET}`);
    
    await app.listen(port, '0.0.0.0');
    
    console.log(`APPLICATION SUCCESSFULLY STARTED ON PORT ${port}`);
    console.log(`Server is listening on http://0.0.0.0:${port}`);
    console.log(`API available at http://0.0.0.0:${port}/api`);
    console.log(`❤️Health check at http://0.0.0.0:${port}/api/health`);
    
    logger.log(`APPLICATION SUCCESSFULLY STARTED ON PORT ${port}`);
    logger.log(`Server is listening on 0.0.0.0:${port}`);
    
  } catch (error) {
    console.error('FAILED TO START APPLICATION:', error);
    logger.error('FAILED TO START APPLICATION:', error);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

console.log('Calling bootstrap function...');
bootstrap();