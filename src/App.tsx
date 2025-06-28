// src/App.tsx - Enhanced with React Router for better auth navigation
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { ProjectContextProvider } from './context/ProjectContext';
import MainLayout from './components/layout/MainLayout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import ConnectionStatus from './components/auth/ConnectionStatus';
import LoginPage from './components/auth/LoginForm';
import SignupPage from './components/auth/SignupForm';
import LecturerDashboard from './components/lecturer/LecturerDashboard';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-slate-600 font-medium">Verifying authentication...</p>
      <div className="mt-4">
        <ConnectionStatus />
      </div>
    </motion.div>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'lecturer') {
      return <Navigate to="/lecturer/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Public Route Wrapper (redirects if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && user) {
    // Redirect based on user role
    if (user.role === 'lecturer') {
      return <Navigate to="/lecturer/dashboard" replace />;
    } else {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

// Role-based redirect component
const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuthStore();
  
  if (user?.role === 'lecturer') {
    return <Navigate to="/lecturer/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

// Main App Content with your existing layout
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes - Auth Pages */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />

      {/* Lecturer Routes */}
      <Route 
        path="/lecturer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['lecturer']}>
            <LecturerDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Student Routes - Your Main App */}
      <Route 
        path="/student/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <ProjectContextProvider>
              <MainLayout />
            </ProjectContextProvider>
          </ProtectedRoute>
        } 
      />

      {/* Default redirect route */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to appropriate dashboard */}
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

// Root App Component
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;