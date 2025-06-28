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
import { useTaskStore } from '../../stores/taskStore';
import { useAuthStore } from '../../stores/authStore';

const ProjectOverview: React.FC = () => {
  const { projectContext } = useProjectContext();
  const { navigateToNext } = useTaskStore();
  const { user } = useAuthStore();

  const handleGetStarted = () => {
    navigateToNext();
  };

  return (
    <motion.div 
      className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 lg:mb-12"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <BookOpen className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-4xl font-bold text-slate-800">
                    Welcome, {user ? `${user.firstName} ${user.lastName}` : 'Student'}!
                  </h1>
                  <p className="text-sm lg:text-base text-slate-500 mt-1">
                    Ready to master requirements engineering?
                  </p>
                </div>
              </div>
              <p className="text-base lg:text-lg text-slate-600 max-w-2xl">
                Learn the fundamentals of requirements engineering through hands-on practice with a real-world project
              </p>
            </div>
            <div className="lg:flex-shrink-0">
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">5</div>
                  <div className="text-xs lg:text-sm text-slate-500 uppercase tracking-wide">Learning Steps</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Information */}
        <motion.div 
          className="bg-white rounded-2xl p-6 lg:p-8 mb-8 lg:mb-10 shadow-sm border border-slate-200"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
              <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800">Project Overview</h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-3 lg:mb-4">
                {projectContext.title}
              </h3>
              <p className="text-slate-600 leading-relaxed text-sm lg:text-base mb-4">
                {projectContext.description}
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 lg:p-5 border border-blue-100">
                <div className="flex items-center mb-2">
                  <Target className="w-4 h-4 text-blue-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm lg:text-base">Domain</span>
                </div>
                <p className="text-slate-600 text-sm lg:text-base font-medium">{projectContext.domain}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 lg:p-5 border border-purple-100">
                <div className="flex items-center mb-2">
                  <Users className="w-4 h-4 text-purple-500 mr-2" />
                  <span className="font-medium text-slate-700 text-sm lg:text-base">Stakeholders</span>
                </div>
                <p className="text-slate-600 text-sm lg:text-base font-medium">{projectContext.stakeholders.length} identified</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Key Information Grid */}
        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-10">
          {/* Stakeholders */}
          <motion.div 
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center mb-4 lg:mb-5">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-800">Stakeholders</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projectContext.stakeholders.map((stakeholder, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center py-2 px-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-150"
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
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center mb-4 lg:mb-5">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <Target className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-800">Business Goals</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projectContext.businessGoals.map((goal, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start py-2 px-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-150"
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

          {/* Constraints */}
          <motion.div 
            className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex items-center mb-4 lg:mb-5">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-slate-800">Constraints</h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {projectContext.constraints.slice(0, 3).map((constraint, index) => (
                <motion.div 
                  key={index}
                  className="flex items-start py-2 px-3 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors duration-150"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 + (index * 0.1) }}
                >
                  <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 text-amber-500 mr-2 lg:mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 text-xs lg:text-sm">{constraint}</span>
                </motion.div>
              ))}
              {projectContext.constraints.length > 3 && (
                <div className="text-xs text-slate-500 text-center pt-2">
                  +{projectContext.constraints.length - 3} more constraints
                </div>
              )}
            </div>
          </motion.div>
        </div>


        {/* Project Document Preview */}
        <motion.div 
          className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200 mb-8 lg:mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex items-center mb-4 lg:mb-6">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800">Project Documentation</h3>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 lg:p-6 border border-slate-200 max-h-64 lg:max-h-80 overflow-y-auto">
            <pre className="text-xs lg:text-sm text-slate-600 whitespace-pre-wrap font-mono leading-relaxed">
              {projectContext.document}
            </pre>
          </div>
        </motion.div>

        {/* Learning Path Info */}
        <motion.div 
          className="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200 mb-8 lg:mb-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <div className="flex items-center mb-6 lg:mb-8">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
              <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-slate-800">What You'll Learn</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 lg:p-5 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm lg:text-base">Stakeholder Analysis</h4>
                  <p className="text-xs lg:text-sm text-slate-600">Identify and analyze project stakeholders</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 lg:p-5 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm lg:text-base">Requirements Elicitation</h4>
                  <p className="text-xs lg:text-sm text-slate-600">Learn techniques to gather requirements</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 lg:p-5 border border-green-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mt-1 flex-shrink-0">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm lg:text-base">Requirements Analysis</h4>
                  <p className="text-xs lg:text-sm text-slate-600">Analyze and prioritize requirements</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div 
          className="text-center pb-6 lg:pb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={handleGetStarted}
            className="inline-flex items-center px-8 lg:px-10 py-4 lg:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation text-base lg:text-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started with Requirements Engineering
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 ml-3" />
          </motion.button>
          <p className="text-sm lg:text-base text-slate-500 mt-4 px-4 max-w-md mx-auto">
            Begin your journey through the requirements engineering process
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectOverview;