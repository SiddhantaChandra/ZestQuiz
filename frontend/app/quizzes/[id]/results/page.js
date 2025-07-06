'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';
import ChatButton from '@/components/chat/ChatButton';
import ChatWindow from '@/components/chat/ChatWindow';
import { useChat } from '@/contexts/ChatContext';

export default function QuizResults() {
  const params = useParams();
  const router = useRouter();
  const { setAttemptContext } = useChat();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!params?.id) return;
      
      try {
        const attemptsResponse = await api.get(`/quizzes/${params.id}/attempts`);
        const latestAttempt = attemptsResponse.data;
        if (!latestAttempt) {
          throw new Error('No attempt found for this quiz');
        }
        setAttemptId(latestAttempt.id);
        setAttemptContext(latestAttempt.id);
        
        const response = await api.get(`/quizzes/${params.id}/results`);
        setResults(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch results:', error);
        setError('Failed to load quiz results. Please try again later.');
        showErrorToast(error.response?.data?.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [params?.id, setAttemptContext]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-background dark:bg-background-dark">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!results || !attemptId) return null;

  return (
    <div className="container mx-auto px-4 py-8 bg-background dark:bg-background-dark min-h-screen">
      <button
        onClick={() => router.push('/')}
        className="flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      <h1 className="text-3xl font-bold mb-6 text-text dark:text-text-dark">{results.quiz.title}</h1>
      
      <div className="bg-card dark:bg-card-dark rounded-lg shadow-md dark:shadow-lg p-6 mb-8 border border-border dark:border-border-dark">
        <h2 className="text-2xl font-semibold mb-4 text-text dark:text-text-dark">Your Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{results.score}%</p>
            <p className="text-text/60 dark:text-text-dark/60">Score</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {results.correctAnswers}/{results.totalQuestions}
            </p>
            <p className="text-text/60 dark:text-text-dark/60">Correct Answers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{results.timeTaken}</p>
            <p className="text-text/60 dark:text-text-dark/60">Time Taken</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {results.questions.map((question, index) => (
          <div key={question.id} className="bg-card dark:bg-card-dark rounded-lg shadow-md dark:shadow-lg p-6 border border-border dark:border-border-dark">
            <h3 className="text-xl font-semibold mb-4 text-text dark:text-text-dark">
              Question {index + 1}: {question.text}
            </h3>
            <div className="space-y-2">
              {question.options.map(option => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg ${
                    option.isCorrect
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                      : option.id === question.selectedOptionId && !option.isCorrect
                      ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                      : 'bg-gray-100 dark:bg-neutral-700 text-text dark:text-text-dark'
                  }`}
                >
                  {option.text}
                  {option.isCorrect && (
                    <span className="ml-2 text-green-600 dark:text-green-400">(Correct Answer)</span>
                  )}
                  {option.id === question.selectedOptionId && !option.isCorrect && (
                    <span className="ml-2 text-red-600 dark:text-red-400">(Your Answer)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ChatButton />
      <ChatWindow attemptId={attemptId} />
    </div>
  );
} 