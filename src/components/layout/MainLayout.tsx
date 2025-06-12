import React from 'react';
import TaskList from '../tasks/TaskList';
import ChatInterface from '../chat/ChatInterface';
import ExerciseSubmission from '../exercise/ExerciseSubmission';
import ProjectOverview from '../home/ProjectOverview';
import { motion } from 'framer-motion';
import { useTask } from '../../context/TaskContext';

const MainLayout: React.FC = () => {
  const { selectedTask } = useTask();
  
  const isHomeTask = selectedTask?.name?.toLowerCase() === 'home';

  return (
    <motion.div 
      className="h-screen flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <TaskList />
      {isHomeTask ? (
        <ProjectOverview />
      ) : (
        <>
          <ChatInterface />
          <ExerciseSubmission />
        </>
      )}
    </motion.div>
  );
};

export default MainLayout;