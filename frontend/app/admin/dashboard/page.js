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
        
        // Calculate stats
        setStats({
          totalQuizzes: quizzes.length,
          activeQuizzes: quizzes.filter(q => q.status === 'ACTIVE').length,
          draftQuizzes: quizzes.filter(q => q.status === 'DRAFT').length,
          inactiveQuizzes: quizzes.filter(q => q.status === 'INACTIVE').length,
        });

        // Get 5 most recent quizzes
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
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const statusColors = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link 
          href="/admin/quizzes/new"
          className="btn-primary px-6 py-2 rounded-lg"
        >
          Create New Quiz
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-600">Total Quizzes</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalQuizzes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-600">Active Quizzes</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeQuizzes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-600">Draft Quizzes</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.draftQuizzes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-600">Inactive Quizzes</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactiveQuizzes}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/quizzes"
            className="btn-secondary px-6 py-3 rounded-lg"
          >
            Manage All Quizzes
          </Link>
          <Link
            href="/admin/quizzes/new"
            className="btn-primary px-6 py-3 rounded-lg"
          >
            Create New Quiz
          </Link>
        </div>
      </div>

      {/* Recent Quizzes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Recent Quizzes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left">Title</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Questions</th>
                <th className="px-6 py-3 text-left">Last Updated</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentQuizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{quiz.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded ${statusColors[quiz.status]}`}>
                      {quiz.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{quiz.questions?.length || 0}</td>
                  <td className="px-6 py-4">
                    {new Date(quiz.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/edit`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/admin/quizzes/${quiz.id}/preview`}
                        className="text-green-600 hover:text-green-800"
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
              className="text-primary hover:text-primary-dark"
            >
              View All Quizzes →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 