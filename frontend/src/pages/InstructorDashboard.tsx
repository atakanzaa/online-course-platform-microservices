import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Play, 
  Trash2, 
  Eye, 
  Download, 
  FileVideo, 
  Clock, 
  HardDrive,
  AlertCircle,
  BookOpen,
  Users,
  TrendingUp,
  DollarSign,
  BarChart3,
  Calendar,
  Award
} from 'lucide-react';
import { mediaService, MediaFile, MediaUploadResponse } from '../services/mediaService';
import { courseService } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

interface CourseStats {
  id: number;
  title: string;
  studentCount: number;
  revenue: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
}

interface InstructorStats {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeCourses: number;
}

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'media' | 'analytics'>('overview');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [instructorStats, setInstructorStats] = useState<InstructorStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeCourses: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== 'INSTRUCTOR') {
      setError('Access denied. Instructor privileges required.');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadMediaFiles(),
        loadCourseStats(),
        loadInstructorStats()
      ]);
      setError(null);
    } catch (error: any) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMediaFiles = async () => {
    try {
      const files = await mediaService.getInstructorFiles();
      setMediaFiles(files);
    } catch (error: any) {
      console.error('Error loading media files:', error);
    }
  };

  const loadCourseStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockCourseStats: CourseStats[] = [
        {
          id: 1,
          title: "React Fundamentals",
          studentCount: 45,
          revenue: 2250,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: "Advanced JavaScript",
          studentCount: 32,
          revenue: 1600,
          status: 'PUBLISHED',
          createdAt: new Date().toISOString()
        }
      ];
      setCourseStats(mockCourseStats);
    } catch (error: any) {
      console.error('Error loading course stats:', error);
    }
  };

  const loadInstructorStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockStats: InstructorStats = {
        totalCourses: 5,
        totalStudents: 234,
        totalRevenue: 11700,
        monthlyRevenue: 3250,
        activeCourses: 3
      };
      setInstructorStats(mockStats);
    } catch (error: any) {
      console.error('Error loading instructor stats:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response: MediaUploadResponse = await mediaService.uploadVideo(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setSuccessMessage(`Video "${file.name}" uploaded successfully!`);
      await loadMediaFiles();
      
      event.target.value = '';
      
      setTimeout(() => {
        setSuccessMessage(null);
        setUploadProgress(0);
      }, 3000);
      
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: number, filename: string) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      await mediaService.deleteFile(fileId);
      setSuccessMessage('File deleted successfully');
      await loadMediaFiles();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error: any) {
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need instructor privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.firstName}! Here's your teaching overview.</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{instructorStats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{instructorStats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(instructorStats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(instructorStats.monthlyRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'courses', label: 'My Courses', icon: BookOpen },
                { key: 'media', label: 'Media Library', icon: FileVideo },
                { key: 'analytics', label: 'Analytics', icon: TrendingUp }
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
                  <div className="space-y-4">
                    {courseStats.map((course) => (
                      <div key={course.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{course.title}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                {course.studentCount} students
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatCurrency(course.revenue)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                course.status === 'PUBLISHED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {course.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {formatCurrency(course.revenue / course.studentCount)}
                            </div>
                            <div className="text-xs text-gray-500">per student</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                      <BookOpen className="h-6 w-6 text-primary-600 mb-2" />
                      <div className="font-medium text-gray-900">Create New Course</div>
                      <div className="text-sm text-gray-600">Start building your next course</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                      <Upload className="h-6 w-6 text-primary-600 mb-2" />
                      <div className="font-medium text-gray-900">Upload Content</div>
                      <div className="text-sm text-gray-600">Add videos and materials</div>
                    </button>
                    <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                      <BarChart3 className="h-6 w-6 text-primary-600 mb-2" />
                      <div className="font-medium text-gray-900">View Analytics</div>
                      <div className="text-sm text-gray-600">Track your performance</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
                  <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                    Create New Course
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courseStats.map((course) => (
                    <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500"></div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{course.title}</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center justify-between">
                            <span>Students:</span>
                            <span className="font-medium">{course.studentCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Revenue:</span>
                            <span className="font-medium">{formatCurrency(course.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              course.status === 'PUBLISHED' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {course.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className="flex-1 text-center px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
                            Edit
                          </button>
                          <button className="flex-1 text-center px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === 'media' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Media Library</h3>
                
                {/* Upload Section */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Upload New Video</h4>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="text-sm text-gray-600 mb-4">
                      <label htmlFor="video-upload" className="cursor-pointer">
                        <span className="text-primary-600 hover:text-primary-500 font-medium">
                          Click to upload
                        </span>
                        <span> or drag and drop</span>
                      </label>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500">MP4, AVI, MOV up to 100MB</p>
                  </div>

                  {uploading && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video List */}
                {mediaFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No videos uploaded yet</h4>
                    <p className="text-gray-600">Upload your first video to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-video bg-gray-100 flex items-center justify-center">
                          <video
                            className="w-full h-full object-cover"
                            preload="metadata"
                            onError={(e) => {
                              (e.target as HTMLVideoElement).style.display = 'none';
                              const parent = (e.target as HTMLElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="flex items-center justify-center h-full"><svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></div>';
                              }
                            }}
                          >
                            <source src={mediaService.getStreamUrl(file.id)} type={file.mimeType} />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 mb-2 truncate" title={file.originalFilename}>
                            {file.originalFilename}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>Size: {formatFileSize(file.fileSize)}</p>
                            <p>Uploaded: {formatDate(file.uploadedAt)}</p>
                            <p>Type: {file.mimeType}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex space-x-2">
                              <a
                                href={mediaService.getStreamUrl(file.id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                title="Preview video"
                              >
                                <Play className="h-4 w-4" />
                              </a>
                              <a
                                href={mediaService.getDownloadUrl(file.id)}
                                download={file.originalFilename}
                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="Download video"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            </div>
                            
                            <button
                              onClick={() => handleDeleteFile(file.id, file.originalFilename)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                              title="Delete video"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Analytics & Performance</h3>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h4>
                  <p className="text-gray-600">Detailed analytics and performance metrics will be available soon.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
