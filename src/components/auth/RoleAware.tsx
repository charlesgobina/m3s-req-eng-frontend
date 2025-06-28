// src/components/auth/RoleAware.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface RoleAwareProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'lecturer'>;
  fallback?: React.ReactNode;
  className?: string;
}

const RoleAware: React.FC<RoleAwareProps> = ({ 
  children, 
  allowedRoles = [], 
  fallback,
  className = ''
}) => {
  const { user, isAuthenticated } = useAuthStore();

  // If no roles specified, allow all authenticated users
  if (allowedRoles.length === 0) {
    return isAuthenticated ? <div className={className}>{children}</div> : null;
  }

  // Check if user has required role
  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    if (fallback) {
      return <div className={className}>{fallback}</div>;
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-yellow-800 font-medium">Access Restricted</p>
            <p className="text-yellow-700 text-sm">
              This feature is only available to: {allowedRoles.join(', ')}
            </p>
            {user && (
              <p className="text-yellow-600 text-xs mt-1">
                Your role: {user.role}
              </p>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return <div className={className}>{children}</div>;
};

export default RoleAware;

