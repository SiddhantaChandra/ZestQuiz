'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import QuizForm from '@/components/admin/QuizForm';
import { use } from 'react';

export default function EditQuizPage({ params }) {
  const router = useRouter();
  const quizId = use(Promise.resolve(params.id));
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/quizzes/${quizId}`);
        setQuiz(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (formData) => {
    try {
      await api.patch(`/quizzes/${quizId}`, formData);
      router.push('/admin/quizzes');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      setError('Failed to update quiz. Please try again later.');
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        Quiz not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
      </div>

      <QuizForm
        initialData={quiz}
        onSubmit={handleSubmit}
        error={error}
      />
    </div>
  );
} 