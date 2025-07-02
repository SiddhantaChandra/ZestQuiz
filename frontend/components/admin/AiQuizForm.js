'use client'

import { useState } from 'react';
import { api } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { CircleNotch } from '@phosphor-icons/react';

const questionOptions = [5, 10, 15, 20];

const generateUniqueId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function AiQuizForm({ onQuizGenerated, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    numQuestions: 5,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/ai/generate-quiz', formData);
      onQuizGenerated(response.data);
    } catch (error) {
      setError(error.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-card dark:bg-card-dark rounded-lg shadow-custom border border-border">
      <h2 className="text-2xl font-bold mb-6 text-text dark:text-text-dark">Generate Quiz with AI</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Quiz Topic
          </label>
          <input
            type="text"
            id="topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
            placeholder="Enter a topic (e.g., 'JavaScript Basics', 'World History')"
            required
          />
        </div>

        <div>
          <label htmlFor="numQuestions" className="block text-sm font-medium text-text dark:text-text-dark mb-2">
            Number of Questions
          </label>
          <select
            id="numQuestions"
            value={formData.numQuestions}
            onChange={(e) => setFormData({ ...formData, numQuestions: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
          >
            {questionOptions.map((num) => (
              <option key={num} value={num}>
                {num} questions
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-1 py-3 px-4 text-white font-medium rounded-lg transition-colors ${
              isLoading
                ? 'bg-primary/50 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover focus:ring-2 focus:ring-primary/30'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <CircleNotch size={20} className="animate-spin" />
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
              className="flex-1 py-3 px-4 bg-card dark:bg-card-dark text-text dark:text-text-dark font-medium rounded-lg border border-border hover:bg-background dark:hover:bg-background-dark transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
      </form>
    </div>
  );
} 