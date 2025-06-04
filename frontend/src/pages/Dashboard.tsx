import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle,
  User,
  Settings,
  Shield,
  GraduationCap
} from 'lucide-react';
import { Course, Enrollment } from '../types';
import { courseService } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import InstructorDashboard from './InstructorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based dashboard rendering
  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'INSTRUCTOR':
      return <InstructorDashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
};

// Student Dashboard Component (extracted from original Dashboard)
const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'progress' | 'profile'>('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const enrollmentsData = await courseService.getUserEnrollments();
      setEnrollments(enrollmentsData);

      // Fetch course details for each enrollment
      const coursePromises = enrollmentsData.map(enrollment =>
        courseService.getCourseById(enrollment.courseId)
      );
      const coursesData = await Promise.all(coursePromises);
      setEnrolledCourses(coursesData);
      setError(null);
    } catch (error: any) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressPercentage = (enrollment: Enrollment): number => {
    if (!enrollment.completedLessons || enrollment.completedLessons.length === 0) {
      return 0;
    }
    // This would need to be calculated based on total lessons in the course
    // For now, we'll use a placeholder calculation
    return Math.min(enrollment.completedLessons.length * 10, 100);
  };

  const getCompletedCoursesCount = (): number => {
    return enrollments.filter(enrollment => enrollment.completedAt).length;
  };

  const getTotalStudyTime = (): number => {
    // This would be calculated from actual progress data
    // For now, we'll use a placeholder
    return enrollments.length * 120; // 2 hours per course on average
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="text-gray-600">Continue your learning journey</p>
            </div>
            <Link
              to="/courses"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{getCompletedCoursesCount()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Study Time</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(getTotalStudyTime())}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((acc, enrollment) => acc + getProgressPercentage(enrollment), 0) / enrollments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: TrendingUp },
                { key: 'courses', label: 'My Courses', icon: BookOpen },
                { key: 'progress', label: 'Progress', icon: CheckCircle },
                { key: 'profile', label: 'Profile', icon: User }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Continue Learning */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
                  {enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrollments.slice(0, 3).map((enrollment) => {
                        const course = enrolledCourses.find(c => c.id === enrollment.courseId);
                        if (!course) return null;
                        
                        return (
                          <Link
                            key={enrollment.id}
                            to={`/courses/${course.id}/learn`}
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-3 relative">
                              {course.thumbnailUrl ? (
                                <img
                                  src={course.thumbnailUrl}
                                  alt={course.title}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Play className="h-8 w-8 text-white" />
                                </div>
                              )}
                            </div>
                            <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                              {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              by {course.instructor.firstName} {course.instructor.lastName}
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${getProgressPercentage(enrollment)}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {getProgressPercentage(enrollment)}% complete
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No enrolled courses yet.</p>
                      <Link
                        to="/courses"
                        className="text-primary-600 hover:text-primary-500 font-medium"
                      >
                        Browse our catalog
                      </Link>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {enrollments.slice(0, 5).map((enrollment) => {
                      const course = enrolledCourses.find(c => c.id === enrollment.courseId);
                      if (!course) return null;
                      
                      return (
                        <div key={enrollment.id} className="flex items-center py-2">
                          <div className="p-2 bg-primary-100 rounded-lg mr-3">
                            <BookOpen className="h-4 w-4 text-primary-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Enrolled in {course.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(enrollment.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* My Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
                  <Link
                    to="/courses"
                    className="text-primary-600 hover:text-primary-500 font-medium text-sm"
                  >
                    Browse more courses
                  </Link>
                </div>
                
                {enrollments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((enrollment) => {
                      const course = enrolledCourses.find(c => c.id === enrollment.courseId);
                      if (!course) return null;
                      
                      return (
                        <div key={enrollment.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-3 relative">
                            {course.thumbnailUrl ? (
                              <img
                                src={course.thumbnailUrl}
                                alt={course.title}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-white" />
                              </div>
                            )}
                            {enrollment.completedAt && (
                              <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                <CheckCircle className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                            {course.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            by {course.instructor.firstName} {course.instructor.lastName}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${getProgressPercentage(enrollment)}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <span>{getProgressPercentage(enrollment)}% complete</span>
                            <span>Enrolled {formatDate(enrollment.createdAt)}</span>
                          </div>
                          <Link
                            to={`/courses/${course.id}/learn`}
                            className="block w-full text-center bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors text-sm"
                          >
                            {enrollment.completedAt ? 'Review Course' : 'Continue Learning'}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h4>
                    <p className="text-gray-600 mb-4">Start your learning journey today!</p>
                    <Link
                      to="/courses"
                      className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Learning Progress</h3>
                
                {enrollments.length > 0 ? (
                  <div className="space-y-6">
                    {enrollments.map((enrollment) => {
                      const course = enrolledCourses.find(c => c.id === enrollment.courseId);
                      if (!course) return null;
                      
                      const progress = getProgressPercentage(enrollment);
                      
                      return (
                        <div key={enrollment.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900">{course.title}</h4>
                              <p className="text-sm text-gray-600">
                                by {course.instructor.firstName} {course.instructor.lastName}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-primary-600">{progress}%</div>
                              <div className="text-xs text-gray-500">Complete</div>
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                            <div
                              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Started</div>
                              <div className="font-medium">{formatDate(enrollment.createdAt)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Last Activity</div>
                              <div className="font-medium">{formatDate(enrollment.updatedAt)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Lessons Completed</div>
                              <div className="font-medium">
                                {enrollment.completedLessons?.length || 0}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Status</div>
                              <div className="font-medium">
                                {enrollment.completedAt ? (
                                  <span className="text-green-600">Completed</span>
                                ) : (
                                  <span className="text-blue-600">In Progress</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No progress to show</h4>
                    <p className="text-gray-600 mb-4">Enroll in courses to track your progress</p>
                    <Link
                      to="/courses"
                      className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Browse Courses
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Settings</h3>
                
                <div className="max-w-2xl">
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                      <div className="h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center text-white text-xl font-semibold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </div>
                      <div className="ml-4">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </h4>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-sm text-gray-500 capitalize">{user?.role?.toLowerCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <input
                        type="text"
                        value={user?.createdAt ? formatDate(user.createdAt) : ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors mr-4"
                      >
                        Edit Profile
                      </button>
                      <button
                        type="button"
                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
