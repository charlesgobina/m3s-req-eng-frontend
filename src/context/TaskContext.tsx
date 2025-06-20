import React, { createContext, useState, useEffect, useContext } from 'react';

export interface Subtask {
  id: string;
  name: string;
  description: string;
  steps: Steps[];
  
}

export interface Steps {
  id: string;
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
  name: string;
  description: string;
  phase: string;
  objective: string;
  subtasks: Subtask[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
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
  updateStepCompletion: (stepId: string, isCompleted: boolean, studentResponse?: string) => void;
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
  updateStepCompletion: () => {},
  isLoading: false,
  error: null,
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
  const [selectedStep, setSelectedStep] = useState<Steps | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://m3s-req-eng.onrender.com/api/tasks");
      const data = await response.json();
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
      setTasks(safeTasks);
      if (safeTasks.length > 0) {
        setSelectedTask(safeTasks[0]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("https://m3s-req-eng.onrender.com/api/tasks/team-members");
      const data = await response.json();
      setTeamMembers(data.teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleSetSelectedTask = (task: Task) => {
    setSelectedTask(task);
    if (task.subtasks.length > 0) {
      setSelectedSubtask(task.subtasks[0]);
      if (task.subtasks[0].steps && task.subtasks[0].steps.length > 0) {
        setSelectedStep(task.subtasks[0].steps[0]);
      } else {
        setSelectedStep(null);
      }
    } else {
      setSelectedSubtask(null);
      setSelectedStep(null);
    }
  };

  const updateStepCompletion = (stepId: string, isCompleted: boolean, studentResponse?: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => ({
        ...task,
        subtasks: task.subtasks.map(subtask => ({
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
        }))
      }))
    );

    // Update the selected step if it's the one being updated
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
  };

  const navigateToNext = () => {
    if (!selectedTask) return;

    // If we're on the home task, move to the first real task
    if (selectedTask.name.toLowerCase() === 'home') {
      const nextTask = tasks.find(task => task.name.toLowerCase() !== 'home');
      if (nextTask) {
        handleSetSelectedTask(nextTask);
      }
      return;
    }

    // If there's a current subtask and step, try to move to the next step
    if (selectedSubtask && selectedSubtask.steps.length > 0 && selectedStep) {
      const currentStepIndex = selectedSubtask.steps.findIndex(
        step => step.id === selectedStep.id
      );
      // If there's a next step in the current subtask
      if (currentStepIndex < selectedSubtask.steps.length - 1) {
        setSelectedStep(selectedSubtask.steps[currentStepIndex + 1]);
        return;
      }
    }

    // If no more steps, try to move to the next subtask
    if (selectedSubtask && selectedTask.subtasks.length > 0) {
      const currentSubtaskIndex = selectedTask.subtasks.findIndex(
        subtask => subtask.id === selectedSubtask.id
      );
      if (currentSubtaskIndex < selectedTask.subtasks.length - 1) {
        const nextSubtask = selectedTask.subtasks[currentSubtaskIndex + 1];
        setSelectedSubtask(nextSubtask);
        if (nextSubtask.steps && nextSubtask.steps.length > 0) {
          setSelectedStep(nextSubtask.steps[0]);
        } else {
          setSelectedStep(null);
        }
        return;
      }
    }

    // If no more subtasks, move to the next task
    const currentTaskIndex = tasks.findIndex(task => task.id === selectedTask.id);
    if (currentTaskIndex < tasks.length - 1) {
      const nextTask = tasks[currentTaskIndex + 1];
      handleSetSelectedTask(nextTask);
      if (nextTask.subtasks && nextTask.subtasks.length > 0) {
        setSelectedSubtask(nextTask.subtasks[0]);
        if (nextTask.subtasks[0].steps && nextTask.subtasks[0].steps.length > 0) {
          setSelectedStep(nextTask.subtasks[0].steps[0]);
        } else {
          setSelectedStep(null);
        }
      } else {
        setSelectedSubtask(null);
        setSelectedStep(null);
      }
    }
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
        setSelectedStep,
        setSelectedSubtask,
        navigateToNext,
        updateStepCompletion,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};