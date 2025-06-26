// src/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

interface ErrorState {
  error: string | null;
  isError: boolean;
  errorType: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
}

interface UseErrorHandlerReturn extends ErrorState {
  showError: (error: string, type?: ErrorState['errorType']) => void;
  clearError: () => void;
  handleApiError: (error: any) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorType: 'unknown',
  });
  
  const { logout } = useAuth();

  const showError = useCallback((error: string, type: ErrorState['errorType'] = 'unknown') => {
    setErrorState({
      error,
      isError: true,
      errorType: type,
    });
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorType: 'unknown',
    });
  }, []);

  const handleApiError = useCallback((error: any) => {
    if (typeof error === 'string') {
      showError(error, 'unknown');
      return;
    }

    // Handle network errors
    if (error.message && error.message.includes('fetch')) {
      showError('Network error. Please check your connection.', 'network');
      return;
    }

    // Handle authentication errors
    if (error.message && error.message.includes('Authentication failed')) {
      showError('Your session has expired. Please log in again.', 'auth');
      logout(); // Auto logout on auth errors
      return;
    }

    // Handle specific status codes
    if (error.status) {
      switch (error.status) {
        case 401:
          showError('Authentication required. Please log in.', 'auth');
          logout();
          break;
        case 403:
          showError('Access denied. You don\'t have permission for this action.', 'auth');
          break;
        case 422:
          showError('Invalid data provided. Please check your input.', 'validation');
          break;
        case 500:
          showError('Server error. Please try again later.', 'server');
          break;
        default:
          showError('An unexpected error occurred.', 'unknown');
      }
      return;
    }

    // Default error handling
    showError(error.message || 'An unexpected error occurred.', 'unknown');
  }, [showError, logout]);

  return {
    ...errorState,
    showError,
    clearError,
    handleApiError,
  };
};



