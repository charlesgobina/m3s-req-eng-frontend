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
  const { selectedTask, teamMembers } = useTask();
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
    if (selectedTask) {
      setMessages([]);
      setValidationResult(null);
      setSubmission('');
    }
  }, [selectedTask]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedTask || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:3000/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          taskId: selectedTask.id,
          sessionId,
          projectContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start chat stream');
      }

      const reader = response?.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        agentRole: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'agent_selected') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, agentRole: data.agent }
                      : msg
                  )
                );
              } else if (data.type === 'content') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: msg.content + data.content,
                          agentRole: data.agent,
                        }
                      : msg
                  )
                );
              } else if (data.type === 'error') {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: `Error: ${data.message}` }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content:
            'Sorry, there was an error processing your message. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const validateSubmission = async () => {
    if (!submission.trim() || !selectedTask || isValidating) return;

    setIsValidating(true);
    try {
      const response = await fetch(
        'http://localhost:3000/api/validation/validate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submission,
            taskId: selectedTask.id,
            sessionId,
            projectContext,
          }),
        }
      );

      const result = await response.json();
      setValidationResult(result);
    } catch (error) {
      console.error('Error validating submission:', error);
      setValidationResult({
        score: 0,
        feedback: 'Error validating submission. Please try again.',
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