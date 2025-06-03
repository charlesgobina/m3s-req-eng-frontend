import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import TaskCard from './TaskCard';

const TaskList: React.FC = () => {
  const { tasks, isLoading, error } = useTask();

  return (
    <motion.div 
      className="w-1/4 bg-white shadow-xl border-r border-slate-200 flex flex-col"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <FileText className="mr-2" size={20} />
          Learning Tasks
        </h2>
        <p className="text-blue-100 text-sm mt-1">Requirements Engineering</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center p-4 text-red-500">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="text-center p-4 text-slate-500">No tasks available</div>
        ) : (
          tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))
        )}
      </div>
    </motion.div>
  );
};

export default TaskList;