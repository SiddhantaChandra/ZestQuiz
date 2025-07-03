'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import Modal from '@/components/common/Modal';

export default function SortableQuestion({ question, questionNumber, onUpdate, onDelete, isAnyDragging, isDragging }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: question.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 1000 : 'auto',
    opacity: isAnyDragging && !isDragging ? 0.6 : 1,
    width: '100%',
    cursor: 'default'
  };

  const handleOptionChange = (optionIndex, field, value) => {
    const newOptions = [...question.options];
    if (field === 'isCorrect') {
      // Uncheck all other options
      newOptions.forEach((opt, idx) => {
        newOptions[idx] = { ...opt, isCorrect: idx === optionIndex };
      });
    } else {
      newOptions[optionIndex] = { ...newOptions[optionIndex], [field]: value };
    }
    onUpdate({ options: newOptions });
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  return (
    <>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(question.id);
          setShowDeleteModal(false);
        }}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete Question"
        isDestructive={true}
      />

      <div
        ref={setNodeRef}
        style={style}
        className={`bg-card dark:bg-card-dark rounded-lg border border-border shadow-sm transition-all duration-150 ${
          isDragging ? 'shadow-lg border-primary/30 dark:border-primary/50' : ''
        }`}
      >
        {/* Question Header */}
        <div className="flex items-center gap-4 p-4">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-2 hover:bg-background dark:hover:bg-background-dark rounded flex-shrink-0 text-text dark:text-text-dark transition-colors"
          >
            ⋮⋮
          </div>
          <span className="text-text/60 dark:text-text-dark/60 flex-shrink-0">Question {questionNumber}</span>
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors flex-shrink-0"
          >
            Delete
          </button>
        </div>

        {/* Question Text */}
        <div className="px-4 pb-4">
          <input
            type="text"
            value={question.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50 transition-colors"
            placeholder="Enter question text"
          />
        </div>

        {/* Options */}
        <div className="space-y-3 px-4 pb-4">
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-center gap-3">
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={() => handleOptionChange(optIndex, 'isCorrect', true)}
                className="w-4 h-4 text-primary border-border focus:ring-primary/30 dark:focus:ring-primary/50 cursor-pointer"
              />
              <input
                type="text"
                value={option.text || ''}
                onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
                className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50 transition-colors"
                placeholder={`Option ${optIndex + 1}`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 