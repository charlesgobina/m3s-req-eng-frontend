import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, MessageCircle, Zap } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useTask } from '../../context/TaskContext';
import MessageBubble from './MessageBubble';

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
  
  const { selectedTask, selectedSubtask, selectedStep, getCurrentAgent, teamMembers } = useTask();
  const currentAgent = getCurrentAgent();


  // Generate agent avatar/initials
  const getAgentAvatar = () => {
    if (currentAgent?.imageUrl) {
      return (
        <img 
          src={currentAgent.imageUrl} 
          alt={currentAgent.name}
          className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
        <Bot className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <motion.div 
      className="flex flex-col bg-white h-full border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      {/* Agent Header */}
      <motion.div 
        className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          {getAgentAvatar()}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-900 text-sm truncate">
                {currentAgent?.name || 'AI Assistant'}
              </h3>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-500">Online</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 truncate">
              {currentAgent?.role || 'Assistant'}
            </p>
          </div>
          <div className="flex items-center space-x-1">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-xs text-violet-600 font-medium">AI</span>
          </div>
        </div>
        
        {/* Agent personality hint */}
        {/* {currentAgent?.personality && (
          <motion.div 
            className="mt-3 px-3 py-2 bg-white/60 rounded-lg border border-slate-200/60"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-slate-600 italic">
              💭 {currentAgent.personality}
            </p>
          </motion.div>
        )} */}
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-slate-50/50 to-white min-h-0 relative">
        <AnimatePresence>
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-center py-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-violet-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Start chatting with {currentAgent?.name || 'your assistant'}
              </h3>
              <p className="text-slate-600 max-w-md mb-6 leading-relaxed">
                Get personalized guidance, ask questions, or discuss your approach to this step.
              </p>
              {currentAgent?.expertise && currentAgent.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  <span className="text-xs text-slate-500 mb-2 w-full">Areas of expertise:</span>
                  {currentAgent.expertise.slice(0, 4).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 text-xs font-medium rounded-full border border-violet-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="space-y-0">
              {messages.map((message, index) => {
                const previousMessage = index > 0 ? messages[index - 1] : null;
                // Determine if we should show avatar (first message or different sender than previous)
                const showAvatar = index === 0 || 
                  messages[index - 1].role !== message.role ||
                  (message.role === 'assistant' && messages[index - 1].agentRole !== message.agentRole);
                
                return (
                  <MessageBubble 
                    key={message.id} 
                    message={message} 
                    index={index} 
                    currentAgent={currentAgent}
                    showAvatar={showAvatar}
                    previousMessage={previousMessage}
                  />
                );
              })}
            </div>
          )}
        </AnimatePresence>
        
        {/* Typing indicator */}
        <AnimatePresence>
          {isStreaming && (
            <motion.div 
              className="w-full mt-8"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Agent header */}
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900">
                    {currentAgent?.name || 'AI Assistant'}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    typing...
                  </span>
                </div>
              </div>
              
              {/* Typing bubble */}
              <div className="flex">
                <div className="ml-9 max-w-[80%] sm:max-w-[70%] bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-slate-500">thinking...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        className="p-4 border-t border-slate-200 bg-slate-50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <div className="relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${currentAgent?.name || 'assistant'}...`}
                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 bg-white text-sm max-h-32 min-h-[48px]"
                rows={1}
                disabled={isStreaming || selectedStep?.isCompleted}
                style={{ 
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              
              {selectedStep?.isCompleted && (
                <div className="absolute inset-0 bg-slate-100/80 rounded-2xl flex items-center justify-center">
                  <span className="text-xs text-slate-500 font-medium">Step completed</span>
                </div>
              )}
            </div>
          </div>
          
          <motion.button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isStreaming || selectedStep?.isCompleted}
            className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-2xl flex items-center justify-center transition-all duration-200 hover:from-violet-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isStreaming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>
        
        {/* Quick actions/suggestions */}
        {messages.length === 0 && currentAgent && (
          <motion.div 
            className="mt-3 flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {[
              "How do I start this step?",
              "What's the best approach?",
              "Can you guide me?"
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(suggestion)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChatInterface;