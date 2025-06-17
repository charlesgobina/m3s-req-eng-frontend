import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Target, Clock, User, Award, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTask } from '../../context/TaskContext';
import ValidationResult from './ValidationResult';

// Memoized components to prevent unnecessary re-renders
const MobileExercisePanel = memo(({ isExpanded, setIsExpanded, children }: { 
  isExpanded: boolean; 
  setIsExpanded: (expanded: boolean) => void;
  children: React.ReactNode;
}) => (
  <div className="lg:hidden">
    <motion.button
      onClick={() => setIsExpanded(!isExpanded)}
      className="max-w-md p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between touch-manipulation rounded-2xl shadow-lg mb-2"
      whileTap={{ scale: 0.98 }}
      style={{ boxShadow: '0 8px 32px rgba(80,0,120,0.18)' }}
    >
      <div className="flex items-center">
      <CheckCircle className="mr-2" size={20} />
      <span className="font-bold">Exercise</span>
      </div>
      {isExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
    </motion.button>

    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border-t border-slate-200 overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const DesktopExercisePanel = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div 
    className="hidden lg:flex w-full bg-white shadow-xl border-l border-slate-200 flex-col h-full"
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.3 }}
  >
    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
      <h2 className="text-xl font-bold flex items-center">
        <CheckCircle className="mr-2" size={20} />
        Exercise
      </h2>
      <p className="text-purple-100 text-sm mt-1">Submit your work</p>
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </motion.div>
));

const TaskInfo = memo(({ task, subtask, step }: { task: any; subtask: any; step: any }) => {
  if (!task || !subtask || !step) return null;

  return (
    <motion.div 
      className="p-4 bg-slate-50 border-b border-slate-200"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <div className="mb-3">
        <h3 className="font-semibold text-slate-800 mb-1 text-sm lg:text-base">
          {task.name}
        </h3>
        <p className="text-xs text-slate-600 mb-2">
          {task.phase}
        </p>
      </div>
      
      <div className="mt-3">
        <h4 className="text-xs font-medium text-slate-700 uppercase tracking-wide mb-2">
          Steps:
        </h4>
        <div className="space-y-2">
          {subtask.steps.map((stepItem: any) => (
            <div 
              key={stepItem.id}
              className={`p-2 rounded-md text-sm ${stepItem.id === step.id 
                ? 'bg-purple-100 border-l-4 border-purple-500' 
                : 'bg-white border-l-4 border-transparent'}`}
            >
              <div className="flex items-center">
                {stepItem.isCompleted && (
                  <CheckCircle size={14} className="text-green-500 mr-2 flex-shrink-0" />
                )}
                <span className={`${stepItem.id === step.id ? 'font-medium' : ''}`}>
                  {stepItem.step}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

const SubmissionArea = memo(({ 
  submission, 
  setSubmission, 
  handleKeyPress, 
  validateSubmission, 
  isValidating, 
  validationResult, 
  handleNextClick 
}: {
  submission: string;
  setSubmission: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent, isSubmission?: boolean) => void;
  validateSubmission: () => void;
  isValidating: boolean;
  validationResult: any;
  handleNextClick: () => void;
}) => (
  <div className="flex-1 flex flex-col p-4 min-h-0">
    <motion.textarea
      value={submission}
      onChange={(e) => setSubmission(e.target.value)}
      onKeyPress={(e) => handleKeyPress(e, true)}
      placeholder="Write your solution here..."
      className="flex-1 min-h-[120px] lg:min-h-[200px] p-3 lg:p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm lg:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    />

    <div className="mt-4 space-y-3 flex-shrink-0">
      <motion.button
        onClick={validateSubmission}
        disabled={!submission.trim() || isValidating}
        className="w-full px-4 lg:px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm touch-manipulation text-sm lg:text-base"
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
          className="w-full px-4 lg:px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center shadow-sm touch-manipulation text-sm lg:text-base"
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
));

const ExerciseContent = memo(() => {
  const { 
    submission, 
    setSubmission, 
    validateSubmission, 
    isValidating, 
    handleKeyPress,
    validationResult
  } = useChat();
  
  const { selectedTask, selectedSubtask, selectedStep, navigateToNext } = useTask();

  if (!selectedTask || !selectedSubtask || !selectedStep) {
    return null;
  }

  return (
    <>
      <TaskInfo task={selectedTask} subtask={selectedSubtask} step={selectedStep} />
      {selectedTask.name.toLowerCase() !== 'home' && (
        <SubmissionArea
          submission={submission}
          setSubmission={setSubmission}
          handleKeyPress={handleKeyPress}
          validateSubmission={validateSubmission}
          isValidating={isValidating}
          validationResult={validationResult}
          handleNextClick={navigateToNext}
        />
      )}
      {validationResult && <ValidationResult />}
    </>
  );
});

const ExerciseSubmission: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <MobileExercisePanel isExpanded={isExpanded} setIsExpanded={setIsExpanded}>
        <ExerciseContent />
      </MobileExercisePanel>
      <DesktopExercisePanel>
        <ExerciseContent />
      </DesktopExercisePanel>
    </>
  );
};

export default ExerciseSubmission;