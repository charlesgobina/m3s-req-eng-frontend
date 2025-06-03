import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTask } from '../../context/TaskContext';
import MessageBubble from './MessageBubble';
import EmptyStateChat from './EmptyStateChat';

const ChatInterface: React.FC = () => {
  const { 
    messages, 
    inputMessage, 
    setInputMessage, 
    isStreaming, 
    sendMessage, 
    handleKeyPress,
    messagesEndRef
  } = useChat();
  
  const { selectedTask } = useTask();

  return (
    <motion.div 
      className="w-1/2 flex flex-col bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <Bot className="mr-2" size={20} />
          Team Collaboration
        </h2>
        {selectedTask && (
          <p className="text-indigo-100 text-sm mt-1">
            Working on: {selectedTask.name}
          </p>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50 to-white">
        {messages.length === 0 ? (
          <EmptyStateChat />
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={message.id} message={message} index={index} />
          ))
        )}

        {isStreaming && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 rounded-2xl mr-8 shadow-sm">
              <div className="flex items-center">
                <Loader2 size={16} className="animate-spin mr-2" />
                <span className="text-slate-600">
                  Team member is typing...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <motion.div 
        className="p-4 border-t border-slate-200 bg-slate-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your team a question..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
            disabled={isStreaming || !selectedTask}
          />
          <motion.button
            onClick={sendMessage}
            disabled={isStreaming || !inputMessage.trim() || !selectedTask}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isStreaming ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatInterface;