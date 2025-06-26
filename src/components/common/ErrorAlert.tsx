import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Wifi, Shield, AlertCircle, Server } from 'lucide-react';

interface ErrorAlertProps {
  error: string | null;
  errorType: 'network' | 'auth' | 'validation' | 'server' | 'unknown';
  isVisible: boolean;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, errorType, isVisible, onClose }) => {
  const getErrorIcon = () => {
    switch (errorType) {
      case 'network':
        return <Wifi className="w-5 h-5" />;
      case 'auth':
        return <Shield className="w-5 h-5" />;
      case 'validation':
        return <AlertCircle className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    switch (errorType) {
      case 'network':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'auth':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'validation':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'server':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && error && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
          <div className={`border rounded-lg p-4 shadow-lg ${getErrorColor()}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getErrorIcon()}
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorAlert;