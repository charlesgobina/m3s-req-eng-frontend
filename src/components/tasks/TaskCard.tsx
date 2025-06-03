import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useTask, Task } from '../../context/TaskContext';

interface TaskCardProps {
  task: Task;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, index }) => {
  const { selectedTask, setSelectedTask } = useTask();
  const isSelected = selectedTask?.id === task.id;
  
  return (
    <motion.div
      onClick={() => setSelectedTask(task)}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 border-2 ${
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
      whileHover={{ scale: isSelected ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-slate-800 text-sm">
          {task.name}
        </h3>
        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
          {task.phase}
        </span>
      </div>
      <p className="text-slate-600 text-xs line-clamp-2">
        {task.description}
      </p>
      <div className="mt-2 flex items-center text-xs text-slate-500">
        <Clock size={12} className="mr-1" />
        {task.objective}
      </div>
    </motion.div>
  );
};

export default TaskCard;