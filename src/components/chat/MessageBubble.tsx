import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { Message } from '../../context/ChatContext';
import { useChat } from '../../context/ChatContext';

interface MessageBubbleProps {
  message: Message;
  index: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, index }) => {
  const { getTeamMemberInfo } = useChat();
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1 > 0.5 ? 0.5 : index * 0.1, 
        type: "spring",
        stiffness: 100 
      }}
    >
      <div
        className={`max-w-3/4 p-4 rounded-2xl shadow-sm ${
          isUser
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ml-8'
            : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 mr-8'
        }`}
      >
        {!isUser && message.agentRole && (
          <motion.div 
            className="flex items-center mb-2 text-xs"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <User size={12} className="mr-1" />
            <span className="font-semibold text-slate-600">
              {getTeamMemberInfo(message.agentRole)?.name || message.agentRole}
            </span>
            <span className="ml-2 px-2 py-1 bg-slate-300 text-slate-700 rounded-full">
              {message.agentRole}
            </span>
          </motion.div>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;