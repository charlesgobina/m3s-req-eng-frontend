// src/hooks/useAuthenticatedApi.ts
import { useCallback } from 'react';
import { apiService } from '../services/apiService';
import { useAuth } from '../context/AuthContext';
import { useErrorHandler } from './useErrorHandler';

interface UseAuthenticatedApiOptions {
  requireAuth?: boolean;
  onUnauthorized?: () => void;
}

export const useAuthenticatedApi = (options: UseAuthenticatedApiOptions = {}) => {
  const { isAuthenticated, logout } = useAuth();
  const { handleApiError, showError } = useErrorHandler();

  const makeRequest = useCallback(async <T>(
    endpoint: string,
    requestOptions: RequestInit = {}
  ): Promise<T | null> => {
    // Check authentication if required
    if (options.requireAuth !== false && !isAuthenticated) {
      showError('Authentication required', 'auth');
      options.onUnauthorized?.();
      return null;
    }

    try {
      const response = await apiService.authenticatedRequest<T>(endpoint, requestOptions);

      if (response.success) {
        return response.data || null;
      } else {
        // Handle specific error cases
        if (response.error?.includes('Authentication failed') || 
            response.error?.includes('Invalid or expired token')) {
          logout();
          showError('Session expired. Please log in again.', 'auth');
        } else {
          handleApiError({ message: response.error });
        }
        return null;
      }
    } catch (error: any) {
      handleApiError(error);
      return null;
    }
  }, [isAuthenticated, options, handleApiError, showError, logout]);

  return { makeRequest };
};