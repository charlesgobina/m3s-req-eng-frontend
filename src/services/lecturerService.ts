/**
 * LecturerService - Aggregates student data for lecturer dashboard
 * 
 * This service fetches and analyzes student progress data from Firestore
 * to provide meaningful insights for lecturers.
 */

import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { firestoreService, UserTaskProgress } from './firestoreService';

export interface StudentOverview {
  userId: string;
  userName: string;
  email: string;
  currentTask: string;
  currentSubtask: string;
  currentStep: string;
  overallProgress: number;
  completedSteps: number;
  totalSteps: number;
  lastActiveAt: Date;
  tasksStarted: number;
  tasksCompleted: number;
}

export interface TaskAnalytics {
  taskId: string;
  taskName: string;
  totalStudents: number;
  studentsStarted: number;
  studentsCompleted: number;
  averageProgress: number;
  completionRate: number;
  averageTimeSpent: number; // in days
}

export interface RecentActivity {
  userId: string;
  userName: string;
  action: string;
  taskName: string;
  subtaskName: string;
  stepName: string;
  timestamp: Date;
  activityType: 'step_completed' | 'task_started' | 'subtask_started' | 'step_started';
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number; // active in last 7 days
  totalTasks: number;
  averageProgress: number;
  completedAssignments: number;
  pendingAssignments: number;
}

export interface SubtaskAnalytics {
  subtaskId: string;
  subtaskName: string;
  taskName: string;
  studentsStarted: number;
  studentsCompleted: number;
  averageProgress: number;
  averageStepsCompleted: number;
  totalSteps: number;
}

export class LecturerService {

  /**
   * Debug function to test connection and data structure
   */
  async debugConnection(): Promise<void> {
    try {
      console.log('🔧 DEBUG: Testing lecturer service connections...');
      
      // Test user collection
      console.log('🔍 Testing users collection...');
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      console.log(`📊 Users collection: ${usersSnapshot.docs.length} documents`);
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`  👤 User ${doc.id}: ${data.firstName} ${data.lastName} (${data.role})`);
      });
      
      // Test user_progress collection structure
      console.log('🔍 Testing user_progress collection structure...');
      const progressRef = collection(db, 'user_progress');
      const progressSnapshot = await getDocs(progressRef);
      console.log(`📊 User_progress collection: ${progressSnapshot.docs.length} user documents`);
      
      // For each user, check their tasks
      for (const userDoc of progressSnapshot.docs) {
        console.log(`  📂 User ${userDoc.id} progress:`);
        const tasksRef = collection(db, 'user_progress', userDoc.id, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        console.log(`    📚 Tasks: ${tasksSnapshot.docs.length} documents`);
        
        tasksSnapshot.docs.forEach(taskDoc => {
          const taskData = taskDoc.data();
          console.log(`      🎯 Task ${taskDoc.id}: ${taskData.name}`);
          if (taskData.currentPosition) {
            console.log(`        📍 Current: ${taskData.currentPosition.subtaskId} / ${taskData.currentPosition.stepId}`);
          }
        });
      }
      
    } catch (error) {
      console.error('❌ DEBUG: Error testing connections:', error);
    }
  }
  
  /**
   * Get all registered users (students and lecturers)
   */
  async getAllUsers(): Promise<any[]> {
    try {
      console.log('🔍 LecturerService: Fetching all users...');
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log(`✅ LecturerService: Found ${users.length} users:`, users);
      return users;
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  }

  /**
   * Get all student progress data
   */
  async getAllStudentProgress(): Promise<{ userId: string; userName: string; email: string; tasks: { [taskId: string]: UserTaskProgress } }[]> {
    try {
      console.log('🔍 LecturerService: Fetching all student progress...');
      const users = await this.getAllUsers();
      const students = users.filter(user => user.role === 'student');
      console.log(`📚 LecturerService: Found ${students.length} students to analyze`);
      
      const progressData = await Promise.all(
        students.map(async (student) => {
          try {
            console.log(`🔍 Loading progress for student: ${student.firstName} ${student.lastName} (${student.id})`);
            const userProgressRef = collection(db, 'user_progress', student.id, 'tasks');
            const snapshot = await getDocs(userProgressRef);
            const tasks: { [taskId: string]: UserTaskProgress } = {};
            
            console.log(`📄 Found ${snapshot.docs.length} task documents for ${student.firstName}`);
            snapshot.docs.forEach(doc => {
              tasks[doc.id] = doc.data() as UserTaskProgress;
              console.log(`  ✅ Task: ${doc.id} - ${tasks[doc.id].name}`);
            });
            
            return {
              userId: student.id,
              userName: `${student.firstName} ${student.lastName}`,
              email: student.email,
              tasks
            };
          } catch (error) {
            console.warn(`❌ Failed to load progress for student ${student.id}:`, error);
            return {
              userId: student.id,
              userName: `${student.firstName} ${student.lastName}`,
              email: student.email,
              tasks: {}
            };
          }
        })
      );
      
      console.log(`✅ LecturerService: Loaded progress for ${progressData.length} students`);
      return progressData;
    } catch (error) {
      console.error('❌ Error fetching student progress:', error);
      return [];
    }
  }

  /**
   * Generate dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const users = await this.getAllUsers();
      const students = users.filter(user => user.role === 'student');
      const progressData = await this.getAllStudentProgress();
      
      // Calculate active students (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      let activeStudents = 0;
      let totalSteps = 0;
      let completedSteps = 0;
      let totalTasks = 0;
      const taskIds = new Set<string>();
      
      progressData.forEach(student => {
        let studentHasRecentActivity = false;
        
        Object.values(student.tasks).forEach(task => {
          taskIds.add(task.id);
          
          // Check if student was active recently
          if (task.currentPosition.lastActiveAt) {
            const lastActive = task.currentPosition.lastActiveAt.toDate();
            if (lastActive > sevenDaysAgo) {
              studentHasRecentActivity = true;
            }
          }
          
          // Count steps and completion
          Object.values(task.subtasks).forEach(subtask => {
            Object.values(subtask.steps).forEach(step => {
              totalSteps++;
              if (step.isCompleted) {
                completedSteps++;
              }
            });
          });
        });
        
        if (studentHasRecentActivity) {
          activeStudents++;
        }
      });
      
      totalTasks = taskIds.size;
      const averageProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      
      return {
        totalStudents: students.length,
        activeStudents,
        totalTasks,
        averageProgress: Math.round(averageProgress * 100) / 100,
        completedAssignments: completedSteps,
        pendingAssignments: totalSteps - completedSteps
      };
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
      return {
        totalStudents: 0,
        activeStudents: 0,
        totalTasks: 0,
        averageProgress: 0,
        completedAssignments: 0,
        pendingAssignments: 0
      };
    }
  }

  /**
   * Get student overview data
   */
  async getStudentOverviews(): Promise<StudentOverview[]> {
    try {
      const progressData = await this.getAllStudentProgress();
      
      return progressData.map(student => {
        let completedSteps = 0;
        let totalSteps = 0;
        let tasksStarted = 0;
        let tasksCompleted = 0;
        let lastActiveAt = new Date(0); // epoch
        let currentTask = 'Not started';
        let currentSubtask = '';
        let currentStep = '';
        
        Object.values(student.tasks).forEach(task => {
          let taskHasProgress = false;
          let taskCompleted = true;
          
          Object.values(task.subtasks).forEach(subtask => {
            Object.values(subtask.steps).forEach(step => {
              totalSteps++;
              if (step.isCompleted) {
                completedSteps++;
                taskHasProgress = true;
              } else {
                taskCompleted = false;
              }
            });
          });
          
          if (taskHasProgress) {
            tasksStarted++;
            
            // Update current position info
            if (task.currentPosition.lastActiveAt) {
              const taskLastActive = task.currentPosition.lastActiveAt.toDate();
              if (taskLastActive > lastActiveAt) {
                lastActiveAt = taskLastActive;
                currentTask = task.name;
                
                // Find current subtask and step
                const currentSubtaskId = task.currentPosition.subtaskId;
                const currentStepId = task.currentPosition.stepId;
                
                if (currentSubtaskId && task.subtasks[currentSubtaskId]) {
                  currentSubtask = task.subtasks[currentSubtaskId].name;
                  
                  if (currentStepId && task.subtasks[currentSubtaskId].steps[currentStepId]) {
                    currentStep = task.subtasks[currentSubtaskId].steps[currentStepId].objective;
                  }
                }
              }
            }
          }
          
          if (taskCompleted && taskHasProgress) {
            tasksCompleted++;
          }
        });
        
        const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
        
        return {
          userId: student.userId,
          userName: student.userName,
          email: student.email,
          currentTask,
          currentSubtask,
          currentStep,
          overallProgress: Math.round(overallProgress * 100) / 100,
          completedSteps,
          totalSteps,
          lastActiveAt,
          tasksStarted,
          tasksCompleted
        };
      });
    } catch (error) {
      console.error('Error generating student overviews:', error);
      return [];
    }
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(): Promise<TaskAnalytics[]> {
    try {
      const progressData = await this.getAllStudentProgress();
      const taskAnalytics = new Map<string, TaskAnalytics>();
      
      progressData.forEach(student => {
        Object.values(student.tasks).forEach(task => {
          if (!taskAnalytics.has(task.id)) {
            taskAnalytics.set(task.id, {
              taskId: task.id,
              taskName: task.name,
              totalStudents: 0,
              studentsStarted: 0,
              studentsCompleted: 0,
              averageProgress: 0,
              completionRate: 0,
              averageTimeSpent: 0
            });
          }
          
          const analytics = taskAnalytics.get(task.id)!;
          analytics.totalStudents++;
          
          let taskSteps = 0;
          let completedSteps = 0;
          let hasStarted = false;
          
          Object.values(task.subtasks).forEach(subtask => {
            Object.values(subtask.steps).forEach(step => {
              taskSteps++;
              if (step.isCompleted) {
                completedSteps++;
                hasStarted = true;
              }
            });
          });
          
          if (hasStarted) {
            analytics.studentsStarted++;
          }
          
          if (taskSteps > 0 && completedSteps === taskSteps) {
            analytics.studentsCompleted++;
          }
          
          // Update averages
          const currentProgress = taskSteps > 0 ? (completedSteps / taskSteps) * 100 : 0;
          analytics.averageProgress = ((analytics.averageProgress * (analytics.totalStudents - 1)) + currentProgress) / analytics.totalStudents;
        });
      });
      
      // Calculate completion rates
      Array.from(taskAnalytics.values()).forEach(analytics => {
        analytics.completionRate = analytics.totalStudents > 0 ? 
          (analytics.studentsCompleted / analytics.totalStudents) * 100 : 0;
        analytics.averageProgress = Math.round(analytics.averageProgress * 100) / 100;
        analytics.completionRate = Math.round(analytics.completionRate * 100) / 100;
      });
      
      return Array.from(taskAnalytics.values());
    } catch (error) {
      console.error('Error calculating task analytics:', error);
      return [];
    }
  }

  /**
   * Get recent student activities
   */
  async getRecentActivities(limitCount: number = 10): Promise<RecentActivity[]> {
    try {
      const progressData = await this.getAllStudentProgress();
      const activities: RecentActivity[] = [];
      
      progressData.forEach(student => {
        Object.values(student.tasks).forEach(task => {
          // Add task started activity
          if (task.currentPosition.lastActiveAt) {
            activities.push({
              userId: student.userId,
              userName: student.userName,
              action: `Started working on task`,
              taskName: task.name,
              subtaskName: '',
              stepName: '',
              timestamp: task.currentPosition.lastActiveAt.toDate(),
              activityType: 'task_started'
            });
          }
          
          Object.values(task.subtasks).forEach(subtask => {
            Object.values(subtask.steps).forEach(step => {
              if (step.isCompleted && step.lastActivityAt) {
                activities.push({
                  userId: student.userId,
                  userName: student.userName,
                  action: `Completed step`,
                  taskName: task.name,
                  subtaskName: subtask.name,
                  stepName: step.objective,
                  timestamp: step.lastActivityAt.toDate(),
                  activityType: 'step_completed'
                });
              }
            });
          });
        });
      });
      
      // Sort by timestamp descending and limit
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get subtask analytics for detailed view
   */
  async getSubtaskAnalytics(): Promise<SubtaskAnalytics[]> {
    try {
      const progressData = await this.getAllStudentProgress();
      const subtaskAnalytics = new Map<string, SubtaskAnalytics>();
      
      progressData.forEach(student => {
        Object.values(student.tasks).forEach(task => {
          Object.values(task.subtasks).forEach(subtask => {
            const key = `${task.id}-${subtask.id}`;
            
            if (!subtaskAnalytics.has(key)) {
              subtaskAnalytics.set(key, {
                subtaskId: subtask.id,
                subtaskName: subtask.name,
                taskName: task.name,
                studentsStarted: 0,
                studentsCompleted: 0,
                averageProgress: 0,
                averageStepsCompleted: 0,
                totalSteps: Object.keys(subtask.steps).length
              });
            }
            
            const analytics = subtaskAnalytics.get(key)!;
            const steps = Object.values(subtask.steps);
            const completedSteps = steps.filter(step => step.isCompleted).length;
            const hasStarted = completedSteps > 0;
            
            if (hasStarted) {
              analytics.studentsStarted++;
            }
            
            if (completedSteps === steps.length && steps.length > 0) {
              analytics.studentsCompleted++;
            }
            
            analytics.averageStepsCompleted = 
              ((analytics.averageStepsCompleted * (analytics.studentsStarted - (hasStarted ? 1 : 0))) + completedSteps) / 
              (analytics.studentsStarted || 1);
              
            analytics.averageProgress = analytics.totalSteps > 0 ? 
              (analytics.averageStepsCompleted / analytics.totalSteps) * 100 : 0;
          });
        });
      });
      
      return Array.from(subtaskAnalytics.values()).map(analytics => ({
        ...analytics,
        averageProgress: Math.round(analytics.averageProgress * 100) / 100,
        averageStepsCompleted: Math.round(analytics.averageStepsCompleted * 100) / 100
      }));
    } catch (error) {
      console.error('Error calculating subtask analytics:', error);
      return [];
    }
  }
}

// Export singleton instance
export const lecturerService = new LecturerService();