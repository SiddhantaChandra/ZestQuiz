'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';
import ExplanationButton from '@/components/quiz/ExplanationButton';

export default function QuizResults() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!params?.id) return;
      
      try {
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
  }, [params?.id]);

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

  if (!results) return null;

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-4">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.push('/')}
            className="p-2 text-white hover:bg-primary-hover rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-white">{results.quiz.title}</h1>
        </div>

        {/* Results Summary */}
        <div className="bg-background rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-4xl font-bold text-primary mb-2">{results.score}%</p>
              <p className="text-sm text-text/70">Score</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">{results.correctAnswers}/{results.totalQuestions}</p>
              <p className="text-sm text-text/70">Correct Answers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary mb-2">{results.timeTaken}</p>
              <p className="text-sm text-text/70">Time Taken</p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="space-y-6">
          {results.questions.map((question, index) => (
            <div key={question.id} className="bg-background rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 text-text">
                Question {index + 1} of {results.totalQuestions}
              </h3>
              <p className="mb-6 text-text">{question.text}</p>
              <div className="space-y-3">
                {question.options.map(option => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg transition-colors ${
                      option.id === question.selectedOptionId
                        ? option.isCorrect
                          ? 'bg-green-100 border-green-200 text-green-800'
                          : 'bg-red-100 border-red-200 text-red-800'
                        : option.isCorrect
                        ? 'bg-green-50 border-green-100 text-green-800'
                        : 'bg-white text-text'
                    } border`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{option.text}</span>
                      {option.id === question.selectedOptionId && (
                        <span className={option.isCorrect ? 'text-green-600' : 'text-red-600'}>
                          {option.isCorrect ? '✓' : '✗'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {question.selectedOptionId && !question.options.find(opt => opt.id === question.selectedOptionId)?.isCorrect && (
                  <ExplanationButton
                    question={question.text}
                    correctAnswer={question.options.find(opt => opt.isCorrect)?.text}
                    userAnswer={question.options.find(opt => opt.id === question.selectedOptionId)?.text}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-secondary text-text rounded-lg hover:bg-secondary-hover transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    </div>
  );
} 