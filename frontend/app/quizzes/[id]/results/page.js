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
        // First, get the latest attempt ID for this quiz
        const attemptsResponse = await api.get(`/quizzes/${params.id}/attempts`);
        const latestAttempt = attemptsResponse.data;
        if (!latestAttempt) {
          throw new Error('No attempt found for this quiz');
        }
        setAttemptId(latestAttempt.id);
        setAttemptContext(latestAttempt.id);

        // Then get the results
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
      <div className="flex justify-center items-center h-screen bg-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!results || !attemptId) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push('/quizzes')}
        className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Quizzes
      </button>

      <h1 className="text-3xl font-bold mb-6">{results.quiz.title}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-4xl font-bold text-purple-600 mb-2">{results.score}%</p>
            <p className="text-gray-600">Score</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 mb-2">
              {results.correctAnswers}/{results.totalQuestions}
            </p>
            <p className="text-gray-600">Correct Answers</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-purple-600 mb-2">{results.timeTaken}</p>
            <p className="text-gray-600">Time Taken</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {results.questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              Question {index + 1}: {question.text}
            </h3>
            <div className="space-y-2">
              {question.options.map(option => (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg ${
                    option.isCorrect
                      ? 'bg-green-100 text-green-800'
                      : option.id === question.selectedOptionId && !option.isCorrect
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {option.text}
                  {option.isCorrect && (
                    <span className="ml-2 text-green-600">(Correct Answer)</span>
                  )}
                  {option.id === question.selectedOptionId && !option.isCorrect && (
                    <span className="ml-2 text-red-600">(Your Answer)</span>
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