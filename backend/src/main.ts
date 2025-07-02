import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('=== STARTING APPLICATION ===');
  
  try {
    const app = await NestFactory.create(AppModule);
    logger.log('✅ NestJS application created successfully');
    
    // Enable CORS
    app.enableCors({
      origin: [
        'https://zest-quiz.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
    });
    logger.log('✅ CORS configured');
    
    // Set global prefix
    app.setGlobalPrefix('api');
    logger.log('✅ Global prefix /api set');

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    logger.log('✅ Global pipes configured');
    
    // Port configuration
    const port = process.env.PORT || 3001;
    logger.log(`🚀 Attempting to start server on port ${port}`);
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🗄️  Database URL exists: ${!!process.env.DATABASE_URL}`);
    logger.log(`🔐 JWT Secret exists: ${!!process.env.JWT_SECRET}`);
    
    // CRITICAL: Bind to 0.0.0.0 for Railway
    await app.listen(port, '0.0.0.0');
    
    logger.log(`🎉 APPLICATION SUCCESSFULLY STARTED ON PORT ${port}`);
    logger.log(`🌐 Server is listening on 0.0.0.0:${port}`);
    
  } catch (error) {
    logger.error('❌ FAILED TO START APPLICATION:', error);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();