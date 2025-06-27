// src/context/TaskContext.tsx - Updated with authentication and Firestore
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuthStore } from '../stores/authStore';
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

interface TaskContextType {
  tasks: Task[];
  teamMembers: TeamMember[];
  selectedTask: Task | null;
  selectedSubtask: Subtask | null;
  setSelectedTask: (task: Task) => void;
  setSelectedSubtask: (subtask: Subtask) => void;
  selectedStep: Steps | null;
  setSelectedStep: (step: Steps) => void;
  navigateToNext: () => void;
  updateStepCompletion: (stepId: string, isCompleted: boolean, studentResponse?: string) => Promise<void>;
  isStepAccessible: (stepId: string) => boolean;
  getStepStatus: (stepId: string) => 'completed' | 'current' | 'locked';
  getFurthestProgress: () => { subtaskId: string | null; stepId: string | null };
  getCurrentAgent: () => TeamMember | null;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  teamMembers: [],
  selectedTask: null,
  selectedSubtask: null,
  setSelectedTask: () => {},
  setSelectedStep: () => {},
  selectedStep: null,
  setSelectedSubtask: () => {},
  navigateToNext: () => {},
  updateStepCompletion: async () => {},
  isStepAccessible: () => false,
  getStepStatus: () => 'locked',
  getFurthestProgress: () => ({ subtaskId: null, stepId: null }),
  getCurrentAgent: () => null,
  isLoading: false,
  error: null,
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [selectedStep, setSelectedStep] = useState<Steps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Only fetch tasks when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Test Firestore connection first
      firestoreService.testConnection().then(success => {
        if (success) {
          console.log('✅ Firestore is working, proceeding with task fetch');
        } else {
          console.log('❌ Firestore connection failed');
        }
      });
      
      fetchTasks();
      fetchTeamMembers();
    }
  }, [isAuthenticated]);

  const fetchTasks = async () => {
    setIsLoading(true);
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
      // console.log('🔍 Current user:', user);
      const tasksWithProgress = await Promise.all(
        safeTasks.map(async (task: Task) => {
          try {
            if (user?.id) {
              // console.log(`🔍 Loading progress for user ${user.id}, task ${task.id}`);
              const userProgress = await firestoreService.getUserTaskProgress(user.id, task.id);
              
              if (userProgress) {
                // Convert Firestore format back to current Task format with progress
                return FirestoreService.convertToTaskFormat(userProgress);
              } else {
                // Initialize in Firestore for first time
                // console.log(`🔥 Initializing Firestore for user ${user.id}, task ${task.id}`);
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
      
      setTasks(tasksWithProgress);
      
      // Try to resume user's last position
      if (tasksWithProgress.length > 0 && user?.id) {
        await resumeUserPosition(tasksWithProgress);
      } else if (tasksWithProgress.length > 0) {
        setSelectedTask(tasksWithProgress[0]);
      }
      
      setError(null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please check your authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Use the apiService for authenticated requests
      const response = await apiService.authenticatedRequest('/api/tasks/team-members');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch team members');
      }
      
      const data = response.data as { teamMembers: TeamMember[] };
      setTeamMembers(data.teamMembers || []);
    } catch (error) {
      console.error("Error fetching team members:", error);
      // Team members might be less critical, so we don't set a blocking error
    }
  };

  // Resume user to their last position
  const resumeUserPosition = async (tasksWithProgress: Task[]) => {
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
            setSelectedTask(task);
            setSelectedSubtask(subtask);
            setSelectedStep(step);
            // console.log(`Resumed user to: ${task.name} -> ${subtask.name} -> ${step.objective}`);
            return;
          }
        }
      }
      
      // If no progress found, start with first task
      if (tasksWithProgress.length > 0) {
        setSelectedTask(tasksWithProgress[0]);
      }
    } catch (error) {
      console.warn('Failed to resume user position:', error);
      // Fall back to first task
      if (tasksWithProgress.length > 0) {
        setSelectedTask(tasksWithProgress[0]);
      }
    }
  };

  const handleSetSelectedTask = async (task: Task) => {
    setSelectedTask(task);
    // Clear previous subtask and step selections when switching tasks
    setSelectedSubtask(null);
    setSelectedStep(null);
    
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
            setSelectedSubtask(subtask);
            setSelectedStep(step);
            // console.log(`Resumed to: ${task.name} -> ${subtask.name} -> ${step.objective}`);
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
      setSelectedSubtask(firstSubtask);
      if (firstSubtask.steps && firstSubtask.steps.length > 0) {
        setSelectedStep(firstSubtask.steps[0]);
        
        // Only update Firestore position if we're falling back to first step
        if (user?.id) {
          firestoreService.updateCurrentPosition(
            user.id, 
            task.id, 
            firstSubtask.id, 
            firstSubtask.steps[0].id
          ).catch(error => {
            console.warn('Failed to update position in Firestore:', error);
          });
        }
      }
    }
  };

  const updateStepCompletion = async (stepId: string, isCompleted: boolean, studentResponse?: string) => {
    // console.log(`🔄 updateStepCompletion called: stepId=${stepId}, isCompleted=${isCompleted}`);
    
    // Update the selected step directly
    if (selectedStep && selectedStep.id === stepId) {
      setSelectedStep(prev => prev ? {
        ...prev,
        isCompleted,
        studentResponse: studentResponse || prev.studentResponse
      } : null);
    }

    // Update the selected subtask to reflect the changes
    if (selectedSubtask) {
      setSelectedSubtask(prev => prev ? {
        ...prev,
        steps: prev.steps.map(step => 
          step.id === stepId 
            ? { 
                ...step, 
                isCompleted, 
                studentResponse: studentResponse || step.studentResponse 
              }
            : step
        )
      } : null);
    }

    // Update the main tasks array as well (important for status functions)
    if (selectedTask) {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
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
        // console.log(`✅ Updated tasks array for step ${stepId}:`, updatedTasks.find(t => t.id === selectedTask.id)?.subtasks.find(s => s.id === selectedSubtask?.id)?.steps.find(st => st.id === stepId)?.isCompleted);
        return updatedTasks;
      });
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
        
        
        // Don't advance progress position here - let the next button do it
      } catch (error) {
        console.error('Failed to update step completion in Firestore:', error);
      }
    }
  };

  const navigateToNext = async () => {
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
      setSelectedStep(nextStep);
      
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
        setSelectedSubtask(nextSubtask);
        setSelectedStep(firstStepOfNextSubtask);
        
        return;
      }
    }

    // Try first task if on home task
    if (selectedTask.name.toLowerCase() === 'home') {
      const nextTask = tasks.find(task => task.name.toLowerCase() !== 'home');
      if (nextTask && nextTask.subtasks.length > 0 && nextTask.subtasks[0].steps.length > 0) {
        const firstStep = nextTask.subtasks[0].steps[0];
        handleSetSelectedTask(nextTask);
        return;
      }
    }

    // Try next task
    const currentTaskIndex = tasks.findIndex(task => task.id === selectedTask.id);
    if (currentTaskIndex < tasks.length - 1) {
      const nextTask = tasks[currentTaskIndex + 1];
      if (nextTask.subtasks.length > 0 && nextTask.subtasks[0].steps.length > 0) {
        const firstStep = nextTask.subtasks[0].steps[0];
        handleSetSelectedTask(nextTask);
        return;
      }
    }
  };

  // Set selected step without updating Firestore position (only for UI navigation)
  const handleSetSelectedStep = (step: Steps) => {
    // Only allow navigation to accessible steps
    if (!isStepAccessible(step.id)) {
      return;
    }
    setSelectedStep(step);
  };

  // Get the furthest progress point from completed steps
  const getFurthestProgress = (): { subtaskId: string | null; stepId: string | null } => {
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
  };

  // Check if a step is accessible (completed or is current/next available step)
  const isStepAccessible = (stepId: string): boolean => {
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
    const furthestProgress = getFurthestProgress();
    return furthestProgress.stepId === stepId;
  };

  // Get visual status of a step
  const getStepStatus = (stepId: string): 'completed' | 'current' | 'locked' => {
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

    // console.log(`🔍 getStepStatus for ${stepId}: found step with isCompleted=${targetStep.isCompleted}, task=${selectedTask?.id}, subtask=${targetStep ? Object.values(selectedTask?.subtasks || []).find(s => s.steps.find(st => st.id === stepId))?.id : 'not found'}`);

    if (targetStep.isCompleted) return 'completed';
    
    // If this is the currently selected step, it's current
    if (selectedStep && selectedStep.id === stepId) return 'current';
    
    const furthestProgress = getFurthestProgress();
    if (furthestProgress.stepId === stepId) return 'current';
    
    return 'locked';
  };

  // Update current position to where user is moving
  const updateCurrentPosition = async (targetSubtaskId: string, targetStepId: string) => {
    if (!user?.id || !selectedTask) return;

    try {
      await firestoreService.updateCurrentPosition(
        user.id,
        selectedTask.id,
        targetSubtaskId,
        targetStepId
      );
      // console.log(`Updated current position to: ${targetSubtaskId} -> ${targetStepId}`);
    } catch (error) {
      console.warn('Failed to update current position in Firestore:', error);
    }
  };

  // Get current step's agent details
  const getCurrentAgent = (): TeamMember | null => {
    if (!selectedStep || !teamMembers.length) return null;
    
    return teamMembers.find(member => member.role === selectedStep.primaryAgent) || null;
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        teamMembers,
        selectedTask,
        selectedSubtask,
        selectedStep,
        setSelectedTask: handleSetSelectedTask,
        setSelectedStep: handleSetSelectedStep,
        setSelectedSubtask,
        navigateToNext,
        updateStepCompletion,
        isStepAccessible,
        getStepStatus,
        getFurthestProgress,
        getCurrentAgent,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};