'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function QuizPreviewPage() {
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params?.id) return;

      try {
        const response = await api.get(`/quizzes/${params.id}`);
        const sortedQuestions = response.data.questions.sort((a, b) => a.orderIndex - b.orderIndex);
        setQuiz({ ...response.data, questions: sortedQuestions });
        setError(null);
      } catch (error) {
        console.error('Failed to fetch quiz:', error);
        setError('Failed to load quiz. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pastle-red border border-pastle-red-text text-pastle-red-text px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-secondary border border-secondary text-text px-4 py-3 rounded">
        Quiz not found.
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Preview: {quiz.title}</h1>
        <Link
          href={`/admin/quizzes/${params.id}/edit`}
          className="bg-pastle-blue hover:bg-pastle-blue-hover text-pastle-blue-text px-4 py-2 rounded-md border border-border"
        >
          Edit Quiz
        </Link>
      </div>

      {/* Quiz Info */}
      <div className="card p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2 text-text">Description</h2>
          <p className="text-text/70">{quiz.description}</p>
        </div>
        
        {quiz.tags && quiz.tags.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-text">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {quiz.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-background text-text px-3 py-1 rounded-full text-sm border border-border"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question Preview */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </h2>
          <div className="text-sm text-text/70">
            Preview Mode
          </div>
        </div>

        <div className="space-y-6">
          {/* Question Text */}
          <div className="text-lg text-text">{currentQuestion.text}</div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.sort((a, b) => a.orderIndex - b.orderIndex).map((option, index) => (
              <div
                key={option.id}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  option.isCorrect 
                    ? 'border-success bg-pastle-green'
                    : 'border-border hover:border-primary/50 bg-background'
                }`}
              >
                <div className="flex items-center">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-border mr-3 text-text">
                    {['A', 'B', 'C', 'D'][index]}
                  </div>
                  <span className="text-text">{option.text}</span>
                  {option.isCorrect && (
                    <span className="ml-auto text-pastle-green-text">✓ Correct Answer</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-md border border-border transition-colors ${
            currentQuestionIndex === 0
              ? 'bg-background text-text/50 cursor-not-allowed'
              : 'bg-pastle-blue hover:bg-pastle-blue-hover text-pastle-blue-text'
          }`}
        >
          Previous Question
        </button>
        <div className="text-sm text-text/70">
          {currentQuestionIndex + 1} / {quiz.questions.length}
        </div>
        <button
          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
          disabled={currentQuestionIndex === quiz.questions.length - 1}
          className={`px-4 py-2 rounded-md border border-border transition-colors ${
            currentQuestionIndex === quiz.questions.length - 1
              ? 'bg-background text-text/50 cursor-not-allowed'
              : 'bg-pastle-blue hover:bg-pastle-blue-hover text-pastle-blue-text'
          }`}
        >
          Next Question
        </button>
      </div>
    </div>
  );
} 