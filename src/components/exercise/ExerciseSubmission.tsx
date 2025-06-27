import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Target, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTaskStore } from '../../stores/taskStore';
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
      className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between touch-manipulation rounded-xl mb-3"
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center">
        <CheckCircle className="mr-2" size={18} />
        <span className="font-semibold text-sm">Exercise</span>
      </div>
      {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
    </motion.button>

    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 overflow-hidden rounded-xl"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const DesktopExercisePanel = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div 
    className="hidden lg:flex flex-1 bg-white border-l border-slate-200 flex-col h-full"
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.3 }}
  >
    <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
      <h2 className="text-lg font-bold flex items-center">
        <Target className="mr-2" size={18} />
        Exercise Steps
      </h2>
      <p className="text-purple-100 text-xs mt-1">Complete each step to progress</p>
    </div>
    <div className="flex-1 overflow-y-auto">
      {children}
    </div>
  </motion.div>
));

const StepNavigation = memo(({ 
  steps, 
  currentStepIndex, 
  onStepChange 
}: { 
  steps: any[]; 
  currentStepIndex: number; 
  onStepChange: (index: number) => void;
}) => {
  const { isStepAccessible, getStepStatus } = useTaskStore();
  
  if (steps.length <= 1) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 border-b border-slate-200">
      <button
        onClick={() => {
          const prevIndex = Math.max(0, currentStepIndex - 1);
          if (prevIndex >= 0 && isStepAccessible(steps[prevIndex].id)) {
            onStepChange(prevIndex);
          }
        }}
        disabled={currentStepIndex === 0 || !isStepAccessible(steps[Math.max(0, currentStepIndex - 1)]?.id)}
        className="flex items-center px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} className="mr-1" />
        Previous
      </button>

      <div className="flex items-center space-x-1">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const accessible = isStepAccessible(step.id);
          
          return (
            <button
              key={step.id}
              onClick={() => accessible ? onStepChange(index) : null}
              disabled={!accessible}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                stepStatus === 'current'
                  ? 'bg-purple-600 text-white'
                  : stepStatus === 'completed'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              {stepStatus === 'completed' ? (
                <CheckCircle size={12} />
              ) : (
                index + 1
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => {
          const nextIndex = Math.min(steps.length - 1, currentStepIndex + 1);
          if (nextIndex < steps.length && isStepAccessible(steps[nextIndex].id)) {
            onStepChange(nextIndex);
          }
        }}
        disabled={currentStepIndex === steps.length - 1 || !isStepAccessible(steps[Math.min(steps.length - 1, currentStepIndex + 1)]?.id)}
        className="flex items-center px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight size={14} className="ml-1" />
      </button>
    </div>
  );
});

const StepCard = memo(({ 
  step, 
  stepIndex, 
  totalSteps,
  submission,
  setSubmission,
  handleKeyPress,
  validateSubmission,
  isValidating,
  validationResult,
  handleNextClick
}: {
  step: any;
  stepIndex: number;
  totalSteps: number;
  submission: string;
  setSubmission: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent, isSubmission?: boolean) => void;
  validateSubmission: () => void;
  isValidating: boolean;
  validationResult: any;
  handleNextClick: () => void;
}) => {
  const { getStepStatus, isStepAccessible } = useTaskStore();
  const stepStatus = getStepStatus(step.id);
  const accessible = isStepAccessible(step.id);
  const isCompleted = step.isCompleted;
  const hasValidResponse = step.studentResponse && step.studentResponse.trim();

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full"
    >
      {/* Main Step Card */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`rounded-lg border p-4 mb-4 ${
          stepStatus === 'completed'
            ? 'bg-green-50 border-green-200' 
            : stepStatus === 'current'
            ? 'bg-purple-50 border-purple-200'
            : 'bg-slate-100 border-slate-300 opacity-75'
        }`}>
          {/* Step Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                stepStatus === 'completed'
                  ? 'bg-green-500 text-white' 
                  : stepStatus === 'current'
                  ? 'bg-purple-500 text-white'
                  : 'bg-slate-400 text-white'
              }`}>
                {stepStatus === 'completed' ? (
                  <CheckCircle size={16} />
                ) : (
                  <span className="font-bold text-sm">{stepIndex + 1}</span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 text-sm">
                  Step {stepIndex + 1} of {totalSteps}
                </h3>
                <p className="text-xs text-slate-600">
                  {isCompleted ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
            {isCompleted && (
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                ✓ Passed
              </div>
            )}
          </div>

          {/* Objective */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Target size={14} className="text-slate-600 mr-2" />
              <h4 className="font-medium text-slate-800 text-sm">Objective</h4>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed pl-5">{step.objective}</p>
          </div>

          {/* Task Description */}
          <div className="mb-4">
            <h4 className="font-medium text-slate-800 mb-2 text-sm">Task Description</h4>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-slate-700 text-sm leading-relaxed">{step.step}</p>
            </div>
          </div>

          {/* Previous Response (if completed) */}
          {isCompleted && hasValidResponse && (
            <div className="mb-4">
              <h4 className="font-medium text-green-700 mb-2 text-sm">✓ Your Successful Response</h4>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-slate-700 whitespace-pre-wrap">{step.studentResponse}</p>
              </div>
            </div>
          )}

          {/* Current Response Area */}
          {!isCompleted && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2 text-sm">Your Response</h4>
              {stepStatus === 'locked' ? (
                <div className="w-full min-h-[120px] p-3 border border-slate-300 rounded-lg bg-slate-100 flex items-center justify-center">
                  <p className="text-slate-500 text-sm">Complete previous steps to unlock this step</p>
                </div>
              ) : (
                <textarea
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, true)}
                  placeholder="Write your solution here..."
                  className="w-full min-h-[120px] p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        {!isCompleted ? (
          <motion.button
            onClick={validateSubmission}
            disabled={!submission.trim() || isValidating || stepStatus === 'locked'}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {stepStatus === 'locked' ? (
              <>
                🔒 Step Locked
              </>
            ) : isValidating ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Validating...
              </>
            ) : (
              <>
                <CheckCircle size={16} className="mr-2" />
                Submit & Validate
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleNextClick}
            className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center font-medium text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Next
            <ArrowRight size={16} className="ml-2" />
          </motion.button>
        )}
      </div>

      {/* Validation Result */}
      {validationResult && <ValidationResult />}
    </motion.div>
  );
});

const ExerciseContent = memo(() => {
  const { 
    submission, 
    setSubmission, 
    validateSubmission, 
    isValidating, 
    handleKeyPress,
    validationResult,
    setValidationResult
  } = useChat();
  
  const { selectedTask, selectedSubtask, selectedStep, navigateToNext, setSelectedStep, isStepAccessible, tasks } = useTaskStore();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Update current step index when selectedStep changes
  React.useEffect(() => {
    if (selectedSubtask && selectedStep) {
      const stepIndex = selectedSubtask.steps.findIndex(step => step.id === selectedStep.id);
      if (stepIndex !== -1) {
        setCurrentStepIndex(stepIndex);
      }
    }
  }, [selectedStep, selectedSubtask]);

  const handleStepChange = (index: number) => {
    if (selectedSubtask && selectedSubtask.steps[index]) {
      const newStep = selectedSubtask.steps[index];
      
      // Only allow navigation to accessible steps
      if (!isStepAccessible(newStep.id)) {
        return;
      }
      
      setCurrentStepIndex(index);
      setSelectedStep(newStep);
      // Only clear submission and validation result for new (uncompleted) steps
      if (!newStep.isCompleted) {
        setSubmission('');
        setValidationResult(null);
      }
    }
  };

  const handleNextStep = () => {
    // Always use navigateToNext from TaskContext for proper position tracking
    // Clear submission and validation result before navigating
    setSubmission('');
    setValidationResult(null);
    navigateToNext();
  };

  if (!selectedTask || !selectedSubtask || !selectedStep) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Target size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium text-sm">Select a task to begin</p>
          <p className="text-slate-400 text-xs mt-1">
            Choose a task from the sidebar to start working on exercises
          </p>
        </div>
      </div>
    );
  }

  if (selectedTask.name.toLowerCase() === 'home') {
    return null;
  }

  // Get steps from the main tasks array (same source as status functions)
  const steps = (() => {
    if (!selectedTask || !selectedSubtask) return [];
    const currentTask = tasks.find(task => task.id === selectedTask.id);
    if (!currentTask) return selectedSubtask.steps || [];
    const currentSubtask = currentTask.subtasks.find(subtask => subtask.id === selectedSubtask.id);
    return currentSubtask?.steps || [];
  })();
  
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Play size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium text-sm">No steps available</p>
          <p className="text-slate-400 text-xs mt-1">
            This subtask doesn't have any steps defined yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StepNavigation 
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepChange={handleStepChange}
      />
      <AnimatePresence mode="wait">
        <StepCard
          key={currentStep.id}
          step={currentStep}
          stepIndex={currentStepIndex}
          totalSteps={steps.length}
          submission={submission}
          setSubmission={setSubmission}
          handleKeyPress={handleKeyPress}
          validateSubmission={validateSubmission}
          isValidating={isValidating}
          validationResult={validationResult}
          handleNextClick={handleNextStep}
        />
      </AnimatePresence>
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