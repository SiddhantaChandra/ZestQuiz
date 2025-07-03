<p align="center"><a href="https://zest-quiz.vercel.app/" target="_blank"><img src="https://raw.githubusercontent.com/SiddhantaChandra/ZestQuiz/refs/heads/main/frontend/public/ZestQuizLogo.webp" width="400" alt="ZestQuiz Logo"></a></p>

# ZestQuiz

**ZestQuiz** is a modern, full-stack quiz platform that enables users to take, create, and manage quizzes with a beautiful, responsive UI and advanced features like AI-powered quiz generation and real-time chat-bot support.

Live Demo: [https://zest-quiz.vercel.app/](https://zest-quiz.vercel.app/)

---

## Features

- **User Authentication**: Role based authentication using JWT.
- **Quiz Taking**: Browse, filter, and take quizzes across various categories.
- **Quiz Creation & Management**: Admins can create, edit, preview, and manage quizzes and questions.
- **AI Quiz Generation**: Generate quizzes using AI for rapid content creation.
- **Real-Time Chatbot**: In-app chat support for quiz attempts.
- **Dark Mode**: Seamless light/dark theme switching across the app.
- **Tag-based Filtering**: Easily find quizzes by category or tag.
- **Results & Analytics**: View quiz results and scores.
- **Admin Dashboard**: Manage quizzes, view analytics, and more.

---

## Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Node.js, NestJS, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: JWT, custom guards/strategies
- **AI Integration**: DeepseekAI (for quiz generation)
- **Deployment**: Vercel (Frontend), Railway (Backend/DB)
- **Other**: Docker, ESLint, Prettier

---

## Project Structure

```
ZestQuiz/
  ├── backend/         # NestJS API, Prisma, Auth, Quiz logic
  └── frontend/        # Next.js app, components, pages, contexts
```

### Key Folders

- `frontend/app/` – Main Next.js pages and routing
- `frontend/components/` – Reusable UI components (admin, chat, common, etc.)
- `frontend/contexts/` – React context providers (Auth, Chat, Theme)
- `frontend/lib/` – API utilities, toast notifications
- `backend/src/` – NestJS modules (auth, quiz, chat, ai, etc.)
- `backend/prisma/` – Prisma schema and migrations

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Yarn or npm
- Docker (for local DB, optional)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ZestQuiz.git
cd ZestQuiz
```

### 2. Setup Environment Variables

- Copy `.env.example` to `.env` in both `frontend/` and `backend/` folders and fill in the required values (DB connection, JWT secret, Deepseek API key, etc.).

---

## Environment Variables

### Backend (`backend/.env.example`)

```env
DATABASE_URL="<YOUR_POSTGRESS_DB_URL>"
DEEPSEEK_API_KEY="<DEEPSEEK_API_KEY>"
JWT_SECRET="<YOUR_REALLY_REALLY_LONG_JSON_WEB_TOKEN_MUST_BE_ENTERED_HERE>"
```

- `DATABASE_URL`: Your PostgreSQL database connection string.
- `DEEPSEEK_API_KEY`: API key for DeepSeek (AI quiz generation or related features).
- `JWT_SECRET`: A long, secure string used to sign and verify JWT tokens for authentication.

### Frontend (`frontend/.env.example`)

```env
NEXT_PUBLIC_API_URL="<YOUR_API_SERVER_URL>"
NEXT_PUBLIC_DEEPSEEK_API_KEY="YOUR_DEEPSEEK_API_KEY"
```

- `NEXT_PUBLIC_API_URL`: The URL of your backend API server (e.g., `http://localhost:5000` or your deployed backend endpoint).
- `NEXT_PUBLIC_DEEPSEEK_API_KEY`: The DeepSeek API key, exposed to the frontend for any client-side AI features.

### 3. Install Dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 4. Database Setup

```bash
cd ../backend
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run Locally

#### Backend

```bash
cd backend
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Credits

- Built with [Next.js](https://nextjs.org/), [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), [Tailwind CSS](https://tailwindcss.com/)
- AI features powered by [DeepseekAI](https://www.deepseek.com/en)
- Live at [https://zest-quiz.vercel.app/](https://zest-quiz.vercel.app/)

---

**Enjoy ZestQuiz!** 
