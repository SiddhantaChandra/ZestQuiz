'use client';

import Image from 'next/image';
import Link from 'next/link';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/ZestQuizLogo.webp"
              alt="ZestQuiz Logo"
              width={200}
              height={100}
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
          <p className="text-text/70">Join ZestQuiz and start your learning journey</p>
        </div>
        
        <RegisterForm />

        <div className="mt-6 text-center">
          <p className="text-text/70">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary-hover font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 