import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { GenerateQuizDto, ExplainAnswerDto, AIQuizResponse, QuizQuestion, GenerateQuestionRequest, GenerateQuestionResponse } from './types';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-quiz')
  @HttpCode(HttpStatus.OK)
  async generateQuiz(
    @Body('topic') topic: string,
    @Body('numQuestions') numQuestions: number,
  ) {
    return this.aiService.generateQuiz(topic, numQuestions);
  }

  @Post('generate-question')
  @HttpCode(HttpStatus.OK)
  async generateQuestion(@Body() request: GenerateQuestionRequest): Promise<GenerateQuestionResponse> {
    const question = await this.aiService.generateSingleQuestion(request.topic, request.existingQuestions);
    return { question };
  }

  @Post('explain-answer')
  @HttpCode(HttpStatus.OK)
  async explainWrongAnswer(
    @Body('question') question: string,
    @Body('correctAnswer') correctAnswer: string,
    @Body('userAnswer') userAnswer: string,
  ) {
    return this.aiService.explainWrongAnswer(question, correctAnswer, userAnswer);
  }
} 