'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { fetchQuizzes, fetchActiveQuizzes } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = user ? await fetchActiveQuizzes() : await fetchQuizzes();
        setQuizzes(response.data);
      } catch (err) {
        setError('Failed to load quizzes. Please try again later.');
        console.error('Error loading quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadQuizzes();
  }, [user]);

  const filteredQuizzes = selectedCategory === 'All'
    ? quizzes
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  const handleStartQuiz = (quizId) => {
    router.push(`/quizzes/${quizId}/take`);
  };

  const handleViewResults = (quizId) => {
    router.push(`/quizzes/${quizId}/results`);
  };

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Welcome Card */}
      <div className="card p-8 mb-8 bg-primary">
        <h1 className="text-4xl text-white mb-4">
          {user ? `Welcome back, ${user.email.split('@')[0]}!` : 'Welcome to ZestQuiz!'}
        </h1>
        <p className="text-white/90 mb-6 text-lg">
          {user
            ? "Let's continue with today's quiz!"
            : 'Join us to start your learning journey with interactive quizzes!'}
        </p>
        {!user && (
          <button 
            className="btn-secondary"
            onClick={() => router.push('/auth/login')}
          >
            Get Started
          </button>
        )}
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        {['All', 'Mathematics', 'Science', 'History', 'Geography', 'Technology'].map((category) => (
          <button
            key={category}
            className={`btn whitespace-nowrap ${
              category === selectedCategory ? 'btn-primary' : 'btn-white'
            }`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text/70">Loading quizzes...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {/* Quiz Cards Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-8 text-text/70">
              No quizzes found for this category.
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="card p-6 hover:scale-[1.02] transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-3">
                    <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
                    <p className="text-sm text-text/70 line-clamp-2">
                      {quiz.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="bg-secondary px-2 py-0.5 rounded-md text-sm">
                      {quiz.questions?.length || 0} Questions
                    </span>
                  </div>
                </div>
                <div className="flex flex-col space-y-3">
                  <div className="flex gap-2">
                    {(quiz.tags || []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-background px-3 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    {user && quiz.userAttempt ? (
                      <div className="flex items-center justify-between space-x-4 w-full">
                        <span className="text-sm text-text/70">
                          Score: <span className="font-semibold">{quiz.userAttempt.score}%</span>
                        </span>
                        <button 
                          className="btn-secondary ml-auto"
                          onClick={() => handleViewResults(quiz.id)}
                        >
                          View Results
                        </button>
                      </div>
                    ) : (
                      <button 
                        className="btn-primary w-full"
                        onClick={() => handleStartQuiz(quiz.id)}
                        disabled={!user}
                      >
                        {user ? 'Start Quiz' : 'Login to Start'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </main>
  );
}
