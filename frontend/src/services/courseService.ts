import api from '../utils/api';
import { Course, Lesson, ApiResponse, PaginatedResponse, Enrollment, CourseCategory } from '../types';

export interface CourseFilters {
  category?: string;
  level?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const courseService = {
  getCourses: async (filters: CourseFilters = {}): Promise<Course[]> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get<PaginatedResponse<Course>>(`/courses?${params}`);
    return response.data.data;
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },

  getCourseLessons: async (courseId: string): Promise<Lesson[]> => {
    const response = await api.get<ApiResponse<Lesson[]>>(`/courses/${courseId}/lessons`);
    return response.data.data;
  },

  getFeaturedCourses: async (): Promise<Course[]> => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/featured');
    return response.data.data;
  },

  getPopularCourses: async (): Promise<Course[]> => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/popular');
    return response.data.data;
  },
  getCategories: async (): Promise<CourseCategory[]> => {
    const response = await api.get<ApiResponse<CourseCategory[]>>('/courses/categories');
    return response.data.data;
  },

  getUserEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get<ApiResponse<Enrollment[]>>('/enrollments');
    return response.data.data;
  },

  enrollInCourse: async (courseId: string): Promise<void> => {
    await api.post(`/courses/${courseId}/enroll`);
  },

  unenrollFromCourse: async (courseId: string): Promise<void> => {
    await api.delete(`/courses/${courseId}/enroll`);
  },
};
