import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuizService {
  constructor(private prisma: PrismaService) {}

  async create(createQuizDto: CreateQuizDto, userId: string) {
    const { questions, ...quizData } = createQuizDto;

    return this.prisma.$transaction(async (prisma) => {
      // Create the quiz first
      const quiz = await prisma.quiz.create({
        data: {
          ...quizData,
          creatorId: userId,
        },
      });

      // If there are questions, create them with their options
      if (questions && questions.length > 0) {
        for (const question of questions) {
          const { options, ...questionData } = question;
          await prisma.question.create({
            data: {
              ...questionData,
              quizId: quiz.id,
              options: {
                create: options,
              },
            },
          });
        }
      }

      // Return the complete quiz with questions and options
      return prisma.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            include: {
              options: true,
            },
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });
  }

  async findAll() {
    return this.prisma.quiz.findMany({
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    try {
      const { questions, ...quizData } = updateQuizDto;

      // First, get the existing quiz to check if it exists
      const existingQuiz = await this.findOne(id);

      // Start a transaction to update everything
      return await this.prisma.$transaction(async (prisma) => {
        // Update basic quiz data
        const quiz = await prisma.quiz.update({
          where: { id },
          data: quizData as Prisma.QuizUpdateInput,
        });

        // If questions are provided, handle them
        if (questions) {
          // Delete existing questions (this will cascade delete options due to our schema)
          await prisma.question.deleteMany({
            where: { quizId: id },
          });

          // Create new questions with their options
          for (const question of questions) {
            const { options, ...questionData } = question;
            await prisma.question.create({
              data: {
                ...questionData,
                quizId: id,
                options: {
                  create: options,
                },
              },
            });
          }
        }

        // Return the updated quiz with all relations
        return prisma.quiz.findUnique({
          where: { id },
          include: {
            questions: {
              include: {
                options: true,
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update quiz');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.quiz.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
  }

  async addQuestion(quizId: string, createQuestionDto: CreateQuestionDto) {
    // Verify quiz exists
    await this.findOne(quizId);

    // Verify only one correct answer
    const correctAnswers = createQuestionDto.options.filter(opt => opt.isCorrect);
    if (correctAnswers.length !== 1) {
      throw new BadRequestException('Question must have exactly one correct answer');
    }

    return this.prisma.question.create({
      data: {
        text: createQuestionDto.text,
        orderIndex: createQuestionDto.orderIndex,
        quizId,
        options: {
          create: createQuestionDto.options,
        },
      },
      include: {
        options: true,
      },
    });
  }

  async updateQuestion(questionId: string, updateQuestionDto: UpdateQuestionDto) {
    // First check if question exists
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    // If options are being updated, verify one correct answer
    if (updateQuestionDto.options) {
      const correctAnswers = updateQuestionDto.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new BadRequestException('Question must have exactly one correct answer');
      }

      // Delete existing options and create new ones
      await this.prisma.option.deleteMany({
        where: { questionId },
      });

      return this.prisma.question.update({
        where: { id: questionId },
        data: {
          text: updateQuestionDto.text,
          orderIndex: updateQuestionDto.orderIndex,
          options: {
            create: updateQuestionDto.options,
          },
        },
        include: {
          options: true,
        },
      });
    }

    // If only updating question text or order
    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        text: updateQuestionDto.text,
        orderIndex: updateQuestionDto.orderIndex,
      },
      include: {
        options: true,
      },
    });
  }

  async deleteQuestion(questionId: string) {
    try {
      // This will cascade delete related options due to our schema setup
      return await this.prisma.question.delete({
        where: { id: questionId },
      });
    } catch (error) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
  }

  async reorderQuestions(quizId: string, questionIds: string[]) {
    // Verify quiz exists
    await this.findOne(quizId);

    // Update each question's order
    const updates = questionIds.map((id, index) => 
      this.prisma.question.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findOne(quizId);
  }
} 