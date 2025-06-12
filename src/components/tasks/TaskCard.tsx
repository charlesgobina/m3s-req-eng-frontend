import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronRight, User, Target, CheckCircle2 } from 'lucide-react';
import { useTask, Task, Subtask } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  index: number;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
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

const SubtaskItem: React.FC<{ subtask: Subtask; isSelected: boolean; onClick: () => void }> = ({ 
  subtask, 
  isSelected, 
  onClick 
}) => {

  console.log('Rendering SubtaskItem:', subtask.name, 'Selected:', isSelected);
  return (
    <motion.div
      onClick={onClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
        isSelected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-800 text-sm leading-tight">
          {subtask.name}
        </h4>
        <div className="flex items-center space-x-1 ml-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(subtask.difficulty)}`}>
            {subtask.difficulty}
          </span>
        </div>
      </div>
      
      <p className="text-xs text-slate-600 mb-2 line-clamp-2">
        {subtask.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center">
          <Clock size={10} className="mr-1" />
          {subtask.estimatedTime}
        </div>
        <div className="flex items-center">
          <User size={10} className="mr-1" />
          {subtask.primaryAgent}
        </div>
      </div>
      
      <div className="mt-2 flex items-center text-xs">
        <Target size={10} className="mr-1 text-blue-500" />
        <span className="text-slate-600 line-clamp-1">{subtask.objective}</span>
      </div>
    </motion.div>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const { selectedTask, selectedSubtask, setSelectedTask, setSelectedSubtask } = useTask();
  const [isExpanded, setIsExpanded] = useState(selectedTask?.id === task.id);
  const isSelected = selectedTask?.id === task.id;
  
  React.useEffect(() => {
    if (selectedTask?.id === task.id) {
      setIsExpanded(true);
    }
  }, [selectedTask, task.id]);

  const handleTaskClick = () => {
    setSelectedTask(task);
    setIsExpanded(!isExpanded);
  };

  const handleSubtaskClick = (subtask: Subtask) => {
    if (selectedTask?.id !== task.id) {
      setSelectedTask(task);
    }
    setSelectedSubtask(subtask);
  };
  
  return (
    <motion.div
      className={`rounded-lg transition-all duration-200 border-2 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
    >
      <div
        onClick={handleTaskClick}
        className="p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="mr-2"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </motion.div>
            <h3 className="font-semibold text-slate-800 text-sm">
              {task.name}
            </h3>
          </div>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full whitespace-nowrap">
            {task.phase}
          </span>
        </div>
        
        <p className="text-slate-600 text-xs line-clamp-2 ml-6">
          {task.description}
        </p>
        
        <div className="mt-2 ml-6 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <Target size={12} className="mr-1" />
            <span className="line-clamp-1">{task.objective}</span>
          </div>
          <span className="text-xs text-slate-500 ml-2">
            {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              <div className="h-px bg-slate-200 mb-3"></div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                Subtasks:
              </h4>
              {task.subtasks.map((subtask, subtaskIndex) => (
                <motion.div
                  key={subtask.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: subtaskIndex * 0.1 }}
                >
                  <SubtaskItem
                    subtask={subtask}
                    isSelected={selectedSubtask?.id === subtask.id}
                    onClick={() => handleSubtaskClick(subtask)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskCard;