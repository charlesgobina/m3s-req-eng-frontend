import React from 'react';
import TaskList from '../tasks/TaskList';
import ChatInterface from '../chat/ChatInterface';
import ExerciseSubmission from '../exercise/ExerciseSubmission';
import { motion } from 'framer-motion';

const MainLayout: React.FC = () => {
  return (
    <motion.div 
      className="h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TaskList />
      <ChatInterface />
      <ExerciseSubmission />
    </motion.div>
  );
};

export default MainLayout;