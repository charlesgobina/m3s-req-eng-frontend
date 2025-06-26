/**
 * ChatService - Handles chat message persistence in separate Firestore collection
 * 
 * This service manages chat messages independently from task data to:
 * - Prevent document size limits on main task documents
 * - Enable better performance for chat operations
 * - Allow unlimited message history per step
 * 
 * Collection Structure:
 * chat_messages/{userId}/step_chats/{taskId}_{subtaskId}_{stepId}
 * ├── messages: Array<ChatMessage>
 * ├── messageCount: number
 * └── lastUpdated: Timestamp
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Chat message interface for Firestore storage
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  agentRole?: string;
}

// UI message interface (with Date instead of Timestamp)
export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentRole?: string;
}

// Chat document structure in Firestore
interface ChatDocument {
  messages: ChatMessage[];
  messageCount: number;
  lastUpdated: Timestamp;
}

// Chat summary for main task document
export interface ChatSummary {
  chatMessageCount: number;
  lastChatAt: Timestamp;
}

export class ChatService {
  
  /**
   * Creates a document ID for chat messages
   * Format: {taskId}_{subtaskId}_{stepId}
   */
  private createChatDocumentId(taskId: string, subtaskId: string, stepId: string): string {
    return `${taskId}_${subtaskId}_${stepId}`;
  }

  /**
   * Creates a Firestore document reference for chat messages
   */
  private getChatDocumentRef(userId: string, taskId: string, subtaskId: string, stepId: string) {
    const chatDocId = this.createChatDocumentId(taskId, subtaskId, stepId);
    return doc(db, 'chat_messages', userId, 'step_chats', chatDocId);
  }

  /**
   * Retrieves all chat messages for a specific step
   * 
   * @param userId - User's unique identifier
   * @param taskId - Task identifier
   * @param subtaskId - Subtask identifier  
   * @param stepId - Step identifier
   * @returns Array of UI messages (with Date timestamps)
   */
  async getChatMessages(
    userId: string, 
    taskId: string, 
    subtaskId: string, 
    stepId: string
  ): Promise<UIMessage[]> {
    try {
      console.log('💬 ChatService: Loading messages for', { userId, taskId, subtaskId, stepId });
      
      const chatDocRef = this.getChatDocumentRef(userId, taskId, subtaskId, stepId);
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) {
        console.log('📭 ChatService: No chat document found, returning empty array');
        return [];
      }
      
      const chatData = chatDoc.data() as ChatDocument;
      const messages = chatData.messages || [];
      
      // Convert Firestore timestamps to Date objects for UI
      const uiMessages: UIMessage[] = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : msg.timestamp.toDate(),
        agentRole: msg.agentRole
      }));
      
      console.log(`✅ ChatService: Loaded ${uiMessages.length} messages`);
      return uiMessages;
      
    } catch (error) {
      console.error('❌ ChatService: Failed to load messages:', error);
      throw new Error(`Failed to load chat messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Adds a new chat message to the step's chat collection
   * 
   * @param userId - User's unique identifier
   * @param taskId - Task identifier
   * @param subtaskId - Subtask identifier
   * @param stepId - Step identifier
   * @param message - Message to add (without timestamp, will be added)
   */
  async addChatMessage(
    userId: string,
    taskId: string, 
    subtaskId: string,
    stepId: string,
    message: Omit<ChatMessage, 'timestamp'> & { timestamp?: Timestamp }
  ): Promise<void> {
    try {
      console.log('💬 ChatService: Adding message', { 
        userId, 
        taskId, 
        subtaskId, 
        stepId, 
        messageRole: message.role,
        messageLength: message.content.length 
      });
      
      // Validate required fields
      if (!message.id || !message.role || !message.content) {
        throw new Error('Message missing required fields: id, role, or content');
      }
      
      // Clean the message object and ensure timestamp
      // Note: Use Timestamp.now() instead of serverTimestamp() for array items
      const cleanMessage: ChatMessage = {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || Timestamp.now(),
        ...(message.agentRole && { agentRole: message.agentRole })
      };
      
      const chatDocRef = this.getChatDocumentRef(userId, taskId, subtaskId, stepId);
      
      // Check if document exists
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) {
        // Create new chat document
        const newChatDocument: ChatDocument = {
          messages: [cleanMessage],
          messageCount: 1,
          lastUpdated: serverTimestamp() as Timestamp
        };
        
        await setDoc(chatDocRef, newChatDocument);
        console.log('✅ ChatService: Created new chat document with first message');
      } else {
        // Update existing document
        await updateDoc(chatDocRef, {
          messages: arrayUnion(cleanMessage),
          messageCount: increment(1),
          lastUpdated: serverTimestamp()
        });
        console.log('✅ ChatService: Added message to existing chat document');
      }
      
    } catch (error) {
      console.error('❌ ChatService: Failed to add message:', error);
      throw new Error(`Failed to add chat message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets chat summary statistics for a step
   * Used to update the main task document with chat metadata
   * 
   * @param userId - User's unique identifier
   * @param taskId - Task identifier
   * @param subtaskId - Subtask identifier
   * @param stepId - Step identifier
   * @returns Chat summary with message count and last activity
   */
  async getChatSummary(
    userId: string,
    taskId: string,
    subtaskId: string, 
    stepId: string
  ): Promise<ChatSummary | null> {
    try {
      console.log('📊 ChatService: Getting chat summary for', { userId, taskId, subtaskId, stepId });
      
      const chatDocRef = this.getChatDocumentRef(userId, taskId, subtaskId, stepId);
      const chatDoc = await getDoc(chatDocRef);
      
      if (!chatDoc.exists()) {
        console.log('📭 ChatService: No chat document found for summary');
        return null;
      }
      
      const chatData = chatDoc.data() as ChatDocument;
      
      const summary: ChatSummary = {
        chatMessageCount: chatData.messageCount || 0,
        lastChatAt: chatData.lastUpdated
      };
      
      console.log('✅ ChatService: Retrieved chat summary:', summary);
      return summary;
      
    } catch (error) {
      console.error('❌ ChatService: Failed to get chat summary:', error);
      throw new Error(`Failed to get chat summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates an initial welcome message for a new step
   * This is a convenience method to set up the first message when a user starts a step
   * 
   * @param userId - User's unique identifier
   * @param taskId - Task identifier
   * @param subtaskId - Subtask identifier
   * @param stepId - Step identifier
   * @param taskName - Name of the task for personalized welcome message
   * @param stepObjective - Objective of the step for context
   * @returns The created welcome message
   */
  async createInitialWelcomeMessage(
    userId: string,
    taskId: string,
    subtaskId: string,
    stepId: string,
    taskName: string,
    stepObjective: string
  ): Promise<UIMessage> {
    try {
      console.log('👋 ChatService: Creating initial welcome message');
      
      const welcomeMessage: Omit<ChatMessage, 'timestamp'> = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `Welcome to the task "${taskName}". How can I assist you with step "${stepObjective}"?`
      };
      
      await this.addChatMessage(userId, taskId, subtaskId, stepId, welcomeMessage);
      
      // Return as UI message
      const uiMessage: UIMessage = {
        ...welcomeMessage,
        timestamp: new Date()
      };
      
      console.log('✅ ChatService: Created initial welcome message');
      return uiMessage;
      
    } catch (error) {
      console.error('❌ ChatService: Failed to create welcome message:', error);
      throw error;
    }
  }

  /**
   * Deletes all chat messages for a specific step
   * Warning: This is destructive and should be used carefully
   * 
   * @param userId - User's unique identifier
   * @param taskId - Task identifier
   * @param subtaskId - Subtask identifier
   * @param stepId - Step identifier
   */
  async deleteChatHistory(
    userId: string,
    taskId: string,
    subtaskId: string,
    stepId: string
  ): Promise<void> {
    try {
      console.log('🗑️ ChatService: Deleting chat history for', { userId, taskId, subtaskId, stepId });
      
      const chatDocRef = this.getChatDocumentRef(userId, taskId, subtaskId, stepId);
      
      // Reset the document instead of deleting to maintain structure
      const emptyChatDocument: ChatDocument = {
        messages: [],
        messageCount: 0,
        lastUpdated: serverTimestamp() as Timestamp
      };
      
      await setDoc(chatDocRef, emptyChatDocument);
      console.log('✅ ChatService: Chat history deleted');
      
    } catch (error) {
      console.error('❌ ChatService: Failed to delete chat history:', error);
      throw new Error(`Failed to delete chat history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Tests connection to Firestore for chat operations
   * @returns boolean indicating if connection is working
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 ChatService: Testing Firestore connection...');
      
      // Create a test document reference
      const testDoc = doc(db, 'chat_messages', 'test', 'step_chats', 'connection_test');
      
      // Try to write a test document
      await setDoc(testDoc, { 
        test: true, 
        timestamp: serverTimestamp(),
        service: 'ChatService'
      });
      
      console.log('✅ ChatService: Connection test successful');
      return true;
      
    } catch (error) {
      console.error('❌ ChatService: Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();

// Debug function for browser console testing
(window as any).testChatService = async () => {
  console.log('🧪 Testing ChatService...');
  
  try {
    // Test connection
    const connected = await chatService.testConnection();
    console.log('Connection test:', connected ? '✅ Success' : '❌ Failed');
    
    // Test adding a message
    await chatService.addChatMessage(
      'test-user',
      'test-task', 
      'test-subtask',
      'test-step',
      {
        id: 'test-msg-1',
        role: 'user',
        content: 'Test message from console'
      }
    );
    console.log('✅ Test message added');
    
    // Test getting messages
    const messages = await chatService.getChatMessages('test-user', 'test-task', 'test-subtask', 'test-step');
    console.log('📥 Retrieved messages:', messages);
    
  } catch (error) {
    console.error('❌ ChatService test failed:', error);
  }
};