import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Target, Clock, User, Award, ArrowRight } from 'lucide-react';
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
  
  const { selectedTask, selectedSubtask, navigateToNext } = useTask();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleNextClick = () => {
    navigateToNext();
  };

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

      {selectedTask && selectedSubtask && (
        <motion.div 
          className="p-4 bg-slate-50 border-b border-slate-200"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="mb-3">
            <h3 className="font-semibold text-slate-800 mb-1">
              {selectedTask.name}
            </h3>
            <p className="text-xs text-slate-600 mb-2">
              {selectedTask.phase}
            </p>
          </div>

          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-slate-800 text-sm">
                {selectedSubtask.name}
              </h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(selectedSubtask.difficulty)}`}>
                {selectedSubtask.difficulty}
              </span>
            </div>
            
            <p className="text-xs text-slate-600 mb-3">
              {selectedSubtask.description}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div className="flex items-center text-slate-500">
                <Clock size={10} className="mr-1" />
                {selectedSubtask.estimatedTime}
              </div>
              <div className="flex items-center text-slate-500">
                <User size={10} className="mr-1" />
                {selectedSubtask.primaryAgent}
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center mb-1">
                <Target size={12} className="mr-1 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Objective:</span>
              </div>
              <p className="text-xs text-slate-600 ml-4">
                {selectedSubtask.objective}
              </p>
            </div>

            <div className="space-y-2">
              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Expected Outcomes:
                </h5>
                <ul className="text-xs text-slate-600 space-y-1">
                  {selectedSubtask.expectedOutcomes?.map((outcome, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.5 + (index * 0.1) }}
                    >
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                      {outcome}
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Deliverables:
                </h5>
                <ul className="text-xs text-slate-600 space-y-1">
                  {selectedSubtask.deliverables?.map((deliverable, index) => (
                    <motion.li 
                      key={index} 
                      className="flex items-start"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.6 + (index * 0.1) }}
                    >
                      <Award size={10} className="mt-1 mr-2 flex-shrink-0 text-purple-500" />
                      {deliverable}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {selectedTask?.name?.toLowerCase() !== 'home' && (
        <div className="flex-1 flex flex-col p-4">
          <motion.textarea
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, true)}
            placeholder={
              selectedSubtask
                ? "Write your solution here..."
                : "Select a subtask to begin"
            }
            className="flex-1 p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
            disabled={!selectedSubtask}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          />

          <div className="mt-4 space-y-3">
            <motion.button
              onClick={validateSubmission}
              disabled={!submission.trim() || !selectedSubtask || isValidating}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm"
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

            {validationResult && validationResult.passed && (
              <motion.button
                onClick={handleNextClick}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center shadow-sm"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Next Task
                <ArrowRight size={18} className="ml-2" />
              </motion.button>
            )}
          </div>
        </div>
      )}

      {validationResult && <ValidationResult />}
    </motion.div>
  );
};

export default ExerciseSubmission;