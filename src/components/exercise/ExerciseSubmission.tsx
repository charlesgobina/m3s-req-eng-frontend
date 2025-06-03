import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTask } from '../../context/TaskContext';
import ValidationResult from './ValidationResult';

const ExerciseSubmission: React.FC = () => {
  const { 
    submission, 
    setSubmission, 
    validateSubmission, 
    isValidating, 
    handleKeyPress,
    validationResult
  } = useChat();
  
  const { selectedTask } = useTask();

  return (
    <motion.div 
      className="w-1/4 bg-white shadow-xl border-l border-slate-200 flex flex-col"
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <CheckCircle className="mr-2" size={20} />
          Exercise
        </h2>
        <p className="text-purple-100 text-sm mt-1">Submit your work</p>
      </div>

      {selectedTask && (
        <motion.div 
          className="p-4 bg-slate-50 border-b border-slate-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h3 className="font-semibold text-slate-800 mb-2">
            {selectedTask.name}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            {selectedTask.objective}
          </p>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Expected Outcomes:
            </h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {selectedTask.expectedOutcomes?.map((outcome, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.5 + (index * 0.1) }}
                >
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  {outcome}
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col p-4">
        <motion.textarea
          value={submission}
          onChange={(e) => setSubmission(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, true)}
          placeholder={
            selectedTask
              ? "Write your solution here..."
              : "Select a task to begin"
          }
          className="flex-1 p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
          disabled={!selectedTask}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        />

        <motion.button
          onClick={validateSubmission}
          disabled={!submission.trim() || !selectedTask || isValidating}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          {isValidating ? (
            <>
              <Loader2 size={18} className="animate-spin mr-2" />
              Validating...
            </>
          ) : (
            <>
              <CheckCircle size={18} className="mr-2" />
              Submit & Validate
            </>
          )}
        </motion.button>
      </div>

      {validationResult && <ValidationResult />}
    </motion.div>
  );
};

export default ExerciseSubmission;