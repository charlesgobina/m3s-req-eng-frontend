import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { apiService } from '../services/apiService';
import { firestoreService, FirestoreService } from '../services/firestoreService';

export interface Subtask {
  id: string;
  subtaskNumber: number;
  name: string;
  description: string;
  steps: Steps[];
}

export interface Steps {
  id: string;
  stepNumber: number;
  step: string;
  objective: string;
  isCompleted: boolean;
  studentResponse: string;
  validationCriteria: string[];
  deliverables: string[];
  primaryAgent: string;
}

export interface Task {
  id: string;
  taskNumber: number;
  name: string;
  description: string;
  phase: string;
  objective: string;
  subtasks: Subtask[];
}

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  personality: string;
  expertise: string[];
  communicationStyle: string;
  workApproach: string;
  preferredFrameworks: string[];
  detailedPersona: string;
  imageUrl?: string;
}

interface TaskStore {
  // State
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedTask: Task | null;
  selectedSubtask: Subtask | null;
  selectedStep: Steps | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedTask: (task: Task) => Promise<void>;
  setSelectedSubtask: (subtask: Subtask) => void;
  setSelectedStep: (step: Steps) => void;
  navigateToNext: () => Promise<void>;
  updateStepCompletion: (stepId: string, isCompleted: boolean, studentResponse?: string) => Promise<void>;
  
  // Utility functions
  isStepAccessible: (stepId: string) => boolean;
  getStepStatus: (stepId: string) => 'completed' | 'current' | 'locked';
  getFurthestProgress: () => { subtaskId: string | null; stepId: string | null };
  getCurrentAgent: () => TeamMember | null;
  
  // Data fetching
  fetchTasks: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  initialize: () => Promise<void>;
  
  // Internal state setters
  setTasks: (tasks: Task[]) => void;
  setTeamMembers: (teamMembers: TeamMember[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateCurrentPosition: (targetSubtaskId: string, targetStepId: string) => Promise<void>;
  resumeUserPosition: (tasksWithProgress: Task[]) => Promise<void>;
}

export const useTaskStore = create<TaskStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    tasks: [],
    teamMembers: [],
    selectedTask: null,
    selectedSubtask: null,
    selectedStep: null,
    isLoading: false,
    error: null,

    // State setters
    setTasks: (tasks) => set({ tasks }),
    setTeamMembers: (teamMembers) => set({ teamMembers }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    // Initialize the store (called when user is authenticated)
    initialize: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      
      if (isAuthenticated) {
        // Test Firestore connection first
        firestoreService.testConnection().then(success => {
          if (success) {
            console.log('✅ Firestore is working, proceeding with task fetch');
          } else {
            console.log('❌ Firestore connection failed');
          }
        });
        
        await get().fetchTasks();
        await get().fetchTeamMembers();
      }
    },

    fetchTasks: async () => {
      const { user } = useAuthStore.getState();
      set({ isLoading: true });
      
      try {
        // First, get tasks from backend API
        const response = await apiService.authenticatedRequest('/api/tasks');
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch tasks');
        }
        
        const data = response.data;
        
        // Ensure every task has a subtasks array and each subtask has a steps array
        const safeTasks = (data.tasks || []).map((task: any) => ({
          ...task,
          subtasks: Array.isArray(task.subtasks)
            ? task.subtasks.map((subtask: any) => ({
                ...subtask,
                steps: Array.isArray(subtask.steps) ? subtask.steps : [],
              }))
            : [],
        }));

        // Now try to load user progress from Firestore and merge
        const tasksWithProgress = await Promise.all(
          safeTasks.map(async (task: Task) => {
            try {
              if (user?.id) {
                const userProgress = await firestoreService.getUserTaskProgress(user.id, task.id);
                
                if (userProgress) {
                  // Convert Firestore format back to current Task format with progress
                  return FirestoreService.convertToTaskFormat(userProgress);
                } else {
                  // Initialize in Firestore for first time
                  await firestoreService.initializeUserTaskProgress(user.id, task);
                }
              }
              return task;
            } catch (error) {
              console.warn(`Failed to load progress for task ${task.id}:`, error);
              return task; // Fall back to task without progress
            }
          })
        );
        
        set({ tasks: tasksWithProgress });
        
        // Try to resume user's last position
        if (tasksWithProgress.length > 0 && user?.id) {
          await get().resumeUserPosition(tasksWithProgress);
        } else if (tasksWithProgress.length > 0) {
          set({ selectedTask: tasksWithProgress[0] });
        }
        
        set({ error: null });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        set({ error: "Failed to load tasks. Please check your authentication." });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchTeamMembers: async () => {
      try {
        // Use the apiService for authenticated requests
        const response = await apiService.authenticatedRequest('/api/tasks/team-members');
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch team members');
        }
        
        const data = response.data as { teamMembers: TeamMember[] };
        set({ teamMembers: data.teamMembers || [] });
      } catch (error) {
        console.error("Error fetching team members:", error);
        // Team members might be less critical, so we don't set a blocking error
      }
    },

    // Resume user to their last position
    resumeUserPosition: async (tasksWithProgress: Task[]) => {
      const { user } = useAuthStore.getState();
      
      try {
        if (!user?.id) return;

        // Look for a task with progress
        for (const task of tasksWithProgress) {
          const userProgress = await firestoreService.getUserTaskProgress(user.id, task.id);
          
          if (userProgress && userProgress.currentPosition.stepId) {
            const { subtaskId, stepId } = userProgress.currentPosition;
            
            // Find the actual objects
            const subtask = task.subtasks.find(s => s.id === subtaskId);
            const step = subtask?.steps.find(s => s.id === stepId);
            
            if (subtask && step) {
              set({
                selectedTask: task,
                selectedSubtask: subtask,
                selectedStep: step
              });
              return;
            }
          }
        }
        
        // If no progress found, start with first task
        if (tasksWithProgress.length > 0) {
          set({ selectedTask: tasksWithProgress[0] });
        }
      } catch (error) {
        console.warn('Failed to resume user position:', error);
        // Fall back to first task
        if (tasksWithProgress.length > 0) {
          set({ selectedTask: tasksWithProgress[0] });
        }
      }
    },

    setSelectedTask: async (task: Task) => {
      const { user } = useAuthStore.getState();
      
      set({
        selectedTask: task,
        selectedSubtask: null,
        selectedStep: null
      });
      
      // Try to resume user's actual progress from Firestore
      if (user?.id) {
        try {
          const userProgress = await firestoreService.getUserTaskProgress(user.id, task.id);
          
          if (userProgress && userProgress.currentPosition.stepId) {
            const { subtaskId, stepId } = userProgress.currentPosition;
            
            // Find the actual objects
            const subtask = task.subtasks.find(s => s.id === subtaskId);
            const step = subtask?.steps.find(s => s.id === stepId);
            
            if (subtask && step) {
              set({
                selectedSubtask: subtask,
                selectedStep: step
              });
              return; // Successfully resumed, don't fall back to first step
            }
          }
        } catch (error) {
          console.warn('Failed to load user progress, falling back to first step:', error);
        }
      }
      
      // Fallback: Auto-select first subtask and step if no progress found
      if (task.subtasks && task.subtasks.length > 0) {
        const firstSubtask = task.subtasks[0];
        set({ selectedSubtask: firstSubtask });
        
        if (firstSubtask.steps && firstSubtask.steps.length > 0) {
          set({ selectedStep: firstSubtask.steps[0] });
          
          // Only update Firestore position if we're falling back to first step
          if (user?.id) {
            get().updateCurrentPosition(
              firstSubtask.id, 
              firstSubtask.steps[0].id
            ).catch(error => {
              console.warn('Failed to update position in Firestore:', error);
            });
          }
        }
      }
    },

    setSelectedSubtask: (subtask) => set({ selectedSubtask: subtask }),

    setSelectedStep: (step) => {
      const { isStepAccessible } = get();
      
      // Only allow navigation to accessible steps
      if (!isStepAccessible(step.id)) {
        return;
      }
      set({ selectedStep: step });
    },

    updateStepCompletion: async (stepId: string, isCompleted: boolean, studentResponse?: string) => {
      const { selectedTask, selectedSubtask, selectedStep, tasks } = get();
      const { user } = useAuthStore.getState();

      // Update the selected step directly
      if (selectedStep && selectedStep.id === stepId) {
        set({
          selectedStep: {
            ...selectedStep,
            isCompleted,
            studentResponse: studentResponse || selectedStep.studentResponse
          }
        });
      }

      // Update the selected subtask to reflect the changes
      if (selectedSubtask) {
        const updatedSubtask = {
          ...selectedSubtask,
          steps: selectedSubtask.steps.map(step => 
            step.id === stepId 
              ? { 
                  ...step, 
                  isCompleted, 
                  studentResponse: studentResponse || step.studentResponse 
                }
              : step
          )
        };
        set({ selectedSubtask: updatedSubtask });
      }

      // Update the main tasks array as well (important for status functions)
      if (selectedTask) {
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id 
            ? {
                ...task,
                subtasks: task.subtasks.map(subtask => 
                  subtask.id === selectedSubtask?.id
                    ? {
                        ...subtask,
                        steps: subtask.steps.map(step => 
                          step.id === stepId 
                            ? { 
                                ...step, 
                                isCompleted, 
                                studentResponse: studentResponse || step.studentResponse 
                              }
                            : step
                        )
                      }
                    : subtask
                )
              }
            : task
        );
        set({ tasks: updatedTasks });
      }

      // Update in Firestore
      if (user?.id && selectedTask && selectedSubtask) {
        try {
          await firestoreService.updateStepCompletion(
            user.id,
            selectedTask.id,
            selectedSubtask.id,
            stepId,
            isCompleted,
            studentResponse
          );
        } catch (error) {
          console.error('Failed to update step completion in Firestore:', error);
        }
      }
    },

    navigateToNext: async () => {
      const { selectedTask, selectedStep, selectedSubtask, tasks, updateCurrentPosition } = get();
      const { user } = useAuthStore.getState();

      if (!selectedTask || !selectedStep || !selectedSubtask || !user?.id) return;

      // Follow chronological order: find the next step after current step
      const currentSubtaskIndex = selectedTask.subtasks.findIndex(s => s.id === selectedSubtask.id);
      const currentStepIndex = selectedSubtask.steps.findIndex(s => s.id === selectedStep.id);
      
      // Try next step in current subtask
      if (currentStepIndex < selectedSubtask.steps.length - 1) {
        const nextStep = selectedSubtask.steps[currentStepIndex + 1];
        
        // Update Firestore position first
        await updateCurrentPosition(selectedSubtask.id, nextStep.id);
        
        // Then update local state
        set({ selectedStep: nextStep });
        return;
      }

      // Try first step of next subtask
      if (currentSubtaskIndex < selectedTask.subtasks.length - 1) {
        const nextSubtask = selectedTask.subtasks[currentSubtaskIndex + 1];
        if (nextSubtask.steps.length > 0) {
          const firstStepOfNextSubtask = nextSubtask.steps[0];
          
          // Update Firestore position first
          await updateCurrentPosition(nextSubtask.id, firstStepOfNextSubtask.id);
          
          // Then update local state
          set({
            selectedSubtask: nextSubtask,
            selectedStep: firstStepOfNextSubtask
          });
          return;
        }
      }

      // Try first task if on home task
      if (selectedTask.name.toLowerCase() === 'home') {
        const nextTask = tasks.find(task => task.name.toLowerCase() !== 'home');
        if (nextTask && nextTask.subtasks.length > 0 && nextTask.subtasks[0].steps.length > 0) {
          await get().setSelectedTask(nextTask);
          return;
        }
      }

      // Try next task
      const currentTaskIndex = tasks.findIndex(task => task.id === selectedTask.id);
      if (currentTaskIndex < tasks.length - 1) {
        const nextTask = tasks[currentTaskIndex + 1];
        if (nextTask.subtasks.length > 0 && nextTask.subtasks[0].steps.length > 0) {
          await get().setSelectedTask(nextTask);
          return;
        }
      }
    },

    // Get the furthest progress point from completed steps
    getFurthestProgress: (): { subtaskId: string | null; stepId: string | null } => {
      const { selectedTask } = get();
      
      if (!selectedTask) return { subtaskId: null, stepId: null };

      // Find the furthest completed step
      for (const subtask of selectedTask.subtasks) {
        for (const step of subtask.steps) {
          if (!step.isCompleted) {
            // This is the first uncompleted step, so it's the current furthest point
            return { subtaskId: subtask.id, stepId: step.id };
          }
        }
      }

      // All steps are completed, return the last step
      if (selectedTask.subtasks.length > 0) {
        const lastSubtask = selectedTask.subtasks[selectedTask.subtasks.length - 1];
        if (lastSubtask.steps.length > 0) {
          const lastStep = lastSubtask.steps[lastSubtask.steps.length - 1];
          return { subtaskId: lastSubtask.id, stepId: lastStep.id };
        }
      }

      return { subtaskId: null, stepId: null };
    },

    // Check if a step is accessible (completed or is current/next available step)
    isStepAccessible: (stepId: string): boolean => {
      const { selectedTask, tasks } = get();
      
      if (!selectedTask) return false;

      // Find the step from the main tasks array (same source that gets updated)
      let targetStep: Steps | null = null;
      let targetSubtask: Subtask | null = null;
      const currentTask = tasks.find(task => task.id === selectedTask.id);
      
      if (currentTask) {
        for (const subtask of currentTask.subtasks) {
          for (const step of subtask.steps) {
            if (step.id === stepId) {
              targetStep = step;
              targetSubtask = subtask;
              break;
            }
          }
          if (targetStep) break;
        }
      }
      
      // Fallback to selectedTask if not found in main tasks array
      if (!targetStep) {
        for (const subtask of selectedTask.subtasks) {
          for (const step of subtask.steps) {
            if (step.id === stepId) {
              targetStep = step;
              targetSubtask = subtask;
              break;
            }
          }
          if (targetStep) break;
        }
      }

      if (!targetStep || !targetSubtask) return false;

      // If step is completed, it's always accessible
      if (targetStep.isCompleted) return true;

      // First step is always accessible
      if (selectedTask.subtasks.length > 0 && 
          selectedTask.subtasks[0].steps.length > 0 && 
          selectedTask.subtasks[0].steps[0].id === stepId) {
        return true;
      }

      // Check if this step is accessible based on completed previous steps
      const furthestProgress = get().getFurthestProgress();
      return furthestProgress.stepId === stepId;
    },

    // Get visual status of a step
    getStepStatus: (stepId: string): 'completed' | 'current' | 'locked' => {
      const { selectedTask, selectedStep, tasks } = get();
      
      if (!selectedTask) return 'locked';

      // Find the step from the main tasks array (same source that gets updated)
      let targetStep: Steps | null = null;
      const currentTask = tasks.find(task => task.id === selectedTask.id);
      
      if (currentTask) {
        for (const subtask of currentTask.subtasks) {
          for (const step of subtask.steps) {
            if (step.id === stepId) {
              targetStep = step;
              break;
            }
          }
          if (targetStep) break;
        }
      }
      
      // Fallback to selectedTask if not found in main tasks array
      if (!targetStep) {
        for (const subtask of selectedTask.subtasks) {
          for (const step of subtask.steps) {
            if (step.id === stepId) {
              targetStep = step;
              break;
            }
          }
          if (targetStep) break;
        }
      }

      if (!targetStep) return 'locked';

      if (targetStep.isCompleted) return 'completed';
      
      // If this is the currently selected step, it's current
      if (selectedStep && selectedStep.id === stepId) return 'current';
      
      const furthestProgress = get().getFurthestProgress();
      if (furthestProgress.stepId === stepId) return 'current';
      
      return 'locked';
    },

    // Update current position to where user is moving
    updateCurrentPosition: async (targetSubtaskId: string, targetStepId: string) => {
      const { selectedTask } = get();
      const { user } = useAuthStore.getState();

      if (!user?.id || !selectedTask) return;

      try {
        await firestoreService.updateCurrentPosition(
          user.id,
          selectedTask.id,
          targetSubtaskId,
          targetStepId
        );
      } catch (error) {
        console.warn('Failed to update current position in Firestore:', error);
      }
    },

    // Get current step's agent details
    getCurrentAgent: (): TeamMember | null => {
      const { selectedStep, teamMembers } = get();
      
      if (!selectedStep || !teamMembers.length) return null;
      
      return teamMembers.find(member => member.role === selectedStep.primaryAgent) || null;
    },
  }))
);

// Subscribe to auth changes and initialize/cleanup accordingly
useAuthStore.subscribe(
  (state) => state.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      useTaskStore.getState().initialize();
    } else {
      // Clear task state when user logs out
      useTaskStore.setState({
        tasks: [],
        teamMembers: [],
        selectedTask: null,
        selectedSubtask: null,
        selectedStep: null,
        isLoading: false,
        error: null,
      });
    }
  }
);