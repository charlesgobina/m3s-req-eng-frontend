import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';
import { apiService } from '../services/apiService';
import { signInWithCustomToken, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthStore extends AuthState {
  // Actions
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  verifyToken: () => Promise<boolean>;
  initialize: () => void;
  cleanup: () => void;
  
  // Internal state setters
  setAuthState: (state: Partial<AuthState>) => void;
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setReqLoading: (isReqLoading: boolean) => void;
}

let firebaseUnsubscribe: (() => void) | null = null;

export const useAuthStore = create<AuthStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isReqLoading: false,

    // State setters
    setAuthState: (newState) => set((state) => ({ ...state, ...newState })),
    setUser: (user) => set({ user }),
    setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setLoading: (isLoading) => set({ isLoading }),
    setReqLoading: (isReqLoading) => set({ isReqLoading }),

    // Initialize auth state and Firebase listener
    initialize: () => {
      const { verifyToken } = get();
      
      // Set up Firebase auth state listener for automatic token refresh
      firebaseUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                isReqLoading: false,
              });
            } else {
              // If no user data, verify with backend
              await verifyToken();
            }
          } catch (error) {
            console.error('Error refreshing token:', error);
            // If token refresh fails, clear auth state
            apiService.clearAuth();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isReqLoading: false,
            });
          }
        } else {
          // User is signed out of Firebase
          console.log('Firebase user signed out');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isReqLoading: false,
          });
        }
      });

      // Initial auth verification
      verifyToken();
    },

    // Cleanup Firebase listener
    cleanup: () => {
      if (firebaseUnsubscribe) {
        firebaseUnsubscribe();
        firebaseUnsubscribe = null;
      }
    },

    // Function to verify token and get user data
    verifyToken: async (): Promise<boolean> => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        set({
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
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            isReqLoading: false,
          });
          return true;
        } else {
          // Token is invalid or expired
          apiService.clearAuth();
          set({
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
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isReqLoading: false,
        });
        return false;
      }
    },

    login: async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      try {
        // Don't set loading state to true for login attempts to prevent component unmounting
        set({ isReqLoading: true });
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

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              isReqLoading: false,
            });

            console.log('Auth state updated, returning success');
            return { success: true };
          } catch (firebaseError) {
            console.error('Firebase authentication error:', firebaseError);
            set({ isReqLoading: false });
            return {
              success: false,
              error: 'Failed to authenticate with Firebase. Please try again.'
            };
          }
        } else {
          console.log('Login failed:', response.error);
          // Don't change loading state on failure to prevent component remount
          set({ isReqLoading: false });
          return { 
            success: false, 
            error: response.error || 'Login failed. Please try again.' 
          };
        }
      } catch (error) {
        console.error('Login error:', error);
        set({ isReqLoading: false });
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        };
      }
    },

    signup: async (data: SignupData): Promise<{ success: boolean; error?: string }> => {
      try {
        set({ isLoading: true });

        const response = await apiService.signup(data);

        if (response.success && response.data) {
          // Don't store token or authenticate user immediately
          // User will need to login after successful signup
          set({ isLoading: false });

          return { success: true };
        } else {
          set({ isLoading: false });
          return { 
            success: false, 
            error: response.error || 'Signup failed. Please try again.' 
          };
        }
      } catch (error) {
        console.error('Signup error:', error);
        set({ isLoading: false });
        return { 
          success: false, 
          error: 'Network error. Please check your connection and try again.' 
        };
      }
    },

    logout: async () => {
      try {
        // Sign out of Firebase (this will trigger the auth state listener)
        await signOut(auth);
        console.log('Signed out of Firebase');
      } catch (error) {
        console.error('Error signing out:', error);
      }
      
      // Clear local storage and auth state
      apiService.clearAuth();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isReqLoading: false,
      });
    },

    refreshAuth: async (): Promise<void> => {
      const { verifyToken } = get();
      set({ isLoading: true });
      
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          // Force refresh the ID token
          const idToken = await currentUser.getIdToken(true);
          localStorage.setItem('authToken', idToken);
          console.log('Token manually refreshed');
        }
        await verifyToken();
      } catch (error) {
        console.error('Error refreshing auth:', error);
        await verifyToken();
      }
    },
  }))
);

// Initialize auth on store creation
useAuthStore.getState().initialize();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useAuthStore.getState().cleanup();
  });
}