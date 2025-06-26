
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'student' | 'lecturer';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isReqLoading: boolean; // Indicates if a request is currently being processed

}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'lecturer';
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  customToken?: string;
  error?: string;
}