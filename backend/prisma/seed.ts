import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.userAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@zestquiz.com',
      username: 'admin',
      password: await bcrypt.hash('adminPassword', 10),
      role: 'ADMIN',
    },
  });

  // Create regular user
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@zestquiz.com',
      username: 'user',
      password: await bcrypt.hash('userPassword', 10),
      role: 'USER',
    },
  });

  // Create a sample JavaScript quiz
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

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 