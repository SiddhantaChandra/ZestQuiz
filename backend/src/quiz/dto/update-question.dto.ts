import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto, CreateOptionDto } from './create-question.dto';

export class UpdateOptionDto extends PartialType(CreateOptionDto) {}

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {} 