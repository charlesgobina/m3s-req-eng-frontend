import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing session on app load
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (storedUser && token) {
        try {
          const user = JSON.parse(storedUser);
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Dummy validation - in real app, this would be an API call
      if (credentials.email && credentials.password.length >= 6) {
        const user: User = {
          id: `user_${Date.now()}`,
          firstName: credentials.email.split('@')[0].split('.')[0] || 'John',
          lastName: credentials.email.split('@')[0].split('.')[1] || 'Doe',
          email: credentials.email,
          role: credentials.email.includes('lecturer') ? 'lecturer' : 'student',
        };

        // Store in localStorage (in real app, you'd store JWT token)
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('authToken', `token_${Date.now()}`);

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: 'Invalid email or password. Password must be at least 6 characters.' 
        };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Dummy validation
      if (data.password !== data.confirmPassword) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Passwords do not match.' };
      }

      if (data.password.length < 6) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Password must be at least 6 characters long.' };
      }

      if (!data.firstName.trim() || !data.lastName.trim()) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'First name and last name are required.' };
      }

      const user: User = {
        id: `user_${Date.now()}`,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email,
        role: data.role,
      };

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', `token_${Date.now()}`);

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};