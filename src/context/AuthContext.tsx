// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';
import { apiService } from '../services/apiService';
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isReqLoading: false,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isReqLoading: false,
  });

  // Function to verify token and get user data
  const verifyAuthToken = async (): Promise<boolean> => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isReqLoading: false,
      });
      return false;
    }

    try {
      const response = await apiService.verifyToken();
      
      if (response.success && response.data) {
        const user = response.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isReqLoading: false,
        });
        return true;
      } else {
        // Token is invalid or expired
        apiService.clearAuth();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isReqLoading: false,
        });
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      apiService.clearAuth();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isReqLoading: false,
      });
      return false;
    }
  };

  // Check authentication status on app load and set up Firebase auth listener
  useEffect(() => {
    // Set up Firebase auth state listener for automatic token refresh
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get fresh ID token (Firebase automatically handles refresh)
          const idToken = await firebaseUser.getIdToken(true); // true forces refresh
          console.log('Firebase auth state changed - token refreshed');
          
          // Update stored token
          localStorage.setItem('authToken', idToken);
          
          // Verify user data is still in localStorage
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              isReqLoading: false,
            });
          } else {
            // If no user data, verify with backend
            await verifyAuthToken();
          }
        } catch (error) {
          console.error('Error refreshing token:', error);
          // If token refresh fails, clear auth state
          apiService.clearAuth();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isReqLoading: false,
          });
        }
      } else {
        // User is signed out of Firebase
        console.log('Firebase user signed out');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isReqLoading: false,
        });
      }
    });

    // Initial auth verification
    verifyAuthToken();

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    try {
      // Don't set loading state to true for login attempts to prevent component unmounting
      setAuthState(prev => ({ ...prev, isReqLoading: true }));
      console.log('Calling apiService.login...');
      const response = await apiService.login(credentials);
      console.log('API response:', response);

      if (response.success && response.data) {
        const { customToken, user } = response.data;
        console.log('Login successful, received custom token:', { 
          token: customToken ? 'present' : 'missing', 
          tokenValue: customToken ? `${customToken.substring(0, 20)}...` : 'null',
          user 
        });
        
        try {
          // Exchange custom token for Firebase ID token
          console.log('Exchanging custom token for ID token...');
          const userCredential = await signInWithCustomToken(auth, customToken);
          const idToken = await userCredential.user.getIdToken();
          
          console.log('ID token obtained:', idToken ? `${idToken.substring(0, 20)}...` : 'null');
          
          // Store the ID token (not the custom token)
          localStorage.setItem('authToken', idToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          // Verify token was stored
          const storedToken = localStorage.getItem('authToken');
          console.log('ID token stored successfully:', !!storedToken);
          console.log('Stored ID token value:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isReqLoading: false,
          });

          console.log('Auth state updated, returning success');
          return { success: true };
        } catch (firebaseError) {
          console.error('Firebase authentication error:', firebaseError);
          return {
            success: false,
            error: 'Failed to authenticate with Firebase. Please try again.'
          };
        }
      } else {
        console.log('Login failed:', response.error);
        // Don't change loading state on failure to prevent component remount
        setAuthState(prev => ({ ...prev, isReqLoading: false }));
        return { 
          success: false, 
          error: response.error || 'Login failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Don't change loading state on error to prevent component remount
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const signup = async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const response = await apiService.signup(data);

      if (response.success && response.data) {
        const { customToken, user } = response.data;
        
        // Store token and user data
        localStorage.setItem('authToken', customToken);
        localStorage.setItem('user', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isReqLoading: false,
        });

        return { success: true };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: response.error || 'Signup failed. Please try again.' 
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      // Sign out of Firebase (this will trigger the auth state listener)
      await signOut(auth);
      console.log('Signed out of Firebase');
    } catch (error) {
      console.error('Error signing out:', error);
    }
    
    // Clear local storage and auth state
    apiService.clearAuth();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isReqLoading: false,
    });
  };

  const refreshAuth = async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Force refresh the ID token
        const idToken = await currentUser.getIdToken(true);
        localStorage.setItem('authToken', idToken);
        console.log('Token manually refreshed');
      }
      await verifyAuthToken();
    } catch (error) {
      console.error('Error refreshing auth:', error);
      await verifyAuthToken();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        signup,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};