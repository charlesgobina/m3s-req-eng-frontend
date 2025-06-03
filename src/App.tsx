import React from 'react';
import MainLayout from './components/layout/MainLayout';
import { TaskProvider } from './context/TaskContext';
import { ChatProvider } from './context/ChatContext';
import { ProjectContextProvider } from './context/ProjectContext';

function App() {
  return (
    <ProjectContextProvider>
      <TaskProvider>
        <ChatProvider>
          <MainLayout />
        </ChatProvider>
      </TaskProvider>
    </ProjectContextProvider>
  );
}

export default App;