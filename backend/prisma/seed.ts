import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@zestquiz.com';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

const USER_EMAIL = process.env.USER_EMAIL || 'user@zestquiz.com';
const USER_USERNAME = process.env.USER_USERNAME || 'user';
const USER_PASSWORD = process.env.USER_PASSWORD || 'User@123';

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      username: ADMIN_USERNAME,
      password: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'ADMIN',
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: USER_EMAIL },
    update: {},
    create: {
      email: USER_EMAIL,
      username: USER_USERNAME,
      password: await bcrypt.hash(USER_PASSWORD, 10),
      role: 'USER',
    },
  });

  const existingQuiz = await prisma.quiz.findFirst({
    where: { title: 'JavaScript Fundamentals' },
  });

  if (!existingQuiz) {
    await prisma.quiz.create({
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
  }

  console.log({
    message: 'Seed data created/verified successfully',
    users: {
      admin: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      },
      user: {
        email: USER_EMAIL,
        password: USER_PASSWORD,
      },
    },
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