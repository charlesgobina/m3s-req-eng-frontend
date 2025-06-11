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
  isLoading: false,
  error: null,
});

export const useTask = () => useContext(TaskContext);

// Mock data with the new structure
const mockTasks: Task[] = [
  {
    id: "stakeholder_identification_analysis",
    name: "Stakeholder Identification & Analysis",
    description: "Identify and analyze all stakeholders who will be affected by or can influence the Campus Smart Dining system",
    phase: "Requirements Discovery",
    objective: "Master stakeholder identification and analysis techniques",
    subtasks: [
      {
        id: "stakeholder_identification",
        name: "Stakeholder Identification",
        description: "Identify all individuals and groups who will be affected by or can influence the system",
        objective: "Learn to systematically identify primary, secondary, and key stakeholders",
        expectedOutcomes: [
          "Comprehensive stakeholder list",
          "Stakeholder categorization (primary/secondary/key)",
          "Initial influence-interest matrix"
        ],
        validationCriteria: [
          "Identifies at least 8 different stakeholder types",
          "Covers both direct and indirect stakeholders",
          "Includes technical and business stakeholders",
          "Considers external stakeholders (parents, vendors)"
        ],
        deliverables: ["Stakeholder register", "Stakeholder map"],
        estimatedTime: "2-3 hours",
        difficulty: "Beginner",
        primaryAgent: "Stakeholder Analyst"
      },
      {
        id: "stakeholder_analysis",
        name: "Stakeholder Analysis & Prioritization",
        description: "Analyze stakeholder characteristics, needs, influence levels, and potential conflicts",
        objective: "Understand stakeholder power dynamics and prioritize engagement strategies",
        expectedOutcomes: [
          "Detailed stakeholder profiles",
          "Power-interest grid",
          "Engagement strategy matrix",
          "Conflict identification"
        ],
        validationCriteria: [
          "Accurately assesses stakeholder influence levels",
          "Identifies potential conflicts between stakeholders",
          "Proposes appropriate engagement strategies",
          "Considers stakeholder availability and expertise"
        ],
        deliverables: ["Stakeholder analysis report", "Engagement plan"],
        estimatedTime: "3-4 hours",
        difficulty: "Intermediate",
        primaryAgent: "Business Analyst"
      },
      {
        id: "persona_development",
        name: "User Persona Development",
        description: "Create detailed user personas based on stakeholder analysis",
        objective: "Learn to create representative user archetypes for requirements elicitation",
        expectedOutcomes: [
          "3-5 detailed user personas",
          "User journey maps",
          "Pain points and motivations",
          "Usage scenarios"
        ],
        validationCriteria: [
          "Personas are based on real stakeholder data",
          "Covers diverse user types and needs",
          "Includes relevant demographic and behavioral details",
          "Clearly articulates user goals and frustrations"
        ],
        deliverables: ["User persona documents", "Journey maps"],
        estimatedTime: "4-5 hours",
        difficulty: "Intermediate",
        primaryAgent: "UX Researcher"
      }
    ]
  },
  {
    id: "requirements_elicitation",
    name: "Requirements Elicitation",
    description: "Gather detailed requirements from stakeholders using various elicitation techniques",
    phase: "Requirements Discovery",
    objective: "Master different requirements elicitation techniques and their appropriate usage",
    subtasks: [
      {
        id: "interview_planning",
        name: "Interview Planning & Execution",
        description: "Plan and conduct structured interviews with key stakeholders",
        objective: "Learn to design effective interview strategies and extract valuable requirements",
        expectedOutcomes: [
          "Interview guide templates",
          "Stakeholder interview sessions",
          "Raw requirements data",
          "Interview summaries"
        ],
        validationCriteria: [
          "Develops comprehensive interview guides",
          "Conducts at least 3 different stakeholder interviews",
          "Extracts both functional and non-functional requirements",
          "Documents findings systematically"
        ],
        deliverables: ["Interview guides", "Interview transcripts", "Requirements log"],
        estimatedTime: "4-6 hours",
        difficulty: "Intermediate",
        primaryAgent: "Business Analyst"
      },
      {
        id: "workshop_facilitation",
        name: "Requirements Workshop Facilitation",
        description: "Design and facilitate collaborative requirements workshops",
        objective: "Learn to facilitate group sessions for requirements discovery and validation",
        expectedOutcomes: [
          "Workshop agenda and materials",
          "Facilitated group sessions",
          "Consensus on key requirements",
          "Workshop outcomes documentation"
        ],
        validationCriteria: [
          "Creates structured workshop agenda",
          "Facilitates productive group discussions",
          "Manages conflicting stakeholder views",
          "Achieves consensus on priority requirements"
        ],
        deliverables: ["Workshop plan", "Session notes", "Requirements consensus document"],
        estimatedTime: "5-7 hours",
        difficulty: "Advanced",
        primaryAgent: "Requirements Engineer"
      }
    ]
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Stakeholder Analyst',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    role: 'Business Analyst',
    avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '3',
    name: 'Emily Watson',
    role: 'UX Researcher',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Requirements Engineer',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTasks(mockTasks);
      if (mockTasks.length > 0) {
        setSelectedTask(mockTasks[0]);
        if (mockTasks[0].subtasks.length > 0) {
          setSelectedSubtask(mockTasks[0].subtasks[0]);
        }
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

  const handleSetSelectedTask = (task: Task) => {
    setSelectedTask(task);
    if (task.subtasks.length > 0) {
      setSelectedSubtask(task.subtasks[0]);
    } else {
      setSelectedSubtask(null);
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
        isLoading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};