import React, { createContext, useState, useRef, useContext, useEffect } from 'react';
import { useTask } from './TaskContext';
import { useProjectContext } from './ProjectContext';

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
  const { selectedTask, selectedSubtask, teamMembers } = useTask();
  const { projectContext } = useProjectContext();
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);
  
  useEffect(() => {
    if (selectedSubtask) {
      setMessages([]);
      setValidationResult(null);
      setSubmission('');
    }
  }, [selectedSubtask]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedSubtask || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    // Mock response for now since there's no backend
    setTimeout(() => {
      const mockResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you're working on "${selectedSubtask.name}". This is a ${selectedSubtask.difficulty.toLowerCase()} level task that should take about ${selectedSubtask.estimatedTime}. 

The main objective is: ${selectedSubtask.objective}

Let me help you with this. What specific aspect would you like guidance on?`,
        timestamp: new Date(),
        agentRole: selectedSubtask.primaryAgent,
      };

      setMessages((prev) => [...prev, mockResponse]);
      setIsStreaming(false);
    }, 1500);
  };

  const validateSubmission = async () => {
    if (!submission.trim() || !selectedSubtask || isValidating) return;

    setIsValidating(true);
    
    // Mock validation for now
    setTimeout(() => {
      const mockValidation: ValidationResult = {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        feedback: `Your submission for "${selectedSubtask.name}" shows good understanding of the core concepts. You've addressed most of the expected outcomes.`,
        recommendations: `Consider expanding on the stakeholder analysis section and providing more specific examples. Review the validation criteria to ensure all points are covered.`,
        passed: true,
      };

      setValidationResult(mockValidation);
      setIsValidating(false);
    }, 2000);
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