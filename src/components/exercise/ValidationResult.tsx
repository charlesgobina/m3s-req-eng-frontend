import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ValidationResult: React.FC = () => {
  const { validationResult } = useChat();
  
  if (!validationResult) return null;
  
  const isPassed = validationResult.passed;
  
  return (
    <motion.div 
      className="p-3 border-t border-slate-200 bg-slate-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100 
      }}
    >
      <motion.div
        className={`p-3 rounded-lg border-2 ${
          isPassed
            ? 'border-green-200 bg-green-50'
            : 'border-red-200 bg-red-50'
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-slate-800 text-sm">
            Validation Result
          </h4>
          <motion.div
            className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPassed
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ 
              duration: 0.3, 
              delay: 0.2,
              type: "spring",
              stiffness: 150 
            }}
          >
            {isPassed ? (
              <CheckCircle size={10} className="mr-1" />
            ) : (
              <AlertCircle size={10} className="mr-1" />
            )}
            {validationResult.score}/100
          </motion.div>
        </div>

        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h5 className="text-xs font-semibold text-slate-700 mb-1">
              Feedback:
            </h5>
            <p className="text-xs text-slate-600">
              {validationResult.feedback}
            </p>
          </motion.div>

          {validationResult.recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <h5 className="text-xs font-semibold text-slate-700 mb-1">
                Recommendations:
              </h5>
              <p className="text-xs text-slate-600">
                {validationResult.recommendations}
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ValidationResult;