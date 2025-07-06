'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';

export default function TakeQuizClient() {
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!params?.id) return;

      try {
        const attemptCheck = await api.get(`/quizzes/${params.id}/attempt-check`);
        if (attemptCheck.data.hasAttempted) {
          router.push(`/quizzes/${params.id}/results`);
          return;
        }

        const response = await api.get(`/quizzes/${params.id}`);
        setQuiz(response.data);
        setStartTime(new Date().toISOString());
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
  }, [params?.id, router]);

  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsed = Math.floor((now - start) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (questionId, optionId) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    const unansweredQuestions = quiz.questions.filter(
      q => !selectedAnswers[q.id]
    );

    if (unansweredQuestions.length > 0) {
      showErrorToast(`Please answer all questions before submitting. ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    try {
      setSubmitting(true);
      const answers = quiz.questions.map(question => ({
        questionId: question.id,
        selectedOptionId: selectedAnswers[question.id]
      }));

      await api.post(`/quizzes/${params.id}/submit`, {
        answers,
        startTime,
        endTime: new Date().toISOString()
      });
      router.push(`/quizzes/${params.id}/results`);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      showErrorToast(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary font-fredoka">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-primary font-fredoka">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="h-screen bg-primary font-fredoka flex flex-col overflow-hidden">
      {/* Header with title and counter */}
      <div className="w-full px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center text-white">
          <h1 className="text-lg font-semibold">{quiz.title}</h1>
          <div className="text-sm font-normal">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </div>
        </div>
      </div>

      {/* Centered Quiz Content */}
      <div className="flex-1 flex flex-col justify-center items-center px-6">
        <div className="w-full max-w-3xl">
          {/* Timer Tablet */}
          <div className="max-w-md mx-auto mb-8">
            <div className="bg-secondary text-neutral-900 py-3 px-6 rounded-lg text-center font-bold text-xl">
              Timer: {formatTime(elapsedTime)}
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl text-white mb-12 font-bold text-center">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4 mb-12 ">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                className={`w-full p-4 text-left rounded-lg transition-colors ${
                  selectedAnswers[currentQuestion.id] === option.id
                    ? 'bg-secondary text-black'
                    : 'bg-white text-black hover:bg-gray-50'
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

          {/* Navigation and Position Indicators */}
          <div>
            <div className="flex justify-center mb-6">
              {quiz.questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full mx-1 ${
                    index === currentQuestionIndex
                      ? 'bg-secondary'
                      : selectedAnswers[quiz.questions[index].id]
                      ? 'bg-green-200'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-lg text-black ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-200 cursor-not-allowed text-neutral-500'
                    : 'bg-white hover:bg-gray-50 text-black'
                }`}
              >
                Previous
              </button>

              {currentQuestionIndex === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-secondary rounded-lg hover:bg-[#e0c22d] disabled:bg-gray-300 disabled:cursor-not-allowed text-black"
                >
                  {submitting ? 'Submitting... ⚓' : 'Submit Quiz 🥳'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-secondary rounded-lg hover:bg-[#e0c22d] text-black"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 