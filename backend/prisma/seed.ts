import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data if any tables exist
  try {
    await prisma.chatMessage.deleteMany();
    await prisma.userAnswer.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.option.deleteMany();
    await prisma.question.deleteMany();
    await prisma.quiz.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Some tables do not exist yet, proceeding with seeding...');
  }

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@zestquiz.com',
      username: 'admin',
      password: await bcrypt.hash('Admin@123', 10),
      role: 'ADMIN',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@zestquiz.com',
      username: 'user',
      password: await bcrypt.hash('User@123', 10),
      role: 'USER',
    },
  });

  const jsQuiz = await prisma.quiz.create({
    data: {
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics',
      tags: ['javascript', 'programming', 'web development'],
      status: 'ACTIVE',
      isAIGenerated: false,
      creatorId: adminUser.id,
      questions: {
        create: [
          {
            text: 'What is the result of typeof null?',
            orderIndex: 0,
            options: {
              create: [
                { text: 'object', isCorrect: true, orderIndex: 0 },
                { text: 'null', isCorrect: false, orderIndex: 1 },
                { text: 'undefined', isCorrect: false, orderIndex: 2 },
                { text: 'number', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
          {
            text: 'Which method removes the last element from an array?',
            orderIndex: 1,
            options: {
              create: [
                { text: 'pop()', isCorrect: true, orderIndex: 0 },
                { text: 'push()', isCorrect: false, orderIndex: 1 },
                { text: 'shift()', isCorrect: false, orderIndex: 2 },
                { text: 'unshift()', isCorrect: false, orderIndex: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log({
    message: 'Seed data created successfully',
    users: {
      admin: {
        email: 'admin@zestquiz.com',
        password: 'Admin@123'
      },
      user: {
        email: 'user@zestquiz.com',
        password: 'User@123'
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 