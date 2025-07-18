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
      const quiz = await prisma.quiz.create({
        data: {
          ...quizData,
          creatorId: userId,
        },
      });

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
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });
  }

  async findPublicQuizzes() {
    return this.prisma.quiz.findMany({
      where: {
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
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

      const existingQuiz = await this.findOne(id);

      return await this.prisma.$transaction(async (prisma) => {
        const quiz = await prisma.quiz.update({
          where: { id },
          data: quizData as Prisma.QuizUpdateInput,
        });

        if (questions) {
          const existingQuestionIds = existingQuiz.questions.map(q => q.id);
          
          for (const question of questions) {
            if (question.id && existingQuestionIds.includes(question.id)) {
              const existingQuestion = await prisma.question.findUnique({
                where: { id: question.id },
                include: { options: true }
              });

              if (existingQuestion) {
              await prisma.question.update({
                where: { id: question.id },
                data: {
                  text: question.text,
                  orderIndex: question.orderIndex,
                  },
                });

                const existingOptionIds = existingQuestion.options.map(o => o.id);
                
                for (const option of question.options) {
                  if (option.id && existingOptionIds.includes(option.id)) {
                    await prisma.option.update({
                      where: { id: option.id },
                      data: {
                        text: option.text,
                        isCorrect: option.isCorrect,
                        orderIndex: option.orderIndex,
                      },
                    });
                  } else {
                    await prisma.option.create({
                      data: {
                        text: option.text,
                        isCorrect: option.isCorrect,
                        orderIndex: option.orderIndex,
                        questionId: question.id,
                      },
                    });
                  }
                }

                const updatedOptionIds = question.options
                  .filter(o => o.id)
                  .map(o => o.id);
                
                await prisma.option.deleteMany({
                  where: {
                    id: {
                      in: existingOptionIds.filter(id => !updatedOptionIds.includes(id)),
                  },
                    questionId: question.id,
                },
              });
              }
            } else {
              await prisma.question.create({
                data: {
                  text: question.text,
                  orderIndex: question.orderIndex,
                  quizId: id,
                  options: {
                    create: question.options.map(option => ({
                      text: option.text,
                      isCorrect: option.isCorrect,
                      orderIndex: option.orderIndex,
                    })),
                  },
                },
              });
            }
          }

          const updatedQuestionIds = questions
            .filter(q => q.id && existingQuestionIds.includes(q.id))
            .map(q => q.id);
          
          if (existingQuestionIds.length > 0) {
            await prisma.question.deleteMany({
              where: {
                id: {
                  in: existingQuestionIds.filter(id => !updatedQuestionIds.includes(id)),
                },
                quizId: id,
              },
            });
          }
        }

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
      console.error('Quiz update error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new BadRequestException('Duplicate entry found');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const quiz = await this.prisma.quiz.findUnique({
        where: { id }
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }

      return await this.prisma.quiz.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete quiz: ${error.message}`);
    }
  }

  async addQuestion(quizId: string, createQuestionDto: CreateQuestionDto) {
    await this.findOne(quizId);

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
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true },
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }

    if (updateQuestionDto.options) {
      const correctAnswers = updateQuestionDto.options.filter(opt => opt.isCorrect);
      if (correctAnswers.length !== 1) {
        throw new BadRequestException('Question must have exactly one correct answer');
      }

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
      return await this.prisma.question.delete({
        where: { id: questionId },
      });
    } catch (error) {
      throw new NotFoundException(`Question with ID ${questionId} not found`);
    }
  }

  async reorderQuestions(quizId: string, questionIds: string[]) {
    await this.findOne(quizId);

    const updates = questionIds.map((id, index) => 
      this.prisma.question.update({
        where: { id },
        data: { orderIndex: index },
      })
    );

    await this.prisma.$transaction(updates);

    return this.findOne(quizId);
  }

  async findActiveQuizzes(userId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        attempts: {
          where: {
            userId,
          },
          select: {
            score: true,
          },
        },
      },
    });

    return quizzes.map(quiz => ({
      ...quiz,
      userAttempt: quiz.attempts[0],
      attempts: undefined,
    }));
  }

  async checkAttempt(quizId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
      },
    });

    return { hasAttempted: !!attempt };
  }

  async submitQuiz(
    quizId: string,
    submitQuizDto: { 
      answers: { questionId: string; selectedOptionId: string }[];
      startTime: string;
      endTime: string;
    },
    userId: string,
  ) {
    try {
      return this.prisma.$transaction(async (prisma) => {
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId,
            userId,
          },
        });

        if (existingAttempt) {
          throw new BadRequestException('You have already attempted this quiz');
        }

        const quiz = await prisma.quiz.findUnique({
          where: { id: quizId },
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        });

        if (!quiz) {
          throw new NotFoundException('Quiz not found');
        }

        const startTime = new Date(submitQuizDto.startTime);
        const endTime = new Date(submitQuizDto.endTime);

        if (isNaN(startTime.getTime())) {
          throw new BadRequestException('Invalid start time format');
        }

        if (isNaN(endTime.getTime())) {
          throw new BadRequestException('Invalid end time format');
        }

        if (endTime < startTime) {
          throw new BadRequestException('End time cannot be before start time');
        }

        if (!submitQuizDto.answers || submitQuizDto.answers.length !== quiz.questions.length) {
          throw new BadRequestException('Number of answers does not match number of questions');
        }

        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId,
            userId,
            score: 0,
            startedAt: startTime,
            submittedAt: endTime,
          },
        });

        for (const answer of submitQuizDto.answers) {
          const question = quiz.questions.find(q => q.id === answer.questionId);
          if (!question) {
            throw new BadRequestException(`Invalid question ID: ${answer.questionId}`);
          }

          const selectedOption = question.options.find(o => o.id === answer.selectedOptionId);
          if (!selectedOption) {
            throw new BadRequestException(`Invalid option ID for question ${answer.questionId}`);
          }

          const isCorrect = selectedOption.isCorrect;
          if (isCorrect) correctAnswers++;

          await prisma.userAnswer.create({
            data: {
              questionId: question.id,
              optionId: selectedOption.id,
              attemptId: attempt.id,
              isCorrect,
              answeredAt: endTime,
            },
          });
        }

        const score = Math.round((correctAnswers / totalQuestions) * 100);
        await prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: { 
            score,
          },
        });

        return { score, correctAnswers, totalQuestions };
      });
    } catch (error) {
      throw new Error('Failed to submit quiz');
    }
  }

  async getResults(quizId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
                userAnswers: {
                  where: {
                    attempt: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('No attempt found for this quiz');
    }

    if (!attempt.startedAt || !attempt.submittedAt) {
      throw new BadRequestException('Invalid attempt timestamps');
    }

    const questions = attempt.quiz.questions.map(question => {
      const userAnswer = question.userAnswers[0];
      return {
        id: question.id,
        text: question.text,
        isCorrect: userAnswer?.isCorrect || false,
        selectedOptionId: userAnswer?.optionId,
        options: question.options.map(option => ({
          id: option.id,
          text: option.text,
          isCorrect: option.isCorrect,
        })),
      };
    });

    return {
      quiz: {
        id: attempt.quiz.id,
        title: attempt.quiz.title,
      },
      score: attempt.score,
      correctAnswers: questions.filter(q => q.isCorrect).length,
      totalQuestions: questions.length,
      timeTaken: this.calculateTimeTaken(attempt.startedAt, attempt.submittedAt),
      questions,
    };
  }

  async getLatestAttempt(quizId: string, userId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        quizId,
        userId,
        submittedAt: { not: null },
      },
      orderBy: {
        submittedAt: 'desc',
      },
      select: {
        id: true,
        score: true,
        submittedAt: true,
      },
    });

    if (!attempt) {
      throw new NotFoundException('No completed attempt found for this quiz');
    }

    return attempt;
  }

  private calculateTimeTaken(startedAt: Date, submittedAt: Date): string {
    const diffInSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
} 