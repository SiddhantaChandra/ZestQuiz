import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quizzes')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createQuizDto: CreateQuizDto, @Request() req) {
    return this.quizService.create(createQuizDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.quizService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  @Post(':id/questions')
  @UseGuards(JwtAuthGuard)
  addQuestion(
    @Param('id') id: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    return this.quizService.addQuestion(id, createQuestionDto);
  }

  @Patch('questions/:id')
  @UseGuards(JwtAuthGuard)
  updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.quizService.updateQuestion(id, updateQuestionDto);
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard)
  removeQuestion(@Param('id') id: string) {
    return this.quizService.deleteQuestion(id);
  }

  @Post(':id/questions/reorder')
  @UseGuards(JwtAuthGuard)
  reorderQuestions(
    @Param('id') id: string,
    @Body() body: { questionIds: string[] },
  ) {
    return this.quizService.reorderQuestions(id, body.questionIds);
  }
} 