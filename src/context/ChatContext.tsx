// src/context/ChatContext.tsx - Updated with hybrid chat architecture
import React, { createContext, useState, useRef, useContext, useEffect } from 'react';
import { useTask } from './TaskContext';
// import { useProjectContext } from './ProjectContext';
import { useAuth } from './AuthContext';
import { apiService } from '../services/apiService';
import { chatService, UIMessage as ChatUIMessage } from '../services/chatService';
// Keep firestoreService for backwards compatibility during migration
import { firestoreService, ChatMessage as FirestoreChatMessage } from '../services/firestoreService';
import { Timestamp } from 'firebase/firestore';

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
  setValidationResult: (result: ValidationResult | null) => void;
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
  setValidationResult: () => {},
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
  const { selectedTask, selectedSubtask, selectedStep, teamMembers, updateStepCompletion } = useTask();
  // const { projectContext } = useProjectContext();
  
  // Store messages per step
  const [stepMessages, setStepMessages] = useState<Record<string, Message[]>>({});
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

  // Get current step's messages
  const messages = selectedStep ? (stepMessages[selectedStep.id] || []) : [];


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

  // Load chat messages from new ChatService when step changes
  useEffect(() => {
    const loadStepMessages = async () => {
      if (selectedTask && selectedSubtask && selectedStep && isAuthenticated && user?.id) {
        const stepId = selectedStep.id;
        
        // Check if we already have messages for this step in memory
        if (stepMessages[stepId]) {
          console.log('💬 Messages already loaded for step:', stepId);
          return; // Messages already loaded
        }

        try {
          console.log('📥 Loading chat messages from ChatService for step:', stepId);
          
          // Load messages from new chat service
          const chatMessages = await chatService.getChatMessages(
            user.id,
            selectedTask.id,
            selectedSubtask.id,
            stepId
          );
          
          if (chatMessages.length > 0) {
            // Messages found, convert to internal Message format
            const uiMessages: Message[] = chatMessages.map(msg => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp, // Already a Date from ChatService
              agentRole: msg.agentRole
            }));

            setStepMessages(prev => ({
              ...prev,
              [stepId]: uiMessages
            }));
            
            console.log(`✅ Loaded ${uiMessages.length} messages from ChatService`);
          } else {
            // No messages found, create initial welcome message
            console.log('👋 No messages found, creating welcome message');
            
            const welcomeMessage = await chatService.createInitialWelcomeMessage(
              user.id,
              selectedTask.id,
              selectedSubtask.id,
              stepId,
              selectedTask.name,
              selectedStep.objective
            );
            
            // Convert to internal Message format
            const initialMessage: Message = {
              id: welcomeMessage.id,
              role: welcomeMessage.role,
              content: welcomeMessage.content,
              timestamp: welcomeMessage.timestamp,
              agentRole: welcomeMessage.agentRole
            };
            
            setStepMessages(prev => ({
              ...prev,
              [stepId]: [initialMessage]
            }));
            
            console.log('✅ Created and saved initial welcome message');
          }
        } catch (error) {
          console.error('❌ Failed to load step messages from ChatService:', error);
          
          // Fallback: add initial message in memory only (no save)
          const fallbackMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: `Welcome to the task "${selectedTask.name}". How can I assist you with step "${selectedStep.objective}"?`,
            timestamp: new Date(),
          };
          
          setStepMessages(prev => ({
            ...prev,
            [stepId]: [fallbackMessage]
          }));
          
          console.log('🆘 Used fallback message due to ChatService error');
        }
      }
    };

    loadStepMessages();
  }, [selectedTask, selectedSubtask, selectedStep, isAuthenticated, user]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedTask || !selectedStep || !isAuthenticated) return;
    
    // Don't allow sending messages on completed steps
    if (selectedStep.isCompleted) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    const stepId = selectedStep.id;
    setStepMessages(prev => ({
      ...prev,
      [stepId]: [...(prev[stepId] || []), userMessage]
    }));
    setInputMessage('');
    setIsStreaming(true);

    // Save user message to ChatService
    if (user?.id && selectedSubtask) {
      try {
        console.log('💬 Saving user message to ChatService:', userMessage.content.substring(0, 50) + '...');
        await chatService.addChatMessage(
          user.id,
          selectedTask.id,
          selectedSubtask.id,
          stepId,
          {
            id: userMessage.id,
            role: userMessage.role,
            content: userMessage.content
            // Don't include agentRole for user messages (it's always undefined)
          }
        );
        console.log('✅ User message saved successfully to ChatService');
      } catch (error) {
        console.error('❌ Failed to save user message to ChatService:', error);
        // Note: Message still appears in UI due to optimistic update above
      }
    }

    try {
      const stepId = selectedStep.id;
      
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
        // projectContext: projectContext,
      };

      // Make authenticated request to start streaming using apiService
      const token = localStorage.getItem('authToken');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        // Handle auth errors like apiService does
        if (response.status === 401) {
          console.log('401 Unauthorized - clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          throw new Error('Authentication failed. Please log in again.');
        }
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
                  
                  // Update the last message in real-time for current step
                  setStepMessages(prev => {
                    const currentStepMessages = [...(prev[stepId] || [])];
                    const lastMessageIndex = currentStepMessages.length - 1;
                    
                    if (lastMessageIndex >= 0 && currentStepMessages[lastMessageIndex].role === 'assistant') {
                      currentStepMessages[lastMessageIndex] = {
                        ...currentStepMessages[lastMessageIndex],
                        content: assistantMessage,
                      };
                    } else {
                      currentStepMessages.push({
                        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        role: 'assistant',
                        content: assistantMessage,
                        timestamp: new Date(),
                        agentRole: agentRole,
                      });
                    }
                    
                    return {
                      ...prev,
                      [stepId]: currentStepMessages
                    };
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

      // Save final assistant message to ChatService
      if (assistantMessage && user?.id && selectedSubtask) {
        try {
          console.log('🤖 Saving assistant message to ChatService:', assistantMessage.substring(0, 50) + '...');
          const assistantMessageData: any = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: assistantMessage
          };
          
          // Only include agentRole if it's defined and not empty
          if (agentRole && agentRole.trim()) {
            assistantMessageData.agentRole = agentRole;
          }
          
          await chatService.addChatMessage(
            user.id,
            selectedTask.id,
            selectedSubtask.id,
            stepId,
            assistantMessageData
          );
          console.log('✅ Assistant message saved successfully to ChatService');
        } catch (error) {
          console.error('❌ Failed to save assistant message to ChatService:', error);
          // Note: Message still appears in UI due to real-time streaming update above
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to current step
      const errorMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      if (selectedStep) {
        setStepMessages(prev => ({
          ...prev,
          [selectedStep.id]: [...(prev[selectedStep.id] || []), errorMessage]
        }));
      }
    } finally {
      setIsStreaming(false);
    }
  };

  const validateSubmission = async () => {
    console.log('🚀 validateSubmission called');
    
    if (!submission.trim() || !selectedTask || !selectedStep || !isAuthenticated) {
      console.log('❌ Validation blocked - missing requirements:', {
        hasSubmission: !!submission.trim(),
        hasSelectedTask: !!selectedTask,
        hasSelectedStep: !!selectedStep,
        isAuthenticated
      });
      return;
    }

    console.log('✅ Validation starting for step:', selectedStep.id);
    setIsValidating(true);
    setValidationResult(null);

    try {
      const requestPayload = {
        submission: submission.trim(),
        taskId: selectedTask.id,
        subtask: selectedSubtask,
        step: selectedStep,
        sessionId: sessionId,
        // projectContext: projectContext,
      };

      console.log('Validation request payload:', requestPayload);
      console.log('Auth token exists:', !!localStorage.getItem('authToken'));
      console.log('Auth token value:', localStorage.getItem('authToken'));
      console.log('Is authenticated:', isAuthenticated);

      console.log('🔄 Making validation API request...');
      const response = await apiService.authenticatedRequest('/api/validation/validate', {
        method: 'POST',
        body: JSON.stringify(requestPayload),
      }, true); // Skip auth token clearing for validation requests

      console.log('📥 Validation API response received:', response);

      if (!response.success) {
        // Use the actual error from the server, not a generic message
        setValidationResult({
          score: 0,
          feedback: response.error || 'Validation failed. Please try again.',
          recommendations: '',
          passed: false,
        });
        return;
      }

      setValidationResult(response.data);
      
      // If validation passed, update step completion
      console.log('🔍 Validation response:', {
        hasData: !!response.data,
        passed: response.data?.passed,
        hasSelectedStep: !!selectedStep,
        selectedStepId: selectedStep?.id
      });
      
      if (response.data && response.data.passed && selectedStep) {
        console.log('✅ Validation passed, calling updateStepCompletion');
        await updateStepCompletion(selectedStep.id, true, submission.trim());
      } else {
        console.log('❌ Validation did not pass or missing requirements');
      }
    } catch (error) {
      console.error('Error validating submission:', error);
      setValidationResult({
        score: 0,
        feedback: `Network error: ${error instanceof Error ? error.message : 'Please try again.'}`,
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
        setValidationResult,
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