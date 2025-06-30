'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function QuizList({ quizzes: initialQuizzes, onUpdate }) {
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter quizzes based on search term and status
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || quiz.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle status change
  const handleStatusChange = async (quizId, newStatus) => {
    try {
      await api.patch(`/quizzes/${quizId}`, { status: newStatus });
      const updatedQuizzes = quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
      );
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to update quiz status:', error);
    }
  };

  // Handle quiz deletion
  const handleDelete = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await api.delete(`/quizzes/${quizId}`);
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  const statusColors = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="px-4 py-2 border rounded-lg flex-1"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-4 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Questions</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuizzes.map((quiz) => (
              <tr key={quiz.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{quiz.title}</td>
                <td className="px-6 py-4">
                  <select
                    className={`px-2 py-1 rounded ${statusColors[quiz.status]}`}
                    value={quiz.status}
                    onChange={(e) => handleStatusChange(quiz.id, e.target.value)}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4">{quiz.questions?.length || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <a
                      href={`/admin/quizzes/${quiz.id}/edit`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => handleDelete(quiz.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded ${
                currentPage === page
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 