'use client';

import { useState, useEffect, memo } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import SearchableTags from './SearchableTags';
import {
  showQuizDeletedToast,
  showStatusUpdateToast,
  withToastErrorHandler
} from '@/lib/toast';

const QuizRow = memo(function QuizRow({ quiz, statusColors, onStatusChange, onEdit, onDeleteRequest }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsUpdatingStatus(true);

    try {
      await withToastErrorHandler(
        api.patch(`/quizzes/${quiz.id}`, { status: newStatus }),
        'Failed to update quiz status'
      );
      onStatusChange(quiz.id, newStatus);
      showStatusUpdateToast(newStatus);
    } catch (error) {
      console.error('Failed to update quiz status:', error);
      // The select value is controlled by quiz.status, so it reverts automatically
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <tr className="border-b border-border hover:bg-background/50 dark:hover:bg-background-dark/50 transition-colors">
      <td className="px-6 py-4 text-text dark:text-text-dark">{quiz.title}</td>
      <td className="px-6 py-4">
        <select
          className={`px-2 py-1 rounded ${statusColors[quiz.status]} border border-border`}
          value={quiz.status}
          onChange={handleStatusChange}
          disabled={isUpdatingStatus}
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
            onClick={() => onEdit(quiz.id)}
            disabled={isUpdatingStatus}
            className="bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-light px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteRequest(quiz.id)}
            disabled={isUpdatingStatus}
            className="bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-md border border-border min-w-16 text-center transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function QuizList({ quizzes: initialQuizzes }) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, quizId: null });
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const itemsPerPage = 10;

  const allTags = [...new Set(quizzes.flatMap(quiz => quiz.tags || []))].sort();

  const filteredQuizzes = quizzes
    .filter(quiz => {
      const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || quiz.status === statusFilter;
      const matchesTags = selectedTags.length === 0 ||
                         (quiz.tags && selectedTags.every(tag => quiz.tags.includes(tag)));
      return matchesSearch && matchesStatus && matchesTags;
    });

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedTags]);

  const handleStatusChange = (quizId, newStatus) => {
    setQuizzes(prev => prev.map(quiz =>
      quiz.id === quizId ? { ...quiz, status: newStatus } : quiz
    ));
  };

  const handleDelete = async (quizId) => {
    setDeletingQuizId(quizId);
    setError(null);

    try {
      await withToastErrorHandler(
        api.delete(`/quizzes/${quizId}`),
        'Failed to delete quiz'
      );
      setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      showQuizDeletedToast();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      setError(`Failed to delete quiz: ${errorMessage}. ${
        error.response?.status === 404
          ? 'The quiz may have already been deleted.'
          : 'Please try again or contact support if the problem persists.'
      }`);
    } finally {
      setDeletingQuizId(null);
      setDeleteModal({ isOpen: false, quizId: null });
    }
  };

  const handleEdit = (quizId) => {
    router.push(`/admin/quizzes/${quizId}/edit`);
  };

  const statusColors = {
    DRAFT: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
    ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    INACTIVE: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quizId: null })}
        onConfirm={() => handleDelete(deleteModal.quizId)}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone and will delete all related questions, options, and attempts."
        confirmText="Delete Quiz"
        isDestructive={true}
      />

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
              <QuizRow
                key={quiz.id}
                quiz={quiz}
                statusColors={statusColors}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDeleteRequest={(quizId) => setDeleteModal({ isOpen: true, quizId })}
              />
            ))}
          </tbody>
        </table>

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
