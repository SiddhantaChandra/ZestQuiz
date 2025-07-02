'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import QuizList from '@/components/admin/QuizList';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quizzes');
      setQuizzes(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
      setError('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  return (
    <div className="p-6 bg-background dark:bg-background-dark min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text dark:text-text-dark">Manage Quizzes</h1>
        <a
          href="/admin/quizzes/new"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors"
        >
          Create New Quiz
        </a>
      </div>

      <QuizList quizzes={quizzes} onUpdate={fetchQuizzes} />
    </div>
  );
} 