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
      className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between touch-manipulation"
      whileTap={{ scale: 0.98 }}
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

const TaskInfo = memo(({ task, subtask }: { task: any; subtask: any }) => {
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

      <div className="bg-white rounded-lg p-3 border border-slate-200">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-slate-800 text-sm flex-1 pr-2">
            {subtask.name}
          </h4>
          <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getDifficultyColor(subtask.difficulty)}`}>
            {subtask.difficulty}
          </span>
        </div>
        
        <p className="text-xs text-slate-600 mb-3">
          {subtask.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
          <div className="flex items-center text-slate-500">
            <Clock size={10} className="mr-1 flex-shrink-0" />
            <span className="truncate">{subtask.estimatedTime}</span>
          </div>
          <div className="flex items-center text-slate-500">
            <User size={10} className="mr-1 flex-shrink-0" />
            <span className="truncate">{subtask.primaryAgent}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center mb-1">
            <Target size={12} className="mr-1 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Objective:</span>
          </div>
          <p className="text-xs text-slate-600 ml-4">
            {subtask.objective}
          </p>
        </div>

        <div className="space-y-2">
          <div>
            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Expected Outcomes:
            </h5>
            <ul className="text-xs text-slate-600 space-y-1">
              {subtask.expectedOutcomes?.map((outcome: string, index: number) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.5 + (index * 0.1) }}
                >
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  <span className="break-words">{outcome}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
              Deliverables:
            </h5>
            <ul className="text-xs text-slate-600 space-y-1">
              {subtask.deliverables?.map((deliverable: string, index: number) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.6 + (index * 0.1) }}
                >
                  <Award size={10} className="mt-1 mr-2 flex-shrink-0 text-purple-500" />
                  <span className="break-words">{deliverable}</span>
                </motion.li>
              ))}
            </ul>
          </div>
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
  
  const { selectedTask, selectedSubtask, navigateToNext } = useTask();

  if (!selectedTask || !selectedSubtask) {
    return null;
  }

  return (
    <>
      <TaskInfo task={selectedTask} subtask={selectedSubtask} />
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