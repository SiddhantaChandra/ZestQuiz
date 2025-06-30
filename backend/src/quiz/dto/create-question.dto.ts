import { IsString, IsInt, IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionDto {
  @IsString()
  text: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString()
  text: string;

  @IsInt()
  @Min(0)
  orderIndex: number;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
} 