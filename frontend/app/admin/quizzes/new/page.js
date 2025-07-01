'use client';

import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import QuizForm from '@/components/admin/QuizForm';

export default function CreateQuizPage() {
  const router = useRouter();

  const handleSubmit = async (formData) => {
    try {
      await api.post('/quizzes', formData);
      router.push('/admin/quizzes');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  return (
    <div>
      <QuizForm onSubmit={handleSubmit} />
    </div>
  );
} 