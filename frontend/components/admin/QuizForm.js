'use client';

import { useState, useEffect, useCallback } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { api } from '@/lib/api';
import SortableQuestion from './SortableQuestion';
import Modal from '@/components/common/Modal';
import { useRouter } from 'next/navigation';
import ToggleAiButton from './ToggleAiButton';
import AiQuizForm from './AiQuizForm';
import { showWarningToast, showErrorToast, showQuizCreatedToast, showQuizUpdatedToast } from '@/lib/toast';

const generateUniqueId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function QuizForm({ quiz, onSubmit, isEditing = false }) {
  const router = useRouter();
  const [isAiMode, setIsAiMode] = useState(!isEditing);
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
  const [showAiConfirmModal, setShowAiConfirmModal] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // DnD sensors with modified settings for smoother dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: null
    })
  );

  // Ensure all questions and options have IDs
  useEffect(() => {
    if (formData.questions.some(q => !q.id || q.options.some(o => !o.id))) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(question => ({
          ...question,
          id: question.id || generateUniqueId('question'),
          options: question.options.map(option => ({
            ...option,
            id: option.id || generateUniqueId('option')
          }))
        }))
      }));
    }
  }, [formData.questions]);

  const handleToggleAi = () => {
    if (isDirty) {
      setShowAiConfirmModal(true);
    } else {
      setIsAiMode(!isAiMode);
    }
  };

  const handleAiQuizGenerated = (aiQuizData) => {
    setFormData(aiQuizData);
    setIsAiMode(false);
    setIsDirty(true);
  };

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
  const addQuestion = useCallback(() => {
    const newQuestion = {
      id: generateUniqueId('question'),
      text: '',
      orderIndex: formData.questions.length,
      options: Array(4).fill(null).map((_, i) => ({
        id: generateUniqueId('option'),
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
  }, [formData.questions.length]);

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

  const validateForm = () => {
    // Validate title
    if (!formData.title.trim()) {
      showWarningToast('Please enter a quiz title');
      return false;
    }

    // Validate description
    if (!formData.description.trim()) {
      showWarningToast('Please enter a quiz description');
      return false;
    }

    // Validate tags
    if (formData.tags.length === 0) {
      showWarningToast('Please add at least one tag');
      return false;
    }

    // Validate questions
    if (formData.questions.length === 0) {
      showWarningToast('Please add at least one question');
      return false;
    }

    // Validate each question
    for (let i = 0; i < formData.questions.length; i++) {
      const question = formData.questions[i];
      
      // Check question text
      if (!question.text.trim()) {
        showWarningToast(`Question ${i + 1} is missing text`);
        return false;
      }

      // Check options
      if (question.options.length < 2) {
        showWarningToast(`Question ${i + 1} needs at least 2 options`);
        return false;
      }

      // Check if each option has text
      const emptyOption = question.options.findIndex(opt => !opt.text.trim());
      if (emptyOption !== -1) {
        showWarningToast(`Question ${i + 1} has an empty option (Option ${emptyOption + 1})`);
        return false;
      }

      // Check if correct answer is selected
      if (!question.options.some(opt => opt.isCorrect)) {
        showWarningToast(`Question ${i + 1} needs a correct answer selected`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await onSubmit(formData);
      if (response.success) {
      if (isEditing) {
        showQuizUpdatedToast();
      } else {
        showQuizCreatedToast();
        }
        router.back();
      }
    } catch (error) {
      showErrorToast(error.message || 'Failed to save quiz');
      setError(error.message || 'Failed to save quiz');
    }
  };

  const generateAiQuestion = async () => {
    try {
    setIsGeneratingQuestion(true);
      const response = await api.post('/api/ai/generate-question', {
        title: formData.title,
        description: formData.description,
        existingQuestions: formData.questions.map(q => q.text),
      });

      if (response.ok) {
        const data = await response.json();
      const newQuestion = {
          id: generateUniqueId('question'),
          text: data.question,
        orderIndex: formData.questions.length,
          options: data.options.map((optionText, i) => ({
            id: generateUniqueId('option'),
            text: optionText,
            isCorrect: i === data.correctOptionIndex,
          orderIndex: i
        }))
      };

        setFormData(prev => ({
          ...prev,
          questions: [...prev.questions, newQuestion]
        }));
      setIsDirty(true);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate question');
      }
    } catch (error) {
      showErrorToast(error.message || 'Failed to generate question');
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Add beforeunload event listener
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

  // Add question if none exist and not in AI mode
  useEffect(() => {
    if (!isAiMode && formData.questions.length === 0) {
      addQuestion();
    }
  }, [isAiMode, addQuestion, formData.questions.length]);

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Delete Question Modal */}
      <Modal
        isOpen={questionToDelete !== null}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleConfirmQuestionDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        confirmText="Delete Question"
        isDestructive={true}
      />

      {/* Exit Confirmation Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={() => router.back()}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Leave"
        isDestructive={true}
      />

      {/* AI Mode Confirmation Modal */}
      <Modal
        isOpen={showAiConfirmModal}
        onClose={() => setShowAiConfirmModal(false)}
        onConfirm={() => {
          setIsAiMode(!isAiMode);
          setShowAiConfirmModal(false);
        }}
        title="Switch to AI Mode"
        message="Switching to AI mode will clear your current quiz. Are you sure you want to continue?"
        confirmText="Switch to AI Mode"
        isDestructive={true}
      />

      {isAiMode ? (
        <AiQuizForm onQuizGenerated={handleAiQuizGenerated} onCancel={() => setIsAiMode(false)} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-text dark:text-text-dark">
              {isEditing ? 'Edit Quiz' : 'Create Quiz'}
            </h1>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleExit}
                className="px-4 py-2 bg-card dark:bg-card-dark hover:bg-background dark:hover:bg-background-dark text-text dark:text-text-dark border border-border rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg transition-colors"
              >
                Save Quiz
              </button>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50"
                placeholder="Enter quiz title"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50"
                placeholder="Enter quiz description"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Tags
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="w-full px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg text-text dark:text-text-dark placeholder-text/50 dark:placeholder-text-dark/50"
                  placeholder="Type a tag and press Enter"
                />
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-background dark:bg-background-dark text-text dark:text-text-dark px-3 py-1 rounded-full text-sm border border-border flex items-center gap-2 capitalize"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-red-500 dark:hover:text-red-400"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text dark:text-text-dark mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-card dark:bg-card-dark border border-border rounded-lg text-text dark:text-text-dark"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            {/* Questions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-text dark:text-text-dark">Questions</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateAiQuestion}
                    disabled={isGeneratingQuestion}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isGeneratingQuestion ? 'Generating...' : 'Generate AI Question'}
                  </button>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Add Question
                  </button>
                </div>
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
                  <div className="space-y-4">
                    {formData.questions.map((question, index) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        questionNumber={index + 1}
                        onUpdate={updateQuestion}
                        onDelete={removeQuestion}
                        isDragging={activeDragId === question.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 