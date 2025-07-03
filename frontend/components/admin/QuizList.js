'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import SearchableTags from './SearchableTags';
import {
  showQuizDeletedToast,
  showQuizErrorToast,
  showStatusUpdateToast,
  withToastErrorHandler
} from '@/lib/toast';

export default function QuizList({ quizzes: initialQuizzes, onUpdate }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quizId: null });
  const itemsPerPage = 10;

  // Get unique tags from all quizzes
  const allTags = [...new Set(quizzes.flatMap(quiz => quiz.tags || []))].sort();

  // Filter quizzes based on search term, status and tags
  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || quiz.status === statusFilter;
      const matchesTags = selectedTags.length === 0 || 
                       (quiz.tags && selectedTags.every(tag => quiz.tags.includes(tag)));
      return matchesSearch && matchesStatus && matchesTags;
    });

  // Calculate pagination
  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedTags]);

  // Handle status change
  const handleStatusChange = async (quizId, newStatus) => {
    setLoading(prev => ({ ...prev, [quizId]: true }));
    setError(null);
    
    try {
      await withToastErrorHandler(
        api.patch(`/quizzes/${quizId}`, { status: newStatus }),
        'Failed to update quiz status'
      );
      const updatedQuizzes = quizzes.map(quiz =>
        quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
      );
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
      showStatusUpdateToast(newStatus);
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
      await withToastErrorHandler(
        api.delete(`/quizzes/${quizId}`),
        'Failed to delete quiz'
      );
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== quizId);
      setQuizzes(updatedQuizzes);
      if (onUpdate) onUpdate();
      showQuizDeletedToast();
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
    DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    INACTIVE: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
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
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg flex-1 text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {allTags.length > 0 && (
            <div className="w-64">
              <SearchableTags
                allTags={allTags}
                selectedTags={selectedTags}
                onTagsChange={setSelectedTags}
              />
            </div>
          )}
          <select
            className="px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg min-w-[120px] text-text dark:text-text-dark"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="bg-background dark:bg-background-dark text-text dark:text-text-dark px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-border"
              >
                {tag}
                <button
                  onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                  className="hover:text-red-500 dark:hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quiz List */}
      <div className="bg-card dark:bg-card-dark rounded-lg shadow-custom border border-border">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-3 text-left text-text dark:text-text-dark">Title</th>
              <th className="px-6 py-3 text-left text-text dark:text-text-dark">Status</th>
              <th className="px-6 py-3 text-left text-text dark:text-text-dark">Questions</th>
              <th className="px-6 py-3 text-left text-text dark:text-text-dark">Tags</th>
              <th className="px-6 py-3 text-left text-text dark:text-text-dark">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedQuizzes.map((quiz) => (
              <tr key={quiz.id} className="border-b border-border hover:bg-background/50 dark:hover:bg-background-dark/50 transition-colors">
                <td className="px-6 py-4 text-text dark:text-text-dark">{quiz.title}</td>
                <td className="px-6 py-4">
                  <select
                    className={`px-2 py-1 rounded ${statusColors[quiz.status]} border border-border`}
                    value={quiz.status}
                    onChange={(e) => handleStatusChange(quiz.id, e.target.value)}
                    disabled={loading[quiz.id]}
                    data-quiz-id={quiz.id}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-text dark:text-text-dark">{quiz.questions?.length || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {quiz.tags?.map(tag => (
                      <span
                        key={tag}
                        className="bg-background dark:bg-background-dark text-text dark:text-text-dark px-2 py-1 rounded-full text-xs border border-border capitalize"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(quiz.id)}
                      disabled={loading[quiz.id]}
                      className="bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, quizId: quiz.id })}
                      disabled={loading[quiz.id]}
                      className="bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 p-4 border-t border-border">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'bg-background dark:bg-background-dark text-text dark:text-text-dark hover:bg-background-dark/50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 