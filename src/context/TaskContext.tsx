import React, { createContext, useState, useEffect, useContext } from 'react';

export interface Task {
  id: string;
  name: string;
  description: string;
  phase: string;
  objective: string;
  expectedOutcomes?: string[];
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
  setSelectedTask: (task: Task) => void;
  isLoading: boolean;
  error: string | null;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  teamMembers: [],
  selectedTask: null,
  setSelectedTask: () => {},
  isLoading: false,
  error: null,
});

export const useTask = () => useContext(TaskContext);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/tasks");
      const data = await response.json();
      setTasks(data.tasks);
      if (data.tasks.length > 0) {
        setSelectedTask(data.tasks[0]);
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
      const response = await fetch("http://localhost:3000/api/tasks/team-members");
      const data = await response.json();
      setTeamMembers(data.teamMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        teamMembers,
        selectedTask,
        setSelectedTask,
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};