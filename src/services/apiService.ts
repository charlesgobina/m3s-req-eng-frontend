import { LoginCredentials, SignupData, User } from '../types/auth';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface LoginResponse {
  customToken: string;
  user: User;
  message: string;
}

interface SignupResponse {
  customToken: string;
  user: User;
  message: string;
}

interface VerifyTokenResponse {
  user: User;
}

export class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Helper method to make authenticated requests
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuthClear: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('authToken');
      
      const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        defaultHeaders.Authorization = `Bearer ${token}`;
      }

      const finalHeaders = {
        ...defaultHeaders,
        ...options.headers,
      };

      // Debug logging for validation requests
      if (endpoint.includes('/validation/')) {
        console.log('ApiService making validation request:', {
          endpoint,
          hasToken: !!token,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
          headers: finalHeaders
        });
      }
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: finalHeaders,
      });

      // Handle different response types
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        
        // Handle specific error cases
        if (response.status === 401 && !skipAuthClear) {
          console.log('401 Unauthorized - clearing auth data');
          // Token expired or invalid - clear local storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          return {
            success: false,
            error: data.error || 'Authentication failed. Please log in again.',
          };
        } else if (response.status === 401 && skipAuthClear) {
          return {
            success: false,
            error: data.error || 'Request failed - please check your permissions.',
          };
        }

        if (response.status === 403) {
          return {
            success: false,
            error: data.error || 'Access denied. Insufficient permissions.',
          };
        }

        if (response.status >= 500) {
          return {
            success: false,
            error: 'Server error. Please try again later.',
          };
        }

        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'Network error. Please check your connection and try again.',
        };
      }

      return {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(data: SignupData): Promise<ApiResponse<SignupResponse>> {
    return this.makeRequest<SignupResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyToken(): Promise<ApiResponse<VerifyTokenResponse>> {
    return this.makeRequest<VerifyTokenResponse>('/api/auth/verify-token', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/api/auth/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Generic method for making authenticated requests to other endpoints
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuthClear: boolean = false
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, options, skipAuthClear);
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Helper method to get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
      return null;
    }
  }

  // Helper method to clear authentication data
  clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Create singleton instance
export const apiService = new ApiService();