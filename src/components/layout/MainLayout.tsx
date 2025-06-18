import React, { useState } from 'react';
import TaskList from '../tasks/TaskList';
import ChatInterface from '../chat/ChatInterface';
import ExerciseSubmission from '../exercise/ExerciseSubmission';
import ProjectOverview from '../home/ProjectOverview';
import { motion, AnimatePresence } from 'framer-motion';
import { useTask } from '../../context/TaskContext';
import { Menu, X } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { selectedTask, selectedSubtask } = useTask();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isHomeTask = selectedTask?.name?.toLowerCase() === 'home';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.div 
      className="h-svh flex flex-col lg:flex-row relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 flex items-center justify-between z-50">
        <h1 className="text-lg font-bold">
          {selectedSubtask?.name || 'Yliopisto'}
        </h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Task List Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileMenu}
          >
            <motion.div
              className="w-full max-w-[100vw] h-full bg-white"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TaskList onTaskSelect={() => setIsMobileMenuOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Task List */}
      <div className="hidden lg:block w-1/4">
        <TaskList />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {isHomeTask ? (
          <ProjectOverview />
        ) : (
          <>
            {/* Chat Interface */}
            <div className="flex-1 lg:w-1/2 flex flex-col min-h-0">
              <ChatInterface />
            </div>
            
            {/* Exercise Submission - Full remaining width */}
            <div className="hidden lg:block lg:flex-1">
              <ExerciseSubmission />
            </div>
            
            {/* Mobile Exercise Button */}
            <div className="lg:hidden p-4 bg-white border-t border-slate-200">
              <ExerciseSubmission />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default MainLayout;