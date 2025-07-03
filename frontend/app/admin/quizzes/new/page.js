'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import QuizForm from '@/components/admin/QuizForm';

export default function CreateQuizPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      const response = await api.post('/quizzes', formData);
      router.push('/admin/quizzes');
    } catch (error) {
      console.error('Backend error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <div className="p-6 bg-background dark:bg-background-dark min-h-screen">
      <QuizForm onSubmit={handleSubmit} />
    </div>
  );
} 