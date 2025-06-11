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

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Project Planning',
    description: 'Define project scope and requirements',
    phase: 'Planning',
    objective: 'Establish clear project goals and deliverables',
    expectedOutcomes: ['Project charter', 'Requirements document', 'Timeline']
  },
  {
    id: '2',
    name: 'Design System',
    description: 'Create comprehensive design system',
    phase: 'Design',
    objective: 'Build consistent UI components and guidelines',
    expectedOutcomes: ['Component library', 'Style guide', 'Design tokens']
  },
  {
    id: '3',
    name: 'Frontend Development',
    description: 'Implement user interface components',
    phase: 'Development',
    objective: 'Build responsive and interactive frontend',
    expectedOutcomes: ['React components', 'Responsive layouts', 'User interactions']
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    role: 'Project Manager',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Bob Smith',
    role: 'UI/UX Designer',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Carol Davis',
    role: 'Frontend Developer',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Wilson',
    role: 'Backend Developer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTasks(mockTasks);
      if (mockTasks.length > 0) {
        setSelectedTask(mockTasks[0]);
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTeamMembers(mockTeamMembers);
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