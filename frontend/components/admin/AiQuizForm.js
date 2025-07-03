'use client'

import { useState } from 'react';
import { api } from '@/lib/api';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { CircleNotch, Lightning, Sparkle, Brain, Rocket } from '@phosphor-icons/react';
import ToggleAiButton from './ToggleAiButton';

const questionOptions = [5, 10, 15, 20];

const generateUniqueId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Fun loading messages that rotate
const loadingMessages = [
  { text: "🧠 AI is thinking hard...", icon: Brain },
  { text: "✨ Crafting amazing questions...", icon: Sparkle },
  { text: "🚀 Launching creativity...", icon: Rocket },
  { text: "⚡ Generating quiz magic...", icon: Lightning },
  { text: "🎯 Targeting perfect questions...", icon: Brain },
  { text: "🔥 Cooking up something special...", icon: Sparkle },
];

export default function AiQuizForm({ onQuizGenerated, onCancel }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [formData, setFormData] = useState({
    topic: '',
    numQuestions: 5,
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Rotate loading messages every 2 seconds
    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    try {
      const response = await api.post('/ai/generate-quiz', formData);
      onQuizGenerated(response.data);
    } catch (error) {
      setError(error.message || 'Failed to generate quiz');
    } finally {
      setIsLoading(false);
      clearInterval(messageInterval);
      setLoadingMessageIndex(0);
    }
  };

  const currentLoadingMessage = loadingMessages[loadingMessageIndex];
  const LoadingIcon = currentLoadingMessage.icon;

  return (
    <div>
      {/* Header with Create Quiz title and Toggle AI Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text dark:text-text-dark">
          Create Quiz
        </h1>
        {!isLoading && <ToggleAiButton isAiMode={true} onToggle={onCancel} />}
      </div>

      {/* AI Quiz Generation Form */}
      <div className="p-6 bg-card dark:bg-card-dark rounded-lg shadow-custom border border-border">
        <h2 className="text-2xl font-bold mb-6 text-text dark:text-text-dark flex items-center gap-2">
          <Lightning className="text-purple-500" size={28} />
          Generate Quiz with AI
        </h2>
        
        {isLoading ? (
          // Fun Loading State
          <div className="flex flex-col items-center justify-center space-y-8 py-16">
            {/* Icon with purple background */}
            <div className="p-6 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <LoadingIcon 
                size={48} 
                className="text-purple-600 dark:text-purple-400 animate-bounce" 
              />
            </div>
            
            {/* Loading message */}
            <div className="text-xl font-semibold text-text dark:text-text-dark animate-pulse">
              {currentLoadingMessage.text}
            </div>
            
            {/* Simple progress dots */}
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-purple-500 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                ></div>
              ))}
            </div>

            {/* Fun fact */}
            <div className="max-w-md text-center px-4">
              <p className="text-sm text-text/70 dark:text-text-dark/70">
                Did you know? Our AI can generate questions on virtually any topic! 
                From quantum physics to cooking tips, we've got you covered! 🎉
              </p>
            </div>
          </div>
        ) : (
          // Form when not loading
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

            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-purple-500/30 flex items-center justify-center gap-2"
            >
              <Lightning size={20} />
              Generate Quiz
            </button>

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
} 