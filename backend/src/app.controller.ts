import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.log('Root endpoint called');
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck(): { status: string; timestamp: string; environment: string; port: string | number } {
    this.logger.log('Health check endpoint called');
    const response = { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      port: process.env.PORT || 3001
    };
    this.logger.log(`Health check response: ${JSON.stringify(response)}`);
    return response;
  }
}