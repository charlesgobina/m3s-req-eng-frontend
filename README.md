# Requirements Engineering Learning Platform

A modern, interactive web application designed to help users learn and practice requirements engineering concepts through hands-on exercises and real-time collaboration with different AI agents that assume different personna of members in a requirement engineering team.

## 🚀 Features

- **Interactive Learning Tasks**: Structured learning path with tasks and subtasks
- **Real-time Chat**: Collaborate with team members and get instant feedback
- **Exercise Validation**: Submit and validate your solutions in real-time
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Modern UI/UX**: Beautiful animations and intuitive interface

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: npm

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd m3s-req-eng-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── components/         # React components
│   ├── chat/          # Chat interface components
│   ├── exercise/      # Exercise submission components
│   ├── home/          # Home page components
│   ├── layout/        # Layout components
│   └── tasks/         # Task list components
├── context/           # React context providers
├── App.tsx           # Main application component
├── main.tsx          # Application entry point
└── index.css         # Global styles
```

## 🎯 Key Components

### Exercise Submission
- Handles user submissions and validation
- Provides real-time feedback
- Responsive design for mobile and desktop
- Animated transitions for better UX

### Chat Interface
- Real-time communication
- Message history
- Team member integration
- Rich message formatting

### Task Management
- Hierarchical task structure
- Progress tracking
- Difficulty levels
- Time estimates

## 🎨 UI/UX Features

- **Responsive Design**
  - Mobile-first approach
  - Adaptive layouts
  - Touch-friendly interactions

- **Animations**
  - Smooth transitions
  - Loading states
  - Interactive feedback

- **Accessibility**
  - Semantic HTML
  - Keyboard navigation
  - Screen reader support

## 🔧 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful comments

### Component Structure
```typescript
// Example component structure
import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = memo(({ props }) => {
  // Component logic
  return (
    // JSX
  );
});

export default Component;
```

### State Management
- Use React Context for global state
- Implement proper state updates
- Handle loading and error states

## 🧪 Testing

Run the linter:
```bash
npm run lint
```

## 📱 Mobile Considerations

- Touch-friendly interactions
- Responsive layouts
- Performance optimization
- Offline capabilities

## 🔄 Performance Optimization

- Component memoization
- Lazy loading
- Code splitting
- Asset optimization

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Preview the build:
```bash
npm run preview
```

3. Deploy to your preferred hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

[Your License]

## 👥 Team

[Team Information]

## 📞 Support

[Support Information] 