// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useErrorHandler } from './useErrorHandler';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiFunction: (...args: any[]) => Promise<any>
): UseApiReturn<T> => {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const { handleApiError } = useErrorHandler();

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiFunction(...args);

      if (response.success) {
        setState({
          data: response.data,
          isLoading: false,
          error: null,
        });
        return response.data;
      } else {
        const errorMessage = response.error || 'Operation failed';
        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
        });
        handleApiError({ message: errorMessage });
        return null;
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Network error occurred';
      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });
      handleApiError(error);
      return null;
    }
  }, [apiFunction, handleApiError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return { ...state, execute, reset };
};

// Specific hooks for authentication operations
export const useLogin = () => {
  return useApi(apiService.login.bind(apiService));
};

export const useSignup = () => {
  return useApi(apiService.signup.bind(apiService));
};

export const useProfile = () => {
  return useApi(apiService.getProfile.bind(apiService));
};




