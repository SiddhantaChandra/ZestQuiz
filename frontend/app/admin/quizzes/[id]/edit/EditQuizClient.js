'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
import QuizForm from '@/components/admin/QuizForm';

export default function EditQuizClient() {
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params?.id) return;

      try {
        const response = await api.get(`/quizzes/${params.id}`);
        setQuiz(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        setError('Failed to load quiz. Please try again later.');
        showErrorToast(error.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params?.id]);

  const handleSubmit = async (formData) => {
    try {
      await api.patch(`/quizzes/${params.id}`, formData);
      router.push('/admin/quizzes');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      throw new Error(error.response?.data?.message || 'Failed to update quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="p-6 bg-background dark:bg-background-dark min-h-screen">
      <QuizForm quiz={quiz} onSubmit={handleSubmit} isEditing={true} />
    </div>
  );
} 