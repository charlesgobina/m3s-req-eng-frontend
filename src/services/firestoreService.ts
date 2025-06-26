import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task, Subtask, Steps } from '../context/TaskContext';

// Enhanced interfaces for Firestore
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
  agentRole?: string;
}

export interface FirestoreStep extends Steps {
  // New hybrid format: no chatMessages array, only summary fields
  chatMessageCount: number;
  lastChatAt: Timestamp | null;
  lastActivityAt?: Timestamp;
}

export interface FirestoreSubtask extends Omit<Subtask, 'steps'> {
  steps: { [stepId: string]: FirestoreStep }; // Back to object format
}

export interface UserTaskProgress extends Omit<Task, 'subtasks'> {
  subtasks: { [subtaskId: string]: FirestoreSubtask }; // Back to object format
  currentPosition: {
    subtaskId: string | null;
    stepId: string | null;
    lastActiveAt: Timestamp;
  };
  updatedAt: Timestamp;
}

export class FirestoreService {
  // Test Firestore connection
  async testConnection(): Promise<boolean> {
    try {
      console.log('🔥 Testing Firestore connection...');
      const testDoc = doc(db, 'test', 'connection');
      await setDoc(testDoc, { timestamp: new Date(), test: true });
      console.log('✅ Firestore connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection test failed:', error);
      return false;
    }
  }

  // Get user's task progress
  async getUserTaskProgress(userId: string, taskId: string): Promise<UserTaskProgress | null> {
    try {
      const docRef = doc(db, 'user_progress', userId, 'tasks', taskId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserTaskProgress;
      }
      return null;
    } catch (error) {
      console.error('Error getting user task progress:', error);
      throw error;
    }
  }

  // Initialize user task progress (first time)
  async initializeUserTaskProgress(userId: string, task: Task): Promise<void> {
    console.log('🔥 FirestoreService: Initializing user task progress', { userId, taskId: task.id });
    try {
      // Convert task structure to Firestore format - using objects
      const firestoreSubtasks: { [subtaskId: string]: FirestoreSubtask } = {};
      
      task.subtasks.forEach(subtask => {
        const firestoreSteps: { [stepId: string]: FirestoreStep } = {};
        
        subtask.steps.forEach(step => {
          firestoreSteps[step.id] = {
            ...step,
            // New hybrid format: no chatMessages array, only summary fields
            chatMessageCount: 0,
            lastChatAt: null,
            lastActivityAt: serverTimestamp() as Timestamp
          };
        });
        
        firestoreSubtasks[subtask.id] = {
          ...subtask,
          steps: firestoreSteps
        };
      });

      const userTaskProgress: UserTaskProgress = {
        ...task,
        subtasks: firestoreSubtasks,
        currentPosition: {
          subtaskId: task.subtasks[0]?.id || null,
          stepId: task.subtasks[0]?.steps[0]?.id || null,
          lastActiveAt: serverTimestamp() as Timestamp
        },
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = doc(db, 'user_progress', userId, 'tasks', task.id);
      console.log('🔥 FirestoreService: Writing to Firestore path:', docRef.path);
      console.log('🔥 FirestoreService: Data to write:', JSON.stringify(userTaskProgress, null, 2));
      
      await setDoc(docRef, userTaskProgress);
      console.log('✅ FirestoreService: Successfully initialized user task progress');
    } catch (error) {
      console.error('Error initializing user task progress:', error);
      throw error;
    }
  }

  // Update current position (for resumability)
  async updateCurrentPosition(
    userId: string, 
    taskId: string, 
    subtaskId: string, 
    stepId: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'user_progress', userId, 'tasks', taskId);
      await updateDoc(docRef, {
        'currentPosition.subtaskId': subtaskId,
        'currentPosition.stepId': stepId,
        'currentPosition.lastActiveAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating current position:', error);
      throw error;
    }
  }

  // Update step completion
  async updateStepCompletion(
    userId: string,
    taskId: string,
    subtaskId: string,
    stepId: string,
    isCompleted: boolean,
    studentResponse?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'user_progress', userId, 'tasks', taskId);
      const updateData: any = {
        [`subtasks.${subtaskId}.steps.${stepId}.isCompleted`]: isCompleted,
        [`subtasks.${subtaskId}.steps.${stepId}.lastActivityAt`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (studentResponse) {
        updateData[`subtasks.${subtaskId}.steps.${stepId}.studentResponse`] = studentResponse;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating step completion:', error);
      throw error;
    }
  }

  // DEPRECATED: Old addChatMessage method - now handled by ChatService
  // This method is kept for backwards compatibility but should not be used
  async addChatMessage(
    userId: string,
    taskId: string,
    subtaskId: string,
    stepId: string,
    message: Omit<ChatMessage, 'timestamp'> & { timestamp?: Timestamp }
  ): Promise<void> {
    console.warn('⚠️ FirestoreService.addChatMessage is deprecated. Use ChatService.addChatMessage instead.');
    
    // For now, we'll just update the chat summary in the main document
    try {
      const docRef = doc(db, 'user_progress', userId, 'tasks', taskId);
      
      const updateData = {
        [`subtasks.${subtaskId}.steps.${stepId}.chatMessageCount`]: 1, // Just increment by 1
        [`subtasks.${subtaskId}.steps.${stepId}.lastChatAt`]: serverTimestamp(),
        [`subtasks.${subtaskId}.steps.${stepId}.lastActivityAt`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      console.log('✅ FirestoreService: Updated chat summary (deprecated method)');
    } catch (error) {
      console.error('Error updating chat summary:', error);
      throw error;
    }
  }

  // Convert Task object to step status map for easy lookup
  static getStepStatusMap(task: UserTaskProgress): { [stepId: string]: boolean } {
    const stepStatusMap: { [stepId: string]: boolean } = {};
    
    Object.values(task.subtasks).forEach(subtask => {
      Object.values(subtask.steps).forEach(step => {
        stepStatusMap[step.id] = step.isCompleted;
      });
    });
    
    return stepStatusMap;
  }

  // Convert Firestore format back to current Task format with proper ordering
  static convertToTaskFormat(firestoreTask: UserTaskProgress): Task {
    // Convert subtasks from object to array and sort by subtaskNumber
    const subtasks: Subtask[] = Object.values(firestoreTask.subtasks)
      .sort((a, b) => (a.subtaskNumber || 0) - (b.subtaskNumber || 0))
      .map(subtask => ({
        ...subtask,
        // Convert steps from object to array and sort by stepNumber
        steps: Object.values(subtask.steps)
          .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0))
          .map(step => ({
            id: step.id,
            step: step.step,
            objective: step.objective,
            isCompleted: step.isCompleted,
            studentResponse: step.studentResponse,
            validationCriteria: step.validationCriteria,
            deliverables: step.deliverables,
            primaryAgent: step.primaryAgent
          }))
      }));

    return {
      id: firestoreTask.id,
      name: firestoreTask.name,
      description: firestoreTask.description,
      phase: firestoreTask.phase,
      objective: firestoreTask.objective,
      subtasks
    };
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();