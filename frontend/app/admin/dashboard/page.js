'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    draftQuizzes: 0,
    inactiveQuizzes: 0,
  });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/quizzes');
        const quizzes = response.data;
        
        setStats({
          totalQuizzes: quizzes.length,
          activeQuizzes: quizzes.filter(q => q.status === 'ACTIVE').length,
          draftQuizzes: quizzes.filter(q => q.status === 'DRAFT').length,
          inactiveQuizzes: quizzes.filter(q => q.status === 'INACTIVE').length,
        });

        const sortedQuizzes = [...quizzes].sort(
          (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
        ).slice(0, 5);
        setRecentQuizzes(sortedQuizzes);
        
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  const statusColors = {
    DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    INACTIVE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text">Admin Dashboard</h1>
        <Link 
          href="/admin/quizzes/new"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors"
        >
          Create New Quiz
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
          <h3 className="text-lg font-semibold text-text/70">Total Quizzes</h3>
          <p className="text-3xl font-bold text-primary dark:text-primary-light mt-2">{stats.totalQuizzes}</p>
        </div>
        <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
          <h3 className="text-lg font-semibold text-text/70">Active Quizzes</h3>
          <p className="text-3xl font-bold text-green-500 dark:text-green-300 mt-2">{stats.activeQuizzes}</p>
        </div>
        <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
          <h3 className="text-lg font-semibold text-text/70">Draft Quizzes</h3>
          <p className="text-3xl font-bold text-yellow-500 dark:text-yellow-300 mt-2">{stats.draftQuizzes}</p>
        </div>
        <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
          <h3 className="text-lg font-semibold text-text/70">Inactive Quizzes</h3>
          <p className="text-3xl font-bold text-red-500 dark:text-red-300 mt-2">{stats.inactiveQuizzes}</p>
        </div>
      </div>

      <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
        <h2 className="text-xl font-semibold mb-4 text-text">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/quizzes"
            className="bg-secondary hover:bg-secondary-hover text-text-dark px-6 py-3 rounded-lg transition-colors text-black"
          >
            Manage All Quizzes
          </Link>
          <Link
            href="/admin/quizzes/new"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create New Quiz
          </Link>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-card dark:bg-card-dark p-6 rounded-lg shadow-custom border border-border">
        <h2 className="text-xl font-semibold mb-4 text-text">Recent Quizzes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-text">Title</th>
                <th className="px-6 py-3 text-left text-text">Status</th>
                <th className="px-6 py-3 text-left text-text">Questions</th>
                <th className="px-6 py-3 text-left text-text">Last Updated</th>
                <th className="px-6 py-3 text-left text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentQuizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-border hover:bg-background/50 dark:hover:bg-background-dark/50 transition-colors">
                  <td className="px-6 py-4 text-text">{quiz.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded ${statusColors[quiz.status]}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text">{quiz.questions?.length || 0}</td>
                  <td className="px-6 py-4 text-text">
                    {new Date(quiz.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/edit`}
                        className="bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors bg-green-300 hover:bg-green-400 text-black"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/quizzes/${quiz.id}/preview`}
                        className="bg-secondary hover:bg-secondary-hover px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors text-black"
                      >
                        Preview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentQuizzes.length > 0 && (
          <div className="mt-4 text-right">
            <Link
              href="/admin/quizzes"
              className="text-primary dark:text-primary-light hover:text-primary-hover dark:hover:text-primary-light/80 transition-colors"
            >
              View All Quizzes →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 