import React from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Target, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Building
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
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 lg:mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4 lg:mb-6">
            <BookOpen className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
          </div>
          <h1 className="text-2xl lg:text-4xl font-bold text-slate-800 mb-3 lg:mb-4">
            Welcome to Requirements Engineering
          </h1>
          <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Learn the fundamentals of requirements engineering through hands-on practice with a real-world project
          </p>
        </motion.div>

        {/* Project Information */}
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 lg:p-8 mb-6 lg:mb-8 border border-blue-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center mb-4 lg:mb-6">
            <Building className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 mr-2 lg:mr-3" />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Project Overview</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-2 lg:mb-3">
                {projectContext.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                {projectContext.description}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 lg:p-4 border border-blue-200">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-medium text-slate-700 text-sm lg:text-base">Domain</span>
              </div>
              <p className="text-slate-600 text-sm lg:text-base">{projectContext.domain}</p>
            </div>
          </div>
        </motion.div>

        {/* Key Information Grid */}
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-8 mb-6 lg:mb-8">
          {/* Stakeholders */}
          <motion.div 
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-3 lg:mb-4">
              <Users className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 mr-2 lg:mr-3" />
              <h3 className="text-base lg:text-lg font-semibold text-slate-800">Stakeholders</h3>
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
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span className="text-slate-700 text-sm lg:text-base">{stakeholder}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Business Goals */}
          <motion.div 
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-3 lg:mb-4">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-2 lg:mr-3" />
              <h3 className="text-base lg:text-lg font-semibold text-slate-800">Business Goals</h3>
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
                  <span className="text-slate-700 text-sm lg:text-base">{goal}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Constraints */}
        <motion.div 
          className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200 mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex items-center mb-3 lg:mb-4">
            <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600 mr-2 lg:mr-3" />
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">Project Constraints</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 lg:gap-4">
            {projectContext.constraints.map((constraint, index) => (
              <motion.div 
                key={index}
                className="flex items-start py-2 lg:py-3 px-3 lg:px-4 bg-amber-50 rounded-lg border border-amber-200"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
              >
                <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-amber-500 mr-2 lg:mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700 text-xs lg:text-sm">{constraint}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Project Document Preview */}
        <motion.div 
          className="bg-slate-50 rounded-xl p-4 lg:p-6 border border-slate-200 mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center mb-3 lg:mb-4">
            <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-slate-600 mr-2 lg:mr-3" />
            <h3 className="text-base lg:text-lg font-semibold text-slate-800">Project Documentation</h3>
          </div>
          <div className="bg-white rounded-lg p-3 lg:p-4 border border-slate-200 max-h-48 lg:max-h-64 overflow-y-auto">
            <pre className="text-xs lg:text-sm text-slate-600 whitespace-pre-wrap font-mono">
              {projectContext.document}
            </pre>
          </div>
        </motion.div>

        {/* Learning Path Info */}
        <motion.div 
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 lg:p-6 border border-purple-200 mb-6 lg:mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h3 className="text-base lg:text-lg font-semibold text-slate-800 mb-3 lg:mb-4">What You'll Learn</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-1 lg:mb-2 text-sm lg:text-base">Stakeholder Analysis</h4>
              <p className="text-xs lg:text-sm text-slate-600">Identify and analyze project stakeholders</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-1 lg:mb-2 text-sm lg:text-base">Requirements Elicitation</h4>
              <p className="text-xs lg:text-sm text-slate-600">Learn techniques to gather requirements</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3">
                <Target className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-800 mb-1 lg:mb-2 text-sm lg:text-base">Requirements Analysis</h4>
              <p className="text-xs lg:text-sm text-slate-600">Analyze and prioritize requirements</p>
            </div>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div 
          className="text-center pb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={handleGetStarted}
            className="inline-flex items-center px-6 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation text-sm lg:text-base"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started with Requirements Engineering
            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2" />
          </motion.button>
          <p className="text-xs lg:text-sm text-slate-500 mt-3 px-4">
            Begin your journey through the requirements engineering process
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectOverview;