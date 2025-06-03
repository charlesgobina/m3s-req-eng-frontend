import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const EmptyStateChat: React.FC = () => {
  return (
    <motion.div 
      className="text-center py-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.5,
          type: "spring",
          stiffness: 100
        }}
      >
        <Bot size={48} className="mx-auto text-slate-300 mb-4" />
      </motion.div>
      <motion.p 
        className="text-slate-500 font-medium"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        Start a conversation with your team!
      </motion.p>
      <motion.p 
        className="text-slate-400 text-sm mt-2 max-w-md mx-auto"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        Ask questions about requirements, get guidance, and learn from
        experts.
      </motion.p>
    </motion.div>
  );
};

export default EmptyStateChat;