import api from '../utils/api';

export interface MediaFile {
  id: number;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  courseId?: number;
  uploadedAt: string;
}

export interface MediaUploadResponse {
  id: number;
  filename: string;
  downloadUrl: string;
  streamUrl: string;
}

export const mediaService = {
  // Upload video file (instructor only)
  uploadVideo: async (file: File, courseId?: number): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId.toString());
    }

    const response = await api.post<MediaUploadResponse>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get instructor's media files
  getInstructorFiles: async (): Promise<MediaFile[]> => {
    const response = await api.get<MediaFile[]>('/media/instructor/files');
    return response.data;
  },

  // Get media file by ID
  getFileById: async (fileId: number): Promise<MediaFile> => {
    const response = await api.get<MediaFile>(`/media/${fileId}`);
    return response.data;
  },

  // Delete media file
  deleteFile: async (fileId: number): Promise<void> => {
    await api.delete(`/media/${fileId}`);
  },

  // Get video stream URL
  getStreamUrl: (fileId: number): string => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    return `${baseUrl}/media/${fileId}/stream`;
  },

  // Get download URL
  getDownloadUrl: (fileId: number): string => {
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    return `${baseUrl}/media/${fileId}/download`;
  }
};
