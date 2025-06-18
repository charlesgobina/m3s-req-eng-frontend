import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Award, TrendingUp } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const ValidationResult: React.FC = () => {
  const { validationResult } = useChat();
  
  if (!validationResult) return null;
  
  const isPassed = validationResult.passed;
  
  return (
    <motion.div 
      className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 100 
      }}
    >
      <motion.div
        className={`rounded-2xl border-2 overflow-hidden shadow-lg ${
          isPassed
            ? 'border-green-200 bg-gradient-to-br from-green-50 to-emerald-50'
            : 'border-red-200 bg-gradient-to-br from-red-50 to-rose-50'
        }`}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        {/* Header */}
        <div className={`p-6 ${
          isPassed 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-rose-600'
        } text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                {isPassed ? (
                  <CheckCircle size={24} />
                ) : (
                  <AlertCircle size={24} />
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold">Validation Result</h4>
                <p className="text-white/80 text-sm">
                  {isPassed ? 'Congratulations! You passed.' : 'Keep trying, you\'re learning!'}
                </p>
              </div>
            </div>
            <motion.div
              className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.2,
                type: "spring",
                stiffness: 150 
              }}
            >
              <Award size={20} className="mr-2" />
              <span className="text-xl font-bold">{validationResult.score}/100</span>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center mb-3">
              <TrendingUp size={20} className="text-slate-600 mr-2" />
              <h5 className="font-semibold text-slate-800">Detailed Feedback</h5>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {validationResult.feedback}
            </p>
          </motion.div>

          {validationResult.recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className={`rounded-xl p-5 border-2 ${
                isPassed 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                  isPassed 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-amber-500 text-white'
                }`}>
                  💡
                </div>
                <h5 className="font-semibold text-slate-800">
                  {isPassed ? 'Next Steps' : 'Recommendations for Improvement'}
                </h5>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {validationResult.recommendations}
              </p>
            </motion.div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      </motion.div>
    </motion.div>
  );
};

export default ValidationResult;