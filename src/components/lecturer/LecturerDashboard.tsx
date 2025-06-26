// src/components/lecturer/LecturerDashboard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const stats = [
    {
      title: 'Active Students',
      value: '127',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Course Modules',
      value: '8',
      change: '+2',
      icon: BookOpen,
      color: 'bg-green-500'
    },
    {
      title: 'Avg. Progress',
      value: '73%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-purple-500'
    },
    {
      title: 'Assignments',
      value: '24',
      change: '6 pending',
      icon: Clock,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    {
      student: 'Alice Johnson',
      action: 'Completed Module 3',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      student: 'Bob Smith',
      action: 'Started Requirements Analysis',
      time: '4 hours ago',
      status: 'in-progress'
    },
    {
      student: 'Carol Davis',
      action: 'Submitted Assignment 2',
      time: '6 hours ago',
      status: 'review'
    },
    {
      student: 'David Wilson',
      action: 'Asked question in Module 1',
      time: '1 day ago',
      status: 'question'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'review':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'question':
        return <AlertCircle className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">M3S Req Eng - Lecturer Portal</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your students' progress and manage your courses</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Student Activities</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      {getStatusIcon(activity.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.student}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Assignment
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Add Course Module
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Analytics
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Settings className="w-5 h-5 mr-2" />
                  Course Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Course Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: 'Requirements Fundamentals', students: 42, progress: 85 },
                  { title: 'Stakeholder Analysis', students: 38, progress: 72 },
                  { title: 'User Stories & Use Cases', students: 35, progress: 68 },
                  { title: 'Requirements Validation', students: 28, progress: 45 }
                ].map((module, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{module.title}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{module.students} students</span>
                        <span>{module.progress}% avg</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${module.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LecturerDashboard;