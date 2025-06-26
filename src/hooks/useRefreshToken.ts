
import { useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useRefreshToken = () => {
  const { refreshAuth, isAuthenticated } = useAuth();

  const refreshToken = useCallback(async () => {
    if (isAuthenticated) {
      await refreshAuth();
    }
  }, [refreshAuth, isAuthenticated]);

  // Auto-refresh token every 30 minutes if authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshToken]);

  return { refreshToken };
};