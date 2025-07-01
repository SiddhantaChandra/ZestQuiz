'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import Modal from '@/components/common/Modal';

export default function SortableQuestion({ question, index, onUpdate, onDelete, isAnyDragging, isDragging }) {
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
        className={`bg-white rounded-lg border shadow-sm transition-colors duration-150 max-w-full ${
          isDragging ? 'shadow-lg border-primary/30' : ''
        }`}
      >
        {/* Question Header */}
        <div className="flex items-center gap-4 p-4 overflow-hidden">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move p-2 hover:bg-gray-100 rounded flex-shrink-0"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (listeners.onPointerDown) {
                listeners.onPointerDown(e);
              }
            }}
          >
            ⋮⋮
          </div>
          <span className="text-gray-500 flex-shrink-0">Question {index + 1}</span>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className={`ml-auto text-red-600 hover:text-red-800 transition-opacity duration-150 flex-shrink-0 ${
              isAnyDragging ? 'opacity-0' : 'opacity-100'
            }`}
          >
            Delete
          </button>
        </div>

        {/* Question Text */}
        <div className="px-4 pb-4 overflow-hidden">
          <input
            type="text"
            value={question.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter question text"
            disabled={isAnyDragging}
          />
        </div>

        {/* Options */}
        <div 
          className={`space-y-3 px-4 pb-4 transition-all duration-150 overflow-hidden ${
            isAnyDragging ? 'h-0 opacity-0 p-0' : 'opacity-100'
          }`}
        >
          {question.options.map((option, optIndex) => (
            <div key={option.id} className="flex items-center gap-3 overflow-hidden">
              <input
                type="radio"
                checked={option.isCorrect}
                onChange={() => handleOptionChange(optIndex, 'isCorrect', true)}
                className="w-4 h-4 text-primary flex-shrink-0"
                disabled={isAnyDragging}
              />
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg min-w-0"
                placeholder={`Option ${optIndex + 1}`}
                disabled={isAnyDragging}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 