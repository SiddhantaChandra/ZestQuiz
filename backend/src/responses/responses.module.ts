import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResponsesService } from './responses.service';
import { ResponsesController } from './responses.controller';
import { UserQuizAttempt } from './entities/user-quiz-attempt.entity';
import { UserAnswer } from './entities/user-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserQuizAttempt, UserAnswer])],
  providers: [ResponsesService],
  controllers: [ResponsesController],
  exports: [ResponsesService],
})
export class ResponsesModule {} 