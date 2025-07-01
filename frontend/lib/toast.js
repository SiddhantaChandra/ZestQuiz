import toast from 'react-hot-toast';

// Default toast configurations
const defaultConfig = {
  duration: 3000,
  position: 'top-center',
  style: {
    padding: '12px 24px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    maxWidth: '350px',
    textAlign: 'center',
  },
};

// Success toasts
export const showSuccessToast = (message) => {
  toast.success(message, {
    ...defaultConfig,
    icon: '✓',
    style: {
      ...defaultConfig.style,
      background: '#bce5bc',
      color: '#2d7b2d',
      border: '1px solid #2d7b2d',
    },
  });
};

// Error toasts
export const showErrorToast = (message) => {
  toast.error(message, {
    ...defaultConfig,
    icon: '✕',
    style: {
      ...defaultConfig.style,
      background: '#fbd5d5',
      color: '#9b1c1c',
      border: '1px solid #9b1c1c',
    },
  });
};

// Info toasts
export const showInfoToast = (message) => {
  toast(message, {
    ...defaultConfig,
    icon: 'ℹ',
    style: {
      ...defaultConfig.style,
      background: '#e1effe',
      color: '#1e429f',
      border: '1px solid #1e429f',
    },
  });
};

// Warning toasts
export const showWarningToast = (message) => {
  toast(message, {
    ...defaultConfig,
    icon: '⚠',
    style: {
      ...defaultConfig.style,
      background: '#fef3c7',
      color: '#92400e',
      border: '1px solid #92400e',
    },
  });
};

// Authentication toasts
export const showLoginSuccessToast = (username) => {
  showSuccessToast(`Welcome back, ${username}! 👋`);
};

export const showLogoutSuccessToast = () => {
  showSuccessToast('Successfully logged out. See you soon! 👋');
};

export const showAuthErrorToast = (error) => {
  showErrorToast(error || 'Authentication failed. Please try again.');
};

// Quiz management toasts
export const showQuizCreatedToast = () => {
  showSuccessToast('Quiz created successfully! 🎉');
};

export const showQuizUpdatedToast = () => {
  showSuccessToast('Changes saved successfully! ✨');
};

export const showQuizDeletedToast = () => {
  showSuccessToast('Quiz deleted successfully.');
};

export const showQuizErrorToast = (error) => {
  showErrorToast(`Quiz operation failed: ${error}`);
};

export const showStatusUpdateToast = (status) => {
  showSuccessToast(`Quiz status updated to ${status.toLowerCase()}`);
};

// Auto-save toasts
export const showAutoSaveToast = () => {
  showInfoToast('Changes auto-saved ✨');
};

// Session toasts
export const showSessionWarningToast = () => {
  showWarningToast('Your session will expire soon. Please save your work.');
};

// Error handler wrapper
export const withToastErrorHandler = async (promise, errorMessage = 'Operation failed') => {
  try {
    const result = await promise;
    return result;
  } catch (error) {
    showErrorToast(error.response?.data?.message || error.message || errorMessage);
    throw error;
  }
}; 