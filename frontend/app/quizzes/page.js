'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quizzes/active');
        setQuizzes(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch quizzes:', error);
        setError('Failed to load quizzes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quizId) => {
    try {
      // Check if user has already attempted this quiz
      const response = await api.get(`/quizzes/${quizId}/attempt-check`);
      if (response.data.hasAttempted) {
        // Redirect to results page if already attempted
        router.push(`/quizzes/${quizId}/results`);
        return;
      }
      // If not attempted, start new attempt
      router.push(`/quizzes/${quizId}/take`);
    } catch (error) {
      console.error('Failed to check quiz attempt:', error);
      setError('Failed to start quiz. Please try again later.');
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Quizzes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
              <p className="text-gray-600 mb-4 line-clamp-2">{quiz.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {quiz.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Quiz Status */}
              {quiz.userAttempt ? (
                <div className="flex items-center justify-between">
                  <span className="text-green-600">
                    Score: {quiz.userAttempt.score}%
                  </span>
                  <button
                    onClick={() => router.push(`/quizzes/${quiz.id}/results`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    View Results
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleStartQuiz(quiz.id)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Start Quiz
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 