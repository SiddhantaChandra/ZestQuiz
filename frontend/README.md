# ZestQuiz Frontend

## Environment Setup

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ZestQuiz
NEXT_PUBLIC_APP_DESCRIPTION="An AI-powered quiz platform for interactive learning and assessment"
NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js app directory containing pages and layouts
- `components/` - Reusable React components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and API client
- `types/` - Type definitions
- `styles/` - Global styles and Tailwind configuration

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
