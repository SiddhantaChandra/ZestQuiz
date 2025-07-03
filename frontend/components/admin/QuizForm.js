'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import SortableQuestion from './SortableQuestion';
import AiQuizForm from './AiQuizForm';
import ToggleAiButton from './ToggleAiButton';
import Modal from '../common/Modal';
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showQuizCreatedToast, 
  showQuizUpdatedToast 
} from '@/lib/toast';
import { Lightning, Plus, FloppyDisk } from '@phosphor-icons/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

// Generate proper UUID v4
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

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
  const [showAiConfirmModal, setShowAiConfirmModal] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);

  // DnD sensors with modified settings for smoother dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: null
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Ensure all questions and options have IDs
  useEffect(() => {
    if (formData.questions.some(q => !q.id || q.options.some(o => !o.id))) {
      setFormData(prev => ({
        ...prev,
        questions: prev.questions.map(question => ({
          ...question,
          id: question.id || generateUUID(),
          options: question.options.map(option => ({
            ...option,
            id: option.id || generateUUID()
          }))
        }))
      }));
    }
  }, [formData.questions]);

  const handleToggleAi = () => {
    // Check if there's actual data before showing the warning
    const hasData = formData.title.trim() !== '' || 
                   formData.description.trim() !== '' || 
                   formData.tags.length > 0 || 
                   formData.questions.some(q => q.text.trim() !== '' || 
                     q.options.some(o => o.text.trim() !== ''));

    if (isDirty && hasData) {
      setShowAiConfirmModal(true);
    } else {
      setIsAiMode(!isAiMode);
      // Reset form data when switching modes if no real data exists
      if (!hasData) {
        setFormData({
          title: '',
          description: '',
          tags: [],
          status: 'DRAFT',
          questions: [],
        });
        setIsDirty(false);
      }
    }
  };

  const handleAiQuizGenerated = (aiQuizData) => {
    // Transform AI response to match form data structure
    const transformedData = {
      title: aiQuizData.title || `Quiz about ${aiQuizData.topic}`, // Use AI title with fallback
      description: aiQuizData.description || '',
      tags: aiQuizData.tags || [],
      status: 'DRAFT',
      questions: (aiQuizData.quiz || []).map((question, index) => ({
        id: generateUUID(),
        text: question.question,
        orderIndex: index,
        options: question.options.map((option, optIndex) => ({
          id: generateUUID(),
          text: option.text,
          isCorrect: option.isCorrect,
          orderIndex: optIndex
        }))
      }))
    };
    
    setFormData(transformedData);
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
      id: generateUUID(),
      text: '',
      orderIndex: formData.questions.length,
      options: Array(4).fill(null).map((_, i) => ({
        id: generateUUID(),
        text: '',
        isCorrect: i === 0, // First option is correct by default
        orderIndex: i
      }))
    };

    // Ensure proper data structure when adding to formData
    setFormData(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          ...newQuestion,
          options: newQuestion.options.map((option, index) => ({
            id: option.id,
            text: option.text || '',
            isCorrect: Boolean(option.isCorrect),
            orderIndex: option.orderIndex ?? index
          }))
        }
      ]
    }));
    setIsDirty(true);
  }, [formData.questions.length]);

  const updateQuestion = (questionId, updates) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map(q => {
        if (q.id !== questionId) return q;
        
        // If we're updating options, ensure proper structure
        if (updates.options) {
          return {
            ...q,
            ...updates,
            options: updates.options.map((option, index) => ({
              id: option.id || generateUUID(),
              text: option.text || '',
              isCorrect: Boolean(option.isCorrect),
              orderIndex: option.orderIndex ?? index
            }))
          };
        }
        
        // For other updates
        return { ...q, ...updates };
      })
    }));
    setIsDirty(true);
  };

  const removeQuestion = (questionId) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
        .map((q, idx) => ({ ...q, orderIndex: idx }))
    }));
    setIsDirty(true);
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
      // Ensure questions are properly structured
      const cleanedQuestions = formData.questions.map((question, qIndex) => {
        // Clean options
        const cleanedOptions = question.options.map((option, oIndex) => ({
          id: option.id,
          text: (option.text || '').trim(),
          isCorrect: Boolean(option.isCorrect),
          orderIndex: oIndex
        }));

        // Ensure one correct answer
        const hasCorrect = cleanedOptions.some(opt => opt.isCorrect);
        if (!hasCorrect) {
          cleanedOptions[0].isCorrect = true;
        }

        return {
          id: question.id,
          text: (question.text || '').trim(),
          orderIndex: qIndex,
          options: cleanedOptions
        };
      });

      const cleanedData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags.map(t => t.trim()).filter(Boolean),
        questions: cleanedQuestions,
        status: formData.status || 'DRAFT'
      };

      await onSubmit(cleanedData);
      setIsDirty(false);
      if (isEditing) {
        showQuizUpdatedToast();
      } else {
        showQuizCreatedToast();
      }
      router.back();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = error.message || 'Failed to save quiz';
      showErrorToast(errorMessage);
      setError(errorMessage);
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
          id: generateUUID(),
          text: data.question,
        orderIndex: formData.questions.length,
          options: data.options.map((optionText, i) => ({
            id: generateUUID(),
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
    if (!isAiMode && formData.questions && formData.questions.length === 0) {
      addQuestion();
    }
  }, [isAiMode, addQuestion, formData.questions?.length]);

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}



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
            {!isEditing && (
              <ToggleAiButton isAiMode={false} onToggle={handleToggleAi} />
            )}
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
                className="w-full px-4 py-2 bg-background dark:bg-background-dark border border-border rounded-lg text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary/50"
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
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <FloppyDisk size={18} weight="bold" />
                  Save Quiz
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.questions?.map(q => q.id) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-6">
                    {formData.questions?.map((question) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        onUpdate={(updates) => updateQuestion(question.id, updates)}
                        onDelete={removeQuestion}
                        isDragging={activeDragId === question.id}
                        questionNumber={formData.questions.indexOf(question) + 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Action Buttons Below Questions */}
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={generateAiQuestion}
                  disabled={isGeneratingQuestion}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                >
                  <Lightning size={18} weight="bold" />
                  {isGeneratingQuestion ? 'Generating...' : 'Generate AI Question'}
                </button>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={18} weight="bold" />
                  Add Question
                </button>
              </div>

              {/* Footer Save Button */}
              <div className="mt-8 pt-6 border-t border-border">
                                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
                  >
                    <FloppyDisk size={20} weight="bold" />
                    Save Quiz
                  </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 