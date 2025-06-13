import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronDown, ChevronRight, User, Target } from 'lucide-react';
import { useTask, Task, Subtask } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  index: number;
  onSelect?: () => void;
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

const SubtaskItem: React.FC<{ 
  subtask: Subtask; 
  isSelected: boolean; 
  onClick: () => void;
  onSelect?: () => void;
}> = ({ subtask, isSelected, onClick, onSelect }) => {
  const handleClick = () => {
    onClick();
    onSelect?.();
  };

  return (
    <motion.div
      onClick={handleClick}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border touch-manipulation ${
        isSelected
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50 active:bg-slate-100'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-slate-800 text-sm leading-tight pr-2">
          {subtask.name}
        </h4>
        <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${getDifficultyColor(subtask.difficulty)}`}>
          {subtask.difficulty}
        </span>
      </div>
      
      <p className="text-xs text-slate-600 mb-2 line-clamp-2">
        {subtask.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <div className="flex items-center">
          <Clock size={10} className="mr-1" />
          <span className="truncate">{subtask.estimatedTime}</span>
        </div>
        <div className="flex items-center ml-2">
          <User size={10} className="mr-1" />
          <span className="truncate">{subtask.primaryAgent}</span>
        </div>
      </div>
      
      <div className="flex items-start text-xs">
        <Target size={10} className="mr-1 text-blue-500 mt-0.5 flex-shrink-0" />
        <span className="text-slate-600 line-clamp-2">{subtask.objective}</span>
      </div>
    </motion.div>
  );
};

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onSelect }) => {
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
    onSelect?.();
  };

  const handleSubtaskClick = (subtask: Subtask) => {
    if (selectedTask?.id !== task.id) {
      setSelectedTask(task);
    }
    setSelectedSubtask(subtask);
  };
  
  return (
    <motion.div
      className={`rounded-lg transition-all duration-200 border-2 touch-manipulation ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm active:bg-slate-50'
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
        className="p-3 lg:p-4 cursor-pointer"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center flex-1 min-w-0">
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              className="mr-2 flex-shrink-0"
            >
              <ChevronRight size={16} className="text-slate-400" />
            </motion.div>
            <h3 className="font-semibold text-slate-800 text-sm truncate">
              {task.name}
            </h3>
          </div>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full whitespace-nowrap ml-2 flex-shrink-0">
            {task.phase}
          </span>
        </div>
        
        <p className="text-slate-600 text-xs line-clamp-2 ml-6 mb-2">
          {task.description}
        </p>
        
        <div className="ml-6 flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 min-w-0 flex-1">
            <Target size={12} className="mr-1 flex-shrink-0" />
            <span className="truncate">{task.objective}</span>
          </div>
          <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
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
            <div className="px-3 lg:px-4 pb-3 lg:pb-4 space-y-2">
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
                    onSelect={onSelect}
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