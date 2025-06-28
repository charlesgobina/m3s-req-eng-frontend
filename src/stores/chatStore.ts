import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useTaskStore } from './taskStore';
import { apiService } from '../services/apiService';
import { chatService, UIMessage as ChatUIMessage } from '../services/chatService';
import { firestoreService, ChatMessage as FirestoreChatMessage } from '../services/firestoreService';

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

interface ChatStore {
  // State
  stepMessages: Record<string, Message[]>;
  inputMessage: string;
  submission: string;
  isStreaming: boolean;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  sessionId: string;
  eventSourceRef: EventSource | null;
  isEditingResponse: boolean;

  // Actions
  setInputMessage: (message: string) => void;
  setSubmission: (submission: string) => void;
  setValidationResult: (result: ValidationResult | null) => void;
  setEditingResponse: (isEditing: boolean) => void;
  sendMessage: () => Promise<void>;
  validateSubmission: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent, isSubmission?: boolean) => void;
  
  // Utility functions
  getTeamMemberInfo: (role: string) => any;
  getCurrentStepMessages: () => Message[];
  loadStepMessages: (stepId: string) => Promise<void>;
  
  // Internal state management
  setStepMessages: (stepId: string, messages: Message[]) => void;
  addMessageToStep: (stepId: string, message: Message) => void;
  updateLastMessageInStep: (stepId: string, content: string) => void;
  setStreaming: (isStreaming: boolean) => void;
  setValidating: (isValidating: boolean) => void;
  setEventSource: (eventSource: EventSource | null) => void;
  cleanup: () => void;
}

export const useChatStore = create<ChatStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    stepMessages: {},
    inputMessage: '',
    submission: '',
    isStreaming: false,
    validationResult: null,
    isValidating: false,
    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventSourceRef: null,
    isEditingResponse: false,

    // State setters
    setInputMessage: (inputMessage) => set({ inputMessage }),
    setSubmission: (submission) => set({ submission }),
    setValidationResult: (validationResult) => set({ validationResult }),
    setEditingResponse: (isEditingResponse) => set({ isEditingResponse }),
    setStreaming: (isStreaming) => set({ isStreaming }),
    setValidating: (isValidating) => set({ isValidating }),
    setEventSource: (eventSourceRef) => set({ eventSourceRef }),

    // Step message management
    setStepMessages: (stepId, messages) => 
      set(state => ({
        stepMessages: { ...state.stepMessages, [stepId]: messages }
      })),

    addMessageToStep: (stepId, message) =>
      set(state => ({
        stepMessages: {
          ...state.stepMessages,
          [stepId]: [...(state.stepMessages[stepId] || []), message]
        }
      })),

    updateLastMessageInStep: (stepId, content) =>
      set(state => {
        const currentMessages = [...(state.stepMessages[stepId] || [])];
        const lastMessageIndex = currentMessages.length - 1;
        
        if (lastMessageIndex >= 0 && currentMessages[lastMessageIndex].role === 'assistant') {
          currentMessages[lastMessageIndex] = {
            ...currentMessages[lastMessageIndex],
            content,
          };
        } else {
          currentMessages.push({
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content,
            timestamp: new Date(),
          });
        }
        
        return {
          stepMessages: {
            ...state.stepMessages,
            [stepId]: currentMessages
          }
        };
      }),

    getCurrentStepMessages: (): Message[] => {
      const { selectedStep } = useTaskStore.getState();
      const { stepMessages } = get();
      return selectedStep ? (stepMessages[selectedStep.id] || []) : [];
    },

    // Load chat messages from ChatService when step changes
    loadStepMessages: async (stepId: string) => {
      const { isAuthenticated, user } = useAuthStore.getState();
      const { selectedTask, selectedSubtask } = useTaskStore.getState();
      const { stepMessages, setStepMessages } = get();

      if (!selectedTask || !selectedSubtask || !isAuthenticated || !user?.id) return;

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

          setStepMessages(stepId, uiMessages);
          console.log(`✅ Loaded ${uiMessages.length} messages from ChatService`);
        } else {
          // No messages found, create initial welcome message
          console.log('👋 No messages found, creating welcome message');
          
          const { selectedStep } = useTaskStore.getState();
          if (!selectedStep) return;
          
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
          
          setStepMessages(stepId, [initialMessage]);
          console.log('✅ Created and saved initial welcome message');
        }
      } catch (error) {
        console.error('❌ Failed to load step messages from ChatService:', error);
        
        // Fallback: add initial message in memory only (no save)
        const { selectedStep } = useTaskStore.getState();
        if (selectedStep) {
          const fallbackMessage: Message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: 'assistant',
            content: `Welcome to the task "${selectedTask.name}". How can I assist you with step "${selectedStep.objective}"?`,
            timestamp: new Date(),
          };
          
          setStepMessages(stepId, [fallbackMessage]);
          console.log('🆘 Used fallback message due to ChatService error');
        }
      }
    },

    sendMessage: async () => {
      const { inputMessage, sessionId, setInputMessage, setStreaming, addMessageToStep, updateLastMessageInStep, eventSourceRef, setEventSource, isEditingResponse } = get();
      const { isAuthenticated, user } = useAuthStore.getState();
      const { selectedTask, selectedSubtask, selectedStep, getCurrentAgent } = useTaskStore.getState();

      if (!inputMessage.trim() || !selectedTask || !selectedStep || !isAuthenticated) return;
      
      // Don't allow sending messages on completed steps unless we're in edit mode
      if (selectedStep.isCompleted && !isEditingResponse) return;

      const userMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'user',
        content: inputMessage.trim(),
        timestamp: new Date(),
      };

      const stepId = selectedStep.id;
      addMessageToStep(stepId, userMessage);
      setInputMessage('');
      setStreaming(true);

      // Save user message to ChatService
      if (user?.id && selectedSubtask) {
        try {
          await chatService.addChatMessage(
            user.id,
            selectedTask.id,
            selectedSubtask.id,
            stepId,
            {
              id: userMessage.id,
              role: userMessage.role,
              content: userMessage.content
            }
          );
        } catch (error) {
          console.error('❌ Failed to save user message to ChatService:', error);
        }
      }

      try {
        // Close existing EventSource if any
        if (eventSourceRef) {
          eventSourceRef.close();
        }

        // Get current agent info
        const currentAgent = getCurrentAgent();
        
        // Create the request payload
        const requestPayload = {
          message: inputMessage.trim(),
          taskId: selectedTask.id,
          subtask: selectedSubtask,
          step: selectedStep,
          sessionId: sessionId,
          agentRole: currentAgent?.role,
        };

        // Make authenticated request to start streaming using apiService
        const token = localStorage.getItem('authToken');
        
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch('https://m3s-req-eng.onrender.com/api/chat/stream', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestPayload),
        });

        if (!response.ok) {
          // Handle auth errors like apiService does
          if (response.status === 401) {
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
                    updateLastMessageInStep(stepId, assistantMessage);
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
          } catch (error) {
            console.error('❌ Failed to save assistant message to ChatService:', error);
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
          addMessageToStep(selectedStep.id, errorMessage);
        }
      } finally {
        setStreaming(false);
      }
    },

    validateSubmission: async () => {
      const { submission, sessionId, setValidating, setValidationResult } = get();
      const { isAuthenticated } = useAuthStore.getState();
      const { selectedTask, selectedSubtask, selectedStep, updateStepCompletion } = useTaskStore.getState();

      if (!submission.trim() || !selectedTask || !selectedStep || !isAuthenticated) {
        return;
      }

      console.log('✅ Validation starting for step:', selectedStep.id);
      setValidating(true);
      setValidationResult(null);

      try {
        const requestPayload = {
          submission: submission.trim(),
          taskId: selectedTask.id,
          subtask: selectedSubtask,
          step: selectedStep,
          sessionId: sessionId,
        };

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
          try {
            await updateStepCompletion(selectedStep.id, true, submission.trim());
            console.log('✅ Step completion updated successfully');
          } catch (updateError) {
            console.error('❌ Failed to update step completion:', updateError);
          }
        } else {
          console.log('❌ Validation did not pass or missing requirements', {
            hasData: !!response.data,
            passed: response.data?.passed,
            hasSelectedStep: !!selectedStep,
            responseData: response.data
          });
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
        setValidating(false);
      }
    },

    handleKeyPress: (e: React.KeyboardEvent, isSubmission = false) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (isSubmission) {
          get().validateSubmission();
        } else {
          get().sendMessage();
        }
      }
    },

    getTeamMemberInfo: (role: string) => {
      const { teamMembers } = useTaskStore.getState();
      return teamMembers.find((member) => member.role === role);
    },

    cleanup: () => {
      const { eventSourceRef } = get();
      if (eventSourceRef) {
        eventSourceRef.close();
        set({ eventSourceRef: null });
      }
    },
  }))
);

// Subscribe to task store changes and load messages when step changes
useTaskStore.subscribe(
  (state) => ({ 
    selectedStep: state.selectedStep, 
    isAuthenticated: useAuthStore.getState().isAuthenticated 
  }),
  ({ selectedStep }) => {
    if (selectedStep) {
      // Load messages for the new step
      useChatStore.getState().loadStepMessages(selectedStep.id);
      
      // Clear validation result when switching steps
      useChatStore.getState().setValidationResult(null);
      
      // Clear submission text when switching steps
      useChatStore.getState().setSubmission('');
      
      // Exit edit mode when switching steps
      useChatStore.getState().setEditingResponse(false);
    }
  },
  {
    equalityFn: (a, b) => a.selectedStep?.id === b.selectedStep?.id && a.isAuthenticated === b.isAuthenticated
  }
);

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    useChatStore.getState().cleanup();
  });
}