import React, { createContext, useContext } from 'react';

interface ProjectContextType {
  title: string;
  description: string;
  domain: string;
  stakeholders: string[];
  businessGoals: string[];
  constraints: string[];
  document: string;
}

interface ProjectContextProviderProps {
  projectContext?: ProjectContextType;
  children: React.ReactNode;
}

const defaultProjectContext: ProjectContextType = {
  title: "EduConnect - Online Learning Platform",
  description:
    "A comprehensive online learning management system for universities that allows students to access courses, submit assignments, participate in discussions, and track their academic progress.",
  domain: "Education Technology",
  stakeholders: [
    "Students",
    "Professors",
    "Academic Administrators",
    "IT Department",
    "University Management",
    "Parents",
    "External Examiners",
  ],
  businessGoals: [
    "Improve student engagement and learning outcomes",
    "Streamline academic administration",
    "Reduce operational costs",
    "Enable remote and hybrid learning",
    "Provide comprehensive academic analytics",
  ],
  constraints: [
    "Must integrate with existing student information system",
    "FERPA compliance required",
    "Maximum 3-second page load time",
    "Support for 10,000+ concurrent users",
    "Budget constraint of $500,000",
    "Must be deployed within 12 months",
  ],
  document: `
EDUCONNECT PROJECT SPECIFICATION

Overview:
EduConnect is designed to revolutionize how universities deliver education by providing a unified platform for all academic activities. The system will replace multiple disconnected tools currently used by the university.

Key Features Required:
1. Course Management - Professors can create courses, upload materials, manage enrollment
2. Assignment System - Students submit work, professors grade and provide feedback
3. Discussion Forums - Course-specific and general discussion areas
4. Progress Tracking - Real-time academic progress for students and advisors
5. Mobile Access - Full functionality available on mobile devices
6. Integration APIs - Connect with library systems, payment systems, and SIS

User Scenarios:
- Sarah, a freshman, logs in to check her course schedule and upcoming assignments
- Professor Johnson uploads lecture materials and creates a new assignment
- Academic advisor reviews student progress reports before advising meetings
- IT administrator monitors system performance and manages user accounts

Technical Requirements:
- Web-based application with mobile responsive design
- Single sign-on integration with university authentication
- Real-time notifications and updates
- Robust backup and disaster recovery
- Accessibility compliance (WCAG 2.1 AA)
  `,
};

const ProjectContextContext = createContext<{ projectContext: ProjectContextType }>({
  projectContext: defaultProjectContext,
});

export const useProjectContext = () => useContext(ProjectContextContext);

export const ProjectContextProvider: React.FC<ProjectContextProviderProps> = ({
  projectContext = defaultProjectContext,
  children,
}) => {
  return (
    <ProjectContextContext.Provider value={{ projectContext }}>
      {children}
    </ProjectContextContext.Provider>
  );
};