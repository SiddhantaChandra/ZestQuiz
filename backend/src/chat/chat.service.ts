import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  private async validateAttempt(userId: string, attemptId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt not found');
    }

    if (attempt.userId !== userId) {
      throw new ForbiddenException('You do not have access to this quiz attempt');
    }

    return attempt;
  }

  async createMessage(userId: string, attemptId: string, content: string, isUserMessage: boolean = true) {
    await this.validateAttempt(userId, attemptId);

    return this.prisma.chatMessage.create({
      data: {
        content,
        isUserMessage,
        userId,
        attemptId,
      },
    });
  }

  async getChatHistory(userId: string, attemptId: string) {
    await this.validateAttempt(userId, attemptId);

    return this.prisma.chatMessage.findMany({
      where: {
        userId,
        attemptId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async processUserMessage(userId: string, attemptId: string, message: string) {
    const attempt = await this.validateAttempt(userId, attemptId);

    await this.createMessage(userId, attemptId, message);

    const score = attempt.score ?? 0;

    const context = {
      quiz: attempt.quiz,
      userAnswers: attempt.answers,
      score,
      question: message.toLowerCase().includes('question') 
        ? this.extractQuestionNumber(message) 
        : null,
    };

    const aiResponse = await this.aiService.generateResponse(message, context);

    return this.createMessage(userId, attemptId, aiResponse, false);
  }

  private extractQuestionNumber(message: string): number | null {
    const match = message.match(/question\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
} 