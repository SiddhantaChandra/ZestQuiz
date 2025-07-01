import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, AiService],
  exports: [ChatService],
})
export class ChatModule {} 