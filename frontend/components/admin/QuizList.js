'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';

export default function QuizList({ quizzes: initialQuizzes, onUpdate }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quizId: null });
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
    setLoading(prev => ({ ...prev, [quizId]: true }));
    setError(null);
    
    try {
      await api.patch(`/quizzes/${quizId}`, { status: newStatus });
      const updatedQuizzes = quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
      );
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(`Failed to update quiz status: ${error.message}`);
      // Revert the select value
      const select = document.querySelector(`select[data-quiz-id="${quizId}"]`);
      if (select) {
        select.value = quizzes.find(q => q.id === quizId)?.status || 'DRAFT';
      }
    } finally {
      setLoading(prev => ({ ...prev, [quizId]: false }));
    }
  };

  // Handle quiz deletion
  const handleDelete = async (quizId) => {
    setLoading(prev => ({ ...prev, [quizId]: true }));
    setError(null);

    try {
      await api.delete(`/quizzes/${quizId}`);
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Failed to delete quiz: ${errorMessage}. ${
        error.response?.status === 404 
          ? 'The quiz may have already been deleted.'
          : 'Please try again or contact support if the problem persists.'
      }`);
    } finally {
      setLoading(prev => ({ ...prev, [quizId]: false }));
    }
  };

  // Handle edit
  const handleEdit = (quizId) => {
    router.push(`/admin/quizzes/${quizId}/edit`);
  };

  const statusColors = {
    DRAFT: 'bg-yellow-100 text-yellow-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-red-100 text-red-800',
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quizId: null })}
        onConfirm={() => handleDelete(deleteModal.quizId)}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone and will delete all related questions, options, and attempts."
        confirmText="Delete Quiz"
        isDestructive={true}
      />

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
                    data-quiz-id={quiz.id}
                    className={`px-2 py-1 rounded ${statusColors[quiz.status]} ${loading[quiz.id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={quiz.status}
                    onChange={(e) => handleStatusChange(quiz.id, e.target.value)}
                    disabled={loading[quiz.id]}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4">{quiz.questions?.length || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleEdit(quiz.id)}
                      disabled={loading[quiz.id]}
                      className={`bg-pastleBlue hover:bg-pastleBlue-hover text-pastleBlue-text flex items-center gap-2 px-2 py-1 min-w-16 justify-center rounded-md border border-black ${
                        loading[quiz.id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, quizId: quiz.id })}
                      disabled={loading[quiz.id]}
                      className={`bg-pastleRed hover:bg-pastleRed-hover text-pastleRed-text flex items-center gap-2 px-2 py-1 min-w-16 justify-center rounded-md border border-black ${
                        loading[quiz.id] ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
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