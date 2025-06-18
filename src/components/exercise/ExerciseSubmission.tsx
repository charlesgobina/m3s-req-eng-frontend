import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Target, Clock, User, Award, ArrowRight, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle, Play, BookOpen, Lightbulb, Flag } from 'lucide-react';
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
      className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-between touch-manipulation rounded-2xl shadow-lg mb-3"
      whileTap={{ scale: 0.98 }}
      style={{ boxShadow: '0 8px 32px rgba(80,0,120,0.18)' }}
    >
      <div className="flex items-center">
        <CheckCircle className="mr-3" size={22} />
        <span className="font-bold text-lg">Exercise</span>
      </div>
      {isExpanded ? <ChevronDown size={22} /> : <ChevronUp size={22} />}
    </motion.button>

    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white border border-slate-200 overflow-hidden rounded-2xl shadow-lg"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

const DesktopExercisePanel = memo(({ children }: { children: React.ReactNode }) => (
  <motion.div 
    className="hidden lg:flex w-2/5 bg-gradient-to-br from-slate-50 to-white shadow-2xl border-l border-slate-200 flex-col h-full"
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.3 }}
  >
    <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white flex-shrink-0">
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
          <Target size={24} className="text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Exercise Steps</h2>
          <p className="text-purple-100 text-sm">Complete each step to progress</p>
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
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
    <div className="flex items-center justify-between p-6 bg-white border-b border-slate-200 shadow-sm">
      <button
        onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
        disabled={currentStepIndex === 0}
        className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <ChevronLeft size={18} className="mr-1" />
        Previous
      </button>

      <div className="flex items-center space-x-3">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => onStepChange(index)}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
              index === currentStepIndex
                ? 'bg-purple-600 text-white shadow-lg scale-110'
                : step.isCompleted
                ? 'bg-green-500 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300 hover:shadow-md'
            }`}
          >
            {step.isCompleted ? (
              <CheckCircle size={16} />
            ) : (
              index + 1
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
        disabled={currentStepIndex === steps.length - 1}
        className="flex items-center px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        Next
        <ChevronRight size={18} className="ml-1" />
      </button>
    </div>
  );
});

const ObjectiveCard = memo(({ objective, stepIndex, totalSteps, isCompleted }: {
  objective: string;
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`relative overflow-hidden rounded-2xl p-6 mb-6 ${
      isCompleted 
        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' 
        : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200'
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 ${
          isCompleted 
            ? 'bg-green-500 text-white shadow-lg' 
            : 'bg-blue-500 text-white shadow-lg'
        }`}>
          {isCompleted ? (
            <CheckCircle size={24} />
          ) : (
            <span className="font-bold text-lg">{stepIndex + 1}</span>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-1">
            Step {stepIndex + 1} of {totalSteps}
          </h3>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isCompleted 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isCompleted ? '✓ Completed' : 'In Progress'}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-white/50">
      <div className="flex items-center mb-3">
        <Target size={20} className="text-slate-600 mr-2" />
        <h4 className="font-semibold text-slate-800">Objective</h4>
      </div>
      <p className="text-slate-700 leading-relaxed">{objective}</p>
    </div>

    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
  </motion.div>
));

const TaskDescriptionCard = memo(({ description }: { description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
        <BookOpen size={20} className="text-white" />
      </div>
      <h4 className="text-lg font-semibold text-slate-800">Task Description</h4>
    </div>
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
      <p className="text-slate-700 leading-relaxed">{description}</p>
    </div>
  </motion.div>
));

const CriteriaCard = memo(({ criteria }: { criteria: string[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.2 }}
    className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center mr-4">
        <Flag size={20} className="text-white" />
      </div>
      <h4 className="text-lg font-semibold text-slate-800">Success Criteria</h4>
    </div>
    <div className="space-y-3">
      {criteria.map((criterion: string, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
          className="flex items-start bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200"
        >
          <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
            <Circle size={10} className="text-white fill-current" />
          </div>
          <span className="text-slate-700 leading-relaxed">{criterion}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
));

const PreviousResponseCard = memo(({ response }: { response: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.3 }}
    className="bg-white rounded-2xl p-6 mb-6 shadow-lg border-2 border-green-200 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
        <CheckCircle size={20} className="text-white" />
      </div>
      <h4 className="text-lg font-semibold text-green-700">✓ Your Successful Response</h4>
    </div>
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
      <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{response}</p>
    </div>
  </motion.div>
));

const ResponseInputCard = memo(({ 
  submission, 
  setSubmission, 
  handleKeyPress 
}: {
  submission: string;
  setSubmission: (value: string) => void;
  handleKeyPress: (e: React.KeyboardEvent, isSubmission?: boolean) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.4 }}
    className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4">
        <Lightbulb size={20} className="text-white" />
      </div>
      <h4 className="text-lg font-semibold text-slate-800">Your Response</h4>
    </div>
    <div className="relative">
      <textarea
        value={submission}
        onChange={(e) => setSubmission(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, true)}
        placeholder="Write your solution here... Be detailed and thoughtful in your response."
        className="w-full min-h-[200px] p-5 border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm text-slate-700 leading-relaxed placeholder-slate-400"
      />
      <div className="absolute bottom-3 right-3 text-xs text-slate-400">
        Press Shift+Enter for new line
      </div>
    </div>
  </motion.div>
));

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
      {/* Step Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <ObjectiveCard 
          objective={step.objective}
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          isCompleted={isCompleted}
        />

        <TaskDescriptionCard description={step.step} />

        {step.validationCriteria && step.validationCriteria.length > 0 && (
          <CriteriaCard criteria={step.validationCriteria} />
        )}

        {isCompleted && hasValidResponse && (
          <PreviousResponseCard response={step.studentResponse} />
        )}

        {!isCompleted && (
          <ResponseInputCard
            submission={submission}
            setSubmission={setSubmission}
            handleKeyPress={handleKeyPress}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
        {!isCompleted ? (
          <motion.button
            onClick={validateSubmission}
            disabled={!submission.trim() || isValidating}
            className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-600 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl touch-manipulation font-semibold text-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            {isValidating ? (
              <>
                <Loader2 size={22} className="animate-spin mr-3" />
                Validating Your Response...
              </>
            ) : (
              <>
                <CheckCircle size={22} className="mr-3" />
                Submit & Validate
              </>
            )}
          </motion.button>
        ) : (
          <motion.button
            onClick={handleNextClick}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-500 via-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:via-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl touch-manipulation font-semibold text-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Continue to Next Step
            <ArrowRight size={22} className="ml-3" />
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
      <div className="flex items-center justify-center h-full p-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <Target size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-600 mb-3">Select a task to begin</h3>
          <p className="text-slate-500 max-w-md">
            Choose a task from the sidebar to start working on exercises and begin your learning journey
          </p>
        </motion.div>
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
      <div className="flex items-center justify-center h-full p-12">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 rounded-3xl flex items-center justify-center mb-6 mx-auto">
            <Play size={40} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-600 mb-3">No steps available</h3>
          <p className="text-slate-500 max-w-md">
            This subtask doesn't have any steps defined yet. Please check back later or contact support.
          </p>
        </motion.div>
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