import React, { createContext, useState, useEffect, useContext } from 'react';

export interface Subtask {
  id: string;
  name: string;
  description: string;
  objective: string;
  expectedOutcomes: string[];
  validationCriteria: string[];
  deliverables: string[];
  estimatedTime: string;
  difficulty: string;
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
  navigateToNext: () => void;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  teamMembers: [],
  selectedTask: null,
  selectedSubtask: null,
  setSelectedTask: () => {},
  setSelectedSubtask: () => {},
  navigateToNext: () => {},
  isLoading: false,
  error: null,
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedSubtask, setSelectedSubtask] = useState<Subtask | null>(null);
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
      // Ensure every task has a subtasks array
      const safeTasks = (data.tasks || []).map((task: any) => ({
        ...task,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
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
    } else {
      setSelectedSubtask(null);
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

    // If there's a current subtask, try to move to the next subtask
    if (selectedSubtask && selectedTask.subtasks.length > 0) {
      const currentSubtaskIndex = selectedTask.subtasks.findIndex(
        subtask => subtask.id === selectedSubtask.id
      );
      
      // If there's a next subtask in the current task
      if (currentSubtaskIndex < selectedTask.subtasks.length - 1) {
        setSelectedSubtask(selectedTask.subtasks[currentSubtaskIndex + 1]);
        return;
      }
    }

    // If no more subtasks, move to the next task
    const currentTaskIndex = tasks.findIndex(task => task.id === selectedTask.id);
    if (currentTaskIndex < tasks.length - 1) {
      const nextTask = tasks[currentTaskIndex + 1];
      handleSetSelectedTask(nextTask);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        teamMembers,
        selectedTask,
        selectedSubtask,
        setSelectedTask: handleSetSelectedTask,
        setSelectedSubtask,
        navigateToNext,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};