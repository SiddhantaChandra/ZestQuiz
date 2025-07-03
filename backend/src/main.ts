// Immediate log to verify Node.js is starting
console.log('Node.js process started at:', new Date().toISOString());
console.log('Current directory:', process.cwd());
console.log('Files in dist:', require('fs').readdirSync('./dist').join(', '));

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

// Add immediate console log to verify the script is running
console.log('=== BACKEND STARTING ===');
console.log('Current time:', new Date().toISOString());
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT || 3001);

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // More console logs for debugging
  console.log('Creating NestJS application...');
  logger.log('=== STARTING APPLICATION ===');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    console.log('✅ NestJS application created');
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
    console.log('✅ CORS configured');
    logger.log('✅ CORS configured');
    
    // Set global prefix
    app.setGlobalPrefix('api');
    console.log('✅ Global prefix /api set');
    logger.log('✅ Global prefix /api set');

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    console.log('✅ Global pipes configured');
    logger.log('✅ Global pipes configured');
    
    // Port configuration
    const port = process.env.PORT || 3001;
    console.log(`🚀 Attempting to start server on port ${port}`);
    logger.log(`🚀 Attempting to start server on port ${port}`);
    logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🗄️  Database URL exists: ${!!process.env.DATABASE_URL}`);
    logger.log(`🔐 JWT Secret exists: ${!!process.env.JWT_SECRET}`);
    
    // CRITICAL: Bind to 0.0.0.0 for Railway
    await app.listen(port, '0.0.0.0');
    
    console.log(`🎉 APPLICATION SUCCESSFULLY STARTED ON PORT ${port}`);
    console.log(`🌐 Server is listening on http://0.0.0.0:${port}`);
    console.log(`📍 API available at http://0.0.0.0:${port}/api`);
    console.log(`❤️  Health check at http://0.0.0.0:${port}/api/health`);
    
    logger.log(`🎉 APPLICATION SUCCESSFULLY STARTED ON PORT ${port}`);
    logger.log(`🌐 Server is listening on 0.0.0.0:${port}`);
    
  } catch (error) {
    console.error('❌ FAILED TO START APPLICATION:', error);
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

// Start the application
console.log('Calling bootstrap function...');
bootstrap();