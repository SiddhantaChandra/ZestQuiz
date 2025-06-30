import { IsString, IsArray, IsEnum, IsOptional, IsBoolean, ArrayMinSize, MinLength, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizStatus } from '@prisma/client';

class OptionDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsBoolean()
  isCorrect: boolean;

  @IsNumber()
  orderIndex: number;
}

class QuestionDto {
  @IsString()
  @MinLength(1)
  text: string;

  @IsNumber()
  orderIndex: number;

  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(4)
  options: OptionDto[];
}

export class CreateQuizDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags: string[];

  @IsEnum(QuizStatus)
  @IsOptional()
  status?: QuizStatus;

  @IsBoolean()
  @IsOptional()
  isAIGenerated?: boolean;

  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  @IsOptional()
  questions?: QuestionDto[];
} 