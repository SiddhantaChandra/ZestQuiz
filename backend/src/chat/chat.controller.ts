import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post(':attemptId/messages')
  async sendMessage(
    @Request() req,
    @Param('attemptId') attemptId: string,
    @Body() body: { message: string },
  ) {
    return this.chatService.processUserMessage(
      req.user.id,
      attemptId,
      body.message,
    );
  }

  @Get(':attemptId/history')
  async getChatHistory(
    @Request() req,
    @Param('attemptId') attemptId: string,
  ) {
    return this.chatService.getChatHistory(req.user.id, attemptId);
  }
} 