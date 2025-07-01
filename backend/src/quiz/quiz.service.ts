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
          // Get all existing question IDs
          const existingQuestionIds = existingQuiz.questions.map(q => q.id);
          
          // Process each question
          for (const question of questions) {
            if (question.id) {
              // Update existing question
              await prisma.question.update({
                where: { id: question.id },
                data: {
                  text: question.text,
                  orderIndex: question.orderIndex,
                  options: {
                    upsert: question.options.map(option => ({
                      where: {
                        id: option.id || 'new', // Use 'new' for new options
                      },
                      create: {
                        text: option.text,
                        isCorrect: option.isCorrect,
                        orderIndex: option.orderIndex,
                      },
                      update: {
                        text: option.text,
                        isCorrect: option.isCorrect,
                        orderIndex: option.orderIndex,
                      },
                    })),
                  },
                },
              });
            } else {
              // Create new question
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

          // Delete questions that are no longer in the update
          const updatedQuestionIds = questions
            .filter(q => q.id)
            .map(q => q.id);
          
          const questionsToDelete = existingQuestionIds
            .filter(id => !updatedQuestionIds.includes(id));

          if (questionsToDelete.length > 0) {
            await prisma.question.deleteMany({
              where: {
                id: {
                  in: questionsToDelete,
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
      console.error('Quiz update error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update quiz');
    }
  }

  async remove(id: string) {
    try {
      // First check if the quiz exists
      const quiz = await this.prisma.quiz.findUnique({
        where: { id },
        include: {
          questions: {
            include: {
              options: true,
              userAnswers: true
            }
          },
          attempts: {
            include: {
              answers: true
            }
          }
        }
      });

      if (!quiz) {
        throw new NotFoundException(`Quiz with ID ${id} not found`);
      }

      // Use a transaction to handle all the cascading deletes
      return await this.prisma.$transaction(async (prisma) => {
        // Delete all user answers first
        for (const question of quiz.questions) {
          if (question.userAnswers.length > 0) {
            await prisma.userAnswer.deleteMany({
              where: { questionId: question.id }
            });
          }
        }

        // Delete all quiz attempts and their answers
        if (quiz.attempts.length > 0) {
          for (const attempt of quiz.attempts) {
            await prisma.userAnswer.deleteMany({
              where: { attemptId: attempt.id }
            });
          }
          await prisma.quizAttempt.deleteMany({
            where: { quizId: id }
          });
        }

        // Delete all options for each question
        for (const question of quiz.questions) {
          await prisma.option.deleteMany({
            where: { questionId: question.id }
          });
        }

        // Delete all questions
        await prisma.question.deleteMany({
          where: { quizId: id }
        });

        // Finally delete the quiz
        return prisma.quiz.delete({
          where: { id }
        });
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete quiz: ${error.message}`);
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
      // Start a transaction
      return this.prisma.$transaction(async (prisma) => {
        // Check if user has already attempted this quiz
        const existingAttempt = await prisma.quizAttempt.findFirst({
          where: {
            quizId,
            userId,
          },
        });

        if (existingAttempt) {
          throw new BadRequestException('You have already attempted this quiz');
        }

        // Get quiz with questions and correct answers
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

        // Validate timestamps
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

        // Validate answers
        if (!submitQuizDto.answers || submitQuizDto.answers.length !== quiz.questions.length) {
          throw new BadRequestException('Number of answers does not match number of questions');
        }

        // Calculate score
        let correctAnswers = 0;
        const totalQuestions = quiz.questions.length;

        // Create attempt with start and end times
        const attempt = await prisma.quizAttempt.create({
          data: {
            quizId,
            userId,
            score: 0, // Will update this after processing answers
            startedAt: startTime,
            submittedAt: endTime,
          },
        });

        // Process each answer
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

          // Save the answer
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

        // Update attempt with final score
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
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.error('Quiz submission error:', error);
      throw new BadRequestException('Failed to submit quiz. Please try again.');
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

  private calculateTimeTaken(startedAt: Date, submittedAt: Date): string {
    const diffInSeconds = Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000);
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
} 