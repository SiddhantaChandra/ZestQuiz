'use client';

import Image from 'next/image';
import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background dark:bg-background-dark flex items-center justify-center p-4">
      <div className="bg-card dark:bg-card-dark shadow-custom border border-border rounded-lg max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <Image
            src="/ZestQuizLogo.webp"
            alt="ZestQuiz Logo"
            width={200}
            height={100}
            priority
          />
        </div>

        <LoginForm />
      </div>
    </div>
  );
} 