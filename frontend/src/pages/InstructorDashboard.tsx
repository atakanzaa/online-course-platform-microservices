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
  AlertCircle
} from 'lucide-react';
import { mediaService, MediaFile, MediaUploadResponse } from '../services/mediaService';
import { useAuth } from '../contexts/AuthContext';

const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
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
    loadMediaFiles();
  }, [user]);

  const loadMediaFiles = async () => {
    try {
      setLoading(true);
      const files = await mediaService.getInstructorFiles();
      setMediaFiles(files);
      setError(null);
    } catch (error: any) {
      setError('Failed to load media files');
      console.error('Error loading media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      setError('File size must be less than 100MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate upload progress (in real implementation, you'd track actual progress)
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
      
      // Clear the file input
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
          <p className="mt-2 text-gray-600">Manage your course videos and media content</p>
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

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload New Video</h2>
            
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileVideo className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{mediaFiles.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatFileSize(mediaFiles.reduce((total, file) => total + file.fileSize, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediaFiles.filter(file => {
                    const uploadDate = new Date(file.uploadedAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return uploadDate > weekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Video List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Your Videos</h2>
            
            {mediaFiles.length === 0 ? (
              <div className="text-center py-12">
                <FileVideo className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos uploaded yet</h3>
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
                          // If video fails to load, show placeholder
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
                      <h3 className="font-medium text-gray-900 mb-2 truncate" title={file.originalFilename}>
                        {file.originalFilename}
                      </h3>
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
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
