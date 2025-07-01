import { useState } from 'react';
import { api } from '@/lib/api';
import { showErrorToast } from '@/lib/toast';

export default function ExplanationButton({ question, correctAnswer, userAnswer }) {
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const getExplanation = async () => {
    if (explanation) {
      setIsOpen(true);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/ai/explain-answer', {
        question,
        correctAnswer,
        userAnswer,
      });
      setExplanation(data.explanation);
      setIsOpen(true);
    } catch (error) {
      console.error('Error getting explanation:', error);
      showErrorToast('Failed to get explanation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        onClick={getExplanation}
        disabled={isLoading}
        className={`text-sm px-3 py-1 rounded-md ${
          isLoading
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        }`}
      >
        {isLoading ? 'Loading...' : 'Why was this wrong?'}
      </button>

      {isOpen && explanation && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md">
          <div className="flex justify-between items-start">
            <p className="text-sm text-gray-700">{explanation}</p>
            <button
              onClick={() => setIsOpen(false)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 