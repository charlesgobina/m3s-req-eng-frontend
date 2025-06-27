// src/components/lecturer/LecturerDashboard.tsx
import React, { useState, useEffect } from 'react';
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
  TrendingUp,
  Activity,
  Target,
  Award,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { 
  lecturerService, 
  DashboardStats, 
  StudentOverview, 
  TaskAnalytics, 
  RecentActivity,
  SubtaskAnalytics
} from '../../services/lecturerService';

const LecturerDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  // State for real data
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [students, setStudents] = useState<StudentOverview[]>([]);
  const [taskAnalytics, setTaskAnalytics] = useState<TaskAnalytics[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [subtaskAnalytics, setSubtaskAnalytics] = useState<SubtaskAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      console.log('🔄 LecturerDashboard: Starting to load dashboard data...');
      
      // Debug connection first
      await lecturerService.debugConnection();
      
      // Load data sequentially for better debugging
      console.log('1️⃣ Loading dashboard stats...');
      const stats = await lecturerService.getDashboardStats();
      console.log('📊 Dashboard stats:', stats);
      
      console.log('2️⃣ Loading student overviews...');
      const studentData = await lecturerService.getStudentOverviews();
      console.log('👥 Student data:', studentData.length, 'students');
      
      console.log('3️⃣ Loading task analytics...');
      const tasks = await lecturerService.getTaskAnalytics();
      console.log('📚 Task analytics:', tasks.length, 'tasks');
      
      console.log('4️⃣ Loading recent activities...');
      const activities = await lecturerService.getRecentActivities(8);
      console.log('🎬 Recent activities:', activities.length, 'activities');
      
      console.log('5️⃣ Loading subtask analytics...');
      const subtasks = await lecturerService.getSubtaskAnalytics();
      console.log('📋 Subtask analytics:', subtasks.length, 'subtasks');
      
      // Set all state
      setDashboardStats(stats);
      setStudents(studentData);
      setTaskAnalytics(tasks);
      setRecentActivities(activities);
      setSubtaskAnalytics(subtasks);
      
      console.log('✅ LecturerDashboard: All dashboard data loaded successfully!');
      
    } catch (error) {
      console.error('❌ LecturerDashboard: Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  // Generate stats for display
  const stats = dashboardStats ? [
    {
      title: 'Enrolled Students',
      value: dashboardStats.totalStudents.toString(),
      change: `${dashboardStats.activeStudents} active (7 days)`,
      icon: Users,
      color: 'bg-blue-500',
      tooltip: 'Total number of students registered in the course. Active students have interacted with the platform in the last 7 days.'
    },
    {
      title: 'Course Modules',
      value: dashboardStats.totalTasks.toString(),
      change: `${taskAnalytics.length} with data`,
      icon: BookOpen,
      color: 'bg-green-500',
      tooltip: 'Number of course modules/tasks available in the curriculum. Each module contains multiple subtasks and learning steps.'
    },
    {
      title: 'Overall Progress',
      value: `${dashboardStats.averageProgress.toFixed(1)}%`,
      change: `${dashboardStats.completedAssignments} steps done`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      tooltip: 'Average completion rate across all students and all learning steps. Calculated as (total completed steps / total available steps) × 100.'
    },
    {
      title: 'Learning Steps',
      value: (dashboardStats.completedAssignments + dashboardStats.pendingAssignments).toString(),
      change: `${dashboardStats.pendingAssignments} remaining`,
      icon: Target,
      color: 'bg-orange-500',
      tooltip: 'Total number of individual learning steps across all modules and students. Each step represents a specific learning objective or exercise.'
    }
  ] : [];

  // Get activity status icon and color
  const getActivityIcon = (activity: RecentActivity) => {
    switch (activity.activityType) {
      case 'step_completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'task_started':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'subtask_started':
        return <Target className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

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
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
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
            <div key={index} className="bg-white rounded-lg shadow p-6 relative group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10">
                        {stat.tooltip}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                      </div>
                    </div>
                  </div>
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

        {/* Recent Activities - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Student Activities</h3>
            </div>
            <div className="p-6">
              {recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                      {getActivityIcon(activity)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                        <p className="text-sm text-gray-600">
                          {activity.action} "{activity.stepName || activity.subtaskName || activity.taskName}"
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.taskName} {activity.subtaskName && `→ ${activity.subtaskName}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent student activities</p>
                  <p className="text-sm text-gray-400">Activities will appear here as students interact with tasks</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Task Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Task Analytics</h3>
              <p className="text-sm text-gray-600 mt-1">Overview of student progress across all tasks</p>
            </div>
            <div className="p-6">
              {taskAnalytics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {taskAnalytics.map((task, index) => (
                    <div key={task.taskId} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-gray-900 mb-3 truncate" title={task.taskName}>
                        {task.taskName}
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Students enrolled:</span>
                          <span className="font-medium">{task.totalStudents}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Started:</span>
                          <span className="font-medium text-blue-600">{task.studentsStarted}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium text-green-600">{task.studentsCompleted}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Avg Progress:</span>
                            <span className="font-medium">{task.averageProgress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${task.averageProgress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Completion Rate:</span>
                            <span className={`font-medium ${task.completionRate > 50 ? 'text-green-600' : 'text-orange-600'}`}>
                              {task.completionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No task data available</p>
                  <p className="text-sm text-gray-400">Task analytics will appear here as students begin working</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Student Overview Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Student Progress Overview</h3>
              <p className="text-sm text-gray-600 mt-1">Individual student progress and current status</p>
            </div>
            <div className="overflow-x-auto">
              {students.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Student</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Current Task</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Progress</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Steps</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-900">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.slice(0, 10).map((student, index) => (
                      <tr key={student.userId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{student.userName}</p>
                            <p className="text-gray-500 text-xs">{student.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-gray-900">{student.currentTask}</p>
                            {student.currentSubtask && (
                              <p className="text-gray-500 text-xs truncate max-w-48" title={student.currentSubtask}>
                                {student.currentSubtask}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${student.overallProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 w-12">
                              {student.overallProgress.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900">
                            {student.completedSteps}/{student.totalSteps}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-600">
                            {formatRelativeTime(student.lastActiveAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No student data available</p>
                  <p className="text-sm text-gray-400">Student progress will appear here as they begin tasks</p>
                </div>
              )}
            </div>
            {students.length > 10 && (
              <div className="px-6 py-3 bg-gray-50 text-center">
                <span className="text-sm text-gray-600">
                  Showing 10 of {students.length} students
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default LecturerDashboard;