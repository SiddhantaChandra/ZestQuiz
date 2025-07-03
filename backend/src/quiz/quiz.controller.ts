import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
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
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.quizService.findAll();
  }

  @Get('public')
  findPublicQuizzes() {
    return this.quizService.findPublicQuizzes();
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  findActiveQuizzes(@Request() req) {
    return this.quizService.findActiveQuizzes(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(id);
  }

  @Get(':id/attempts')
  @UseGuards(JwtAuthGuard)
  getLatestAttempt(@Param('id') id: string, @Request() req) {
    return this.quizService.getLatestAttempt(id, req.user.id);
  }

  @Get(':id/attempt-check')
  @UseGuards(JwtAuthGuard)
  checkAttempt(@Param('id') id: string, @Request() req) {
    return this.quizService.checkAttempt(id, req.user.id);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  submitQuiz(
    @Param('id') id: string,
    @Body() submitQuizDto: SubmitQuizDto,
    @Request() req,
  ) {
    return this.quizService.submitQuiz(id, submitQuizDto, req.user.id);
  }

  @Get(':id/results')
  @UseGuards(JwtAuthGuard)
  getResults(@Param('id') id: string, @Request() req) {
    return this.quizService.getResults(id, req.user.id);
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