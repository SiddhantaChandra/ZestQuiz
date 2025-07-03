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
      // Basic validation
      if (!formData.title?.trim() || formData.title.trim().length < 3) {
        throw new Error('Quiz title must be at least 3 characters long');
      }
      if (!formData.description?.trim() || formData.description.trim().length < 10) {
        throw new Error('Quiz description must be at least 10 characters long');
      }
      if (!Array.isArray(formData.tags) || formData.tags.length === 0) {
        throw new Error('At least one tag is required');
      }

      // Prepare questions data
      const questions = formData.questions.map((question, qIndex) => {
        // Validate question
        if (!question.text?.trim()) {
          throw new Error(`Question ${qIndex + 1} text is required`);
        }

        // Validate options
        if (!Array.isArray(question.options) || question.options.length !== 4) {
          throw new Error(`Question ${qIndex + 1} must have exactly 4 options`);
        }

        const correctOptions = question.options.filter(o => o.isCorrect);
        if (correctOptions.length !== 1) {
          throw new Error(`Question ${qIndex + 1} must have exactly one correct answer`);
        }

        // Return only the fields needed for update
        return {
          id: question.id,
          text: question.text.trim(),
          orderIndex: qIndex,
          options: question.options.map((option, oIndex) => {
            const baseOption = {
              text: option.text.trim(),
              isCorrect: Boolean(option.isCorrect),
              orderIndex: oIndex
            };

            // Only include id if it exists and is not empty
            if (option.id && typeof option.id === 'string' && option.id.trim()) {
              return { ...baseOption, id: option.id };
            }
            return baseOption;
          })
        };
      });

      // Prepare update data with only the necessary fields
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags.map(t => t.trim()).filter(Boolean),
        status: formData.status || 'DRAFT',
        questions: questions.map(question => ({
          ...question,
          options: question.options.map(option => ({
            ...option,
            // Ensure text is not empty
            text: option.text || `Option ${option.orderIndex + 1}`
          }))
        }))
      };

      // Log the data being sent
      console.log('Sending update data:', JSON.stringify(updateData, null, 2));

      // Make the API call
      await api.patch(`/quizzes/${params.id}`, updateData);
      router.push('/admin/quizzes');
    } catch (error) {
      console.error('Failed to update quiz:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update quiz';
      showErrorToast(errorMessage);
      throw new Error(errorMessage);
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