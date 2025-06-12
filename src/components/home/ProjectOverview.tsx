import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Target, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Building,
  Clock,
  DollarSign
} from 'lucide-react';
import { useProjectContext } from '../../context/ProjectContext';
import { useTask } from '../../context/TaskContext';

const ProjectOverview: React.FC = () => {
  const { projectContext } = useProjectContext();
  const { navigateToNext } = useTask();

  const handleGetStarted = () => {
    navigateToNext();
  };

  return (
    <motion.div 
      className="flex-1 bg-white overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to Requirements Engineering
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Learn the fundamentals of requirements engineering through hands-on practice with a real-world project
          </p>
        </motion.div>

        {/* Project Information */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center mb-6">
            <Building className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-slate-800">Project Overview</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">
                {projectContext.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {projectContext.description}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-slate-700">Domain</span>
              </div>
              <p className="text-slate-600">{projectContext.domain}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Information Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Stakeholders */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-800">Stakeholders</h3>
            </div>
            <div className="space-y-2">
              {projectContext.stakeholders.map((stakeholder, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center py-2 px-3 bg-green-50 rounded-lg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-slate-700">{stakeholder}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Business Goals */}
          <motion.div 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-800">Business Goals</h3>
            </div>
            <div className="space-y-2">
              {projectContext.businessGoals.map((goal, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start py-2 px-3 bg-blue-50 rounded-lg"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                  <span className="text-slate-700">{goal}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Constraints */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
            <h3 className="text-lg font-semibold text-slate-800">Project Constraints</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {projectContext.constraints.map((constraint, index) => (
              <motion.div 
                key={index}
                className="flex items-start py-3 px-4 bg-amber-50 rounded-lg border border-amber-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
              >
                <AlertTriangle className="w-4 h-4 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 text-sm">{constraint}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Project Document Preview */}
        <motion.div 
          className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-slate-600 mr-3" />
            <h3 className="text-lg font-semibold text-slate-800">Project Documentation</h3>
          </div>
          <div className="bg-white rounded-lg p-4 border border-slate-200 max-h-64 overflow-y-auto">
            <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
              {projectContext.document}
            </pre>
          </div>
        </motion.div>

        {/* Learning Path Info */}
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">What You'll Learn</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-2">Stakeholder Analysis</h4>
              <p className="text-sm text-slate-600">Identify and analyze project stakeholders</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-2">Requirements Elicitation</h4>
              <p className="text-sm text-slate-600">Learn techniques to gather requirements</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-2">Requirements Analysis</h4>
              <p className="text-sm text-slate-600">Analyze and prioritize requirements</p>
            </div>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div 
          className="text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started with Requirements Engineering
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
          <p className="text-sm text-slate-500 mt-3">
            Begin your journey through the requirements engineering process
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectOverview;