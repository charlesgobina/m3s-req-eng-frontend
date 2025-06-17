import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Target, Clock, User, Award, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, Play } from 'lucide-react';
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
      className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between touch-manipulation rounded-2xl shadow-lg mb-2"
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
          className="bg-white border-t border-slate-200 overflow-hidden rounded-b-2xl"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const DesktopExercisePanel = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div 
    className="hidden lg:flex w-2/5 bg-white shadow-xl border-l border-slate-200 flex-col h-full"
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.3 }}
  >
    <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-shrink-0">
      <h2 className="text-xl font-bold flex items-center">
        <Target className="mr-2" size={20} />
        Exercise Steps
      </h2>
      <p className="text-purple-100 text-sm mt-1">Complete each step to progress</p>
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
  if (steps.length <= 1) return null;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
      <button
        onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
        disabled={currentStepIndex === 0}
        className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} className="mr-1" />
        Previous
      </button>

      <div className="flex items-center space-x-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepChange(index)}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              index === currentStepIndex
                ? 'bg-purple-600 text-white shadow-lg'
                : step.isCompleted
                ? 'bg-green-500 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            }`}
          >
            {step.isCompleted ? (
              <CheckCircle size={14} />
            ) : (
              index + 1
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
        disabled={currentStepIndex === steps.length - 1}
        className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight size={16} className="ml-1" />
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
      {/* Step Header */}
      <div className={`p-4 border-b border-slate-200 ${
        isCompleted ? 'bg-green-50' : 'bg-slate-50'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
              isCompleted 
                ? 'bg-green-500 text-white' 
                : 'bg-purple-100 text-purple-600'
            }`}>
              {isCompleted ? (
                <CheckCircle size={20} />
              ) : (
                <span className="font-bold">{stepIndex + 1}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-lg">
                Step {stepIndex + 1} of {totalSteps}
              </h3>
              <p className="text-sm text-slate-600">
                {isCompleted ? 'Completed' : 'In Progress'}
              </p>
            </div>
          </div>
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              ✓ Passed
            </motion.div>
          )}
        </div>

        <div className="bg-white rounded-lg p-4 border border-slate-200">
          <h4 className="font-medium text-slate-800 mb-2">Objective:</h4>
          <p className="text-slate-700 text-sm leading-relaxed">{step.objective}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex flex-col p-4 min-h-0">
        <div className="mb-4">
          <h4 className="font-medium text-slate-800 mb-2">Task Description:</h4>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-slate-700 text-sm leading-relaxed">{step.step}</p>
          </div>
        </div>

        {/* Validation Criteria */}
        {step.validationCriteria && step.validationCriteria.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-800 mb-2">Success Criteria:</h4>
            <div className="space-y-2">
              {step.validationCriteria.map((criteria: string, index: number) => (
                <div key={index} className="flex items-start">
                  <Circle size={12} className="text-slate-400 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm text-slate-600">{criteria}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Response (if completed) */}
        {isCompleted && hasValidResponse && (
          <div className="mb-4">
            <h4 className="font-medium text-green-700 mb-2">✓ Your Successful Response:</h4>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{step.studentResponse}</p>
            </div>
          </div>
        )}

        {/* Current Response Area */}
        {!isCompleted && (
          <div className="flex-1 flex flex-col">
            <h4 className="font-medium text-slate-800 mb-2">Your Response:</h4>
            <textarea
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, true)}
              placeholder="Write your solution here..."
              className="flex-1 min-h-[150px] p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm text-sm"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        {!isCompleted ? (
          <motion.button
            onClick={validateSubmission}
            disabled={!submission.trim() || isValidating}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center shadow-sm touch-manipulation font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
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
        ) : (
          <motion.button
            onClick={handleNextClick}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center shadow-sm touch-manipulation font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Next
            <ArrowRight size={18} className="ml-2" />
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
    validationResult
  } = useChat();
  
  const { selectedTask, selectedSubtask, selectedStep, navigateToNext, setSelectedStep } = useTask();
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
      setCurrentStepIndex(index);
      setSelectedStep(selectedSubtask.steps[index]);
    }
  };

  const handleNextStep = () => {
    if (selectedSubtask && currentStepIndex < selectedSubtask.steps.length - 1) {
      handleStepChange(currentStepIndex + 1);
    } else {
      navigateToNext();
    }
  };

  if (!selectedTask || !selectedSubtask || !selectedStep) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Target size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">Select a task to begin</p>
          <p className="text-slate-400 text-sm mt-2">
            Choose a task from the sidebar to start working on exercises
          </p>
        </div>
      </div>
    );
  }

  if (selectedTask.name.toLowerCase() === 'home') {
    return null;
  }

  const steps = selectedSubtask.steps || [];
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Play size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No steps available</p>
          <p className="text-slate-400 text-sm mt-2">
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