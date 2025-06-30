'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableQuestion({ question, index, onUpdate, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-4 rounded-lg border shadow-sm"
    >
      {/* Question Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move p-2 hover:bg-gray-100 rounded"
        >
          ⋮⋮
        </div>
        <span className="text-gray-500">Question {index + 1}</span>
        <button
          type="button"
          onClick={() => onDelete(question.id)}
          className="ml-auto text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4">
        <input
          type="text"
          value={question.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Enter question text"
        />
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, optIndex) => (
          <div key={option.id} className="flex items-center gap-3">
            <input
              type="radio"
              checked={option.isCorrect}
              onChange={() => handleOptionChange(optIndex, 'isCorrect', true)}
              className="w-4 h-4 text-primary"
            />
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(optIndex, 'text', e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
              placeholder={`Option ${optIndex + 1}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 