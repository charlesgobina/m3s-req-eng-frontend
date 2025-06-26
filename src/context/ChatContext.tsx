// src/context/ChatContext.tsx - Updated with authentication
import React, { createContext, useState, useRef, useContext, useEffect } from 'react';
import { useTask } from './TaskContext';
import { useProjectContext } from './ProjectContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentRole?: string;
}

interface ValidationResult {
  score: number;
  feedback: string;
  recommendations: string;
  passed: boolean;
}

interface ChatContextType {
  messages: Message[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  submission: string;
  setSubmission: (submission: string) => void;
  isStreaming: boolean;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  sendMessage: () => Promise<void>;
  validateSubmission: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent, isSubmission?: boolean) => void;
  getTeamMemberInfo: (role: string) => any;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatContext = createContext<ChatContextType>({
  messages: [],
  inputMessage: '',
  setInputMessage: () => {},
  submission: '',
  setSubmission: () => {},
  isStreaming: false,
  validationResult: null,
  isValidating: false,
  sendMessage: async () => {},
  validateSubmission: async () => {},
  handleKeyPress: () => {},
  getTeamMemberInfo: () => null,
  messagesEndRef: { current: null },
});

export const useChat = () => useContext(ChatContext);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { selectedTask, selectedSubtask, selectedStep, teamMembers } = useTask();
  const { projectContext } = useProjectContext();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [submission, setSubmission] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [sessionId] = useState<string>(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Helper function to make authenticated streaming requests
  const makeAuthenticatedStreamingRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`http://localhost:3000${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    return response;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedTask || !selectedStep || !isAuthenticated) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    try {
      // Close existing EventSource if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Create the request payload
      const requestPayload = {
        message: inputMessage.trim(),
        taskId: selectedTask.id,
        subtask: selectedSubtask,
        step: selectedStep,
        sessionId: sessionId,
        projectContext: projectContext,
      };

      // Make authenticated request to start streaming
      const response = await makeAuthenticatedStreamingRequest('/api/chat/stream', {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For streaming responses, we need to handle the response differently
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let agentRole = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'start') {
                  agentRole = data.agent;
                } else if (data.type === 'content') {
                  assistantMessage += data.content;
                  
                  // Update the last message in real-time
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMessageIndex = newMessages.length - 1;
                    
                    if (lastMessageIndex >= 0 && newMessages[lastMessageIndex].role === 'assistant') {
                      newMessages[lastMessageIndex] = {
                        ...newMessages[lastMessageIndex],
                        content: assistantMessage,
                      };
                    } else {
                      newMessages.push({
                        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date(),
                        agentRole: agentRole,
                      });
                    }
                    
                    return newMessages;
                  });
                } else if (data.type === 'end') {
                  break;
                }
              } catch (error) {
                console.error('Error parsing SSE data:', error);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  };

  const validateSubmission = async () => {
    if (!submission.trim() || !selectedTask || !selectedStep || !isAuthenticated) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const requestPayload = {
        submission: submission.trim(),
        taskId: selectedTask.id,
        subtask: selectedSubtask,
        step: selectedStep,
        sessionId: sessionId,
        projectContext: projectContext,
      };

      const response = await apiService.authenticatedRequest('/api/validation/validate', {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      });

      if (!response.success) {
        throw new Error(response.error || 'Validation failed');
      }

      setValidationResult(response.data);
    } catch (error) {
      console.error('Error validating submission:', error);
      setValidationResult({
        score: 0,
        feedback: 'Validation failed. Please try again.',
        recommendations: '',
        passed: false,
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, isSubmission = false) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isSubmission) {
        validateSubmission();
      } else {
        sendMessage();
      }
    }
  };

  const getTeamMemberInfo = (role: string) => {
    return teamMembers.find((member) => member.role === role);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        inputMessage,
        setInputMessage,
        submission,
        setSubmission,
        isStreaming,
        validationResult,
        isValidating,
        sendMessage,
        validateSubmission,
        handleKeyPress,
        getTeamMemberInfo,
        messagesEndRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};