'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { CircleNotch } from '@phosphor-icons/react';

export default function LoginForm() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-text dark:text-text-dark">Login to ZestQuiz</h2>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <CircleNotch size={20} className="animate-spin" />
              Logging in...
            </span>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-text/60 dark:text-text-dark/60">
        <p>Demo Credentials:</p>
        <div className="mt-2 space-y-1">
          <p>Admin: admin@zestquiz.com / Admin@123</p>
          <p>User: user@zestquiz.com / User@123</p>
        </div>
      </div>
    </div>
  );
} 