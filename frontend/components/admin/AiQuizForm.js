'use client'

import { useState } from 'react';
import { api } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';

const questionOptions = [5, 10, 15, 20];

export default function AiQuizForm({ onQuizGenerated, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    numQuestions: 5,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate questions using AI
      const { data: aiResponse } = await api.post('/ai/generate-quiz', formData);

      // Transform AI response to quiz data
      const quizData = {
        title: `Quiz about ${formData.topic}`,
        description: aiResponse.description,
        tags: aiResponse.tags,
        status: 'DRAFT',
        isAiGenerated: true,
        questions: aiResponse.quiz.map((q, index) => ({
          text: q.question,
          orderIndex: index,
          options: q.options.map((opt, optIndex) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            orderIndex: optIndex,
          })),
        })),
      };

      showSuccessToast('Quiz generated successfully!');
      onQuizGenerated(quizData);
    } catch (error) {
      console.error('Error generating quiz:', error);
      showErrorToast('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Generate Quiz with AI</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Topic
          </label>
          <input
            type="text"
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter a topic (e.g., 'JavaScript Basics', 'World History')"
            required
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions
          </label>
          <select
            id="numQuestions"
            value={formData.numQuestions}
            onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
          >
            {questionOptions.map((num) => (
              <option key={num} value={num}>
                {num} questions
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 px-4 text-white font-medium rounded-md ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Quiz...
              </span>
            ) : (
              'Generate Quiz'
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 text-gray-700 font-medium rounded-md border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 