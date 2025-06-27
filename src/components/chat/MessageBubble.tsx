import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { Message } from '../../context/ChatContext';
import { TeamMember } from '../../context/TaskContext';

interface MessageBubbleProps {
  message: Message;
  index: number;
  currentAgent?: TeamMember | null;
  showAvatar?: boolean;
  previousMessage?: Message | null;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  index, 
  currentAgent, 
  showAvatar = true,
  previousMessage
}) => {
  const isUser = message.role === 'user';
  const isPreviousFromDifferentSender = previousMessage && previousMessage.role !== message.role;
  
  // Calculate spacing based on message context
  const getSpacingClasses = () => {
    if (index === 0) return 'mt-0'; // First message
    if (isPreviousFromDifferentSender) return 'mt-8'; // Different sender
    return 'mt-3'; // Same sender
  };

  // Generate compact agent avatar
  const getAgentAvatar = () => {
    if (currentAgent?.imageUrl) {
      return (
        <img 
          src={currentAgent.imageUrl} 
          alt={currentAgent.name}
          className="w-6 h-6 rounded-lg object-cover flex-shrink-0"
        />
      );
    }
    
    if (currentAgent?.name) {
      const initials = currentAgent.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
      
      return (
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
          {initials}
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-white" />
      </div>
    );
  };

  if (isUser) {
    return (
      <motion.div
        className={`w-full ${getSpacingClasses()}`}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ 
          duration: 0.3, 
          delay: Math.min(index * 0.02, 0.2),
        }}
      >
        {/* User message bubble */}
        <div className="flex justify-end mt-4">
          <div className="max-w-[80%] sm:max-w-[70%] flex flex-col items-end">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-2xl rounded-br-md shadow-sm"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: Math.min(index * 0.02, 0.2) + 0.1 }}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            </motion.div>
            
            {/* Footer below bubble - only show if different from previous sender */}
            {showAvatar && (
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                <span className="font-medium text-slate-700">You</span>
                <span>•</span>
                <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Assistant messages
  return (
    <motion.div
      className={`w-full ${getSpacingClasses()}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: Math.min(index * 0.02, 0.2),
      }}
    >
      {/* Agent header */}
      {showAvatar && (
        <motion.div 
          className="flex items-center gap-3 mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(index * 0.02, 0.2) + 0.1 }}
        >
          {getAgentAvatar()}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">
              {currentAgent?.name || 'AI Assistant'}
            </span>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
              {currentAgent?.role || 'Assistant'}
            </span>
            <span className="text-xs text-slate-400">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
        </motion.div>
      )}
      
      {/* Agent message bubble */}
      <div className="flex">
        {/* Left spacer to align with content when no avatar */}
        {!showAvatar && <div className="w-6 mr-3 flex-shrink-0" />}
        
        <motion.div
          className={`${showAvatar ? 'ml-9' : ''} max-w-[80%] sm:max-w-[70%] bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow duration-200`}
          initial={{ opacity: 0.8, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: Math.min(index * 0.02, 0.2) + 0.2 }}
        >
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;