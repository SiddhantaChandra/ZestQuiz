'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { api } from '@/lib/api';
import SortableQuestion from './SortableQuestion';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/navigation';

export default function QuizForm({ quiz, onSubmit, isEditing = false }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    status: 'DRAFT',
    questions: [],
    ...quiz,
  });

  const [tagInput, setTagInput] = useState('');
  const [error, setError] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  // DnD sensors with modified settings for smoother dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: null
    })
  );

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
  };

  // Handle tag input
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setIsDirty(true);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
    setIsDirty(true);
  };

  // Handle question operations
  const addQuestion = () => {
    const newQuestion = {
      id: `temp_${Date.now()}`,
      text: '',
      orderIndex: formData.questions.length,
      options: Array(4).fill(null).map((_, i) => ({
        id: `temp_opt_${Date.now()}_${i}`,
        text: '',
        isCorrect: i === 0,
        orderIndex: i
      }))
    };

    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setIsDirty(true);
  };

  const updateQuestion = (questionId, updates) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
    setIsDirty(true);
  };

  const removeQuestion = (questionId) => {
    setQuestionToDelete(questionId);
  };

  const handleConfirmQuestionDelete = () => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionToDelete)
        .map((q, idx) => ({ ...q, orderIndex: idx }))
    }));
    setIsDirty(true);
    setQuestionToDelete(null);
  };

  const handleExit = () => {
    if (isDirty) {
      setShowExitModal(true);
    } else {
      router.back();
    }
  };

  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    setActiveDragId(active.id);
    // Prevent horizontal scrolling during drag
    document.body.style.overflowX = 'hidden';
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    // Restore scrolling
    document.body.style.overflowX = '';
    
    if (active && over && active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.questions.findIndex(q => q.id === active.id);
        const newIndex = prev.questions.findIndex(q => q.id === over.id);
        const newQuestions = arrayMove(prev.questions, oldIndex, newIndex)
          .map((q, idx) => ({ ...q, orderIndex: idx }));
        return { ...prev, questions: newQuestions };
      });
      setIsDirty(true);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (formData.questions.length === 0) {
      setError('At least one question is required');
      return;
    }

    // Validate questions and options
    for (const question of formData.questions) {
      if (!question.text.trim()) {
        setError('All questions must have text');
        return;
      }
      if (question.options.length !== 4) {
        setError('Each question must have exactly 4 options');
        return;
      }
      if (!question.options.some(opt => opt.isCorrect)) {
        setError('Each question must have exactly one correct answer');
        return;
      }
      if (question.options.filter(opt => opt.isCorrect).length > 1) {
        setError('Each question can only have one correct answer');
        return;
      }
      for (const option of question.options) {
        if (!option.text.trim()) {
          setError('All options must have text');
          return;
        }
      }
    }

    try {
      await onSubmit(formData);
      setIsDirty(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to save quiz');
    }
  };

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Delete Question Modal */}
      <Modal
        isOpen={questionToDelete !== null}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleConfirmQuestionDelete}
        title="Delete Question"
        message="Are you sure you want to remove this question? This action cannot be undone."
        confirmText="Delete Question"
        isDestructive={true}
      />

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => router.back()}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? All changes will be lost."
        confirmText="Leave"
        isDestructive={true}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Basic Quiz Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
            rows="3"
            placeholder="Enter quiz description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map(tag => (
              <span
                key={tag}
                className="bg-secondary/10 px-2 py-1 rounded-lg flex items-center gap-1"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Type a tag and press Enter"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Questions</h3>
          <button
            type="button"
            onClick={addQuestion}
            className="px-4 py-2 bg-secondary text-black rounded-lg hover:bg-secondary-hover border border-black"
          >
            Add Question
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={formData.questions.map(q => q.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 w-full overflow-hidden">
              {formData.questions.map((question, index) => (
                <SortableQuestion
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(updates) => updateQuestion(question.id, updates)}
                  onDelete={removeQuestion}
                  isAnyDragging={activeDragId !== null}
                  isDragging={activeDragId === question.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={handleExit}
          className="px-6 py-2 rounded-lg bg-pastleRed hover:bg-pastleRed-hover text-pastleRed-text border border-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-pastleGreen hover:bg-pastleGreen-hover text-pastleGreen-text border border-black"
          disabled={!isDirty}
        >
          {isEditing ? 'Save Changes' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
} 