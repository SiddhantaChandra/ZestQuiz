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

        <div className="mt-6 text-center">
          <p className="text-text/70 dark:text-text-dark/70">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary dark:text-primary-light hover:text-primary-hover dark:hover:text-primary-light/90 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 