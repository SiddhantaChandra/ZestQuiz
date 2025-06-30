import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { Question } from './entities/question.entity';
import { Option } from './entities/option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, Option])],
  providers: [QuestionsService],
  controllers: [QuestionsController],
  exports: [QuestionsService],
})
export class QuestionsModule {} 