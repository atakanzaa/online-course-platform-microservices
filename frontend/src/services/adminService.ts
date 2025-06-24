import api from '../utils/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UpdateUserRoleRequest {
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
}

export interface CreateInstructorRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const adminService = {
  // Get all users with pagination
  getAllUsers: async (page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/admin/users?page=${page}&size=${size}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get<User>(`/admin/users/${userId}`);
    return response.data;
  },
  // Get users by role
  getUsersByRole: async (role: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<User>> => {
    const response = await api.get<PaginatedResponse<User>>(`/admin/users/role/${role}?page=${page}&size=${size}`);
    return response.data;
  },

  // Get all teachers/instructors
  getAllTeachers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/teachers');
    return response.data;
  },

  // Get all students
  getAllStudents: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/students');
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId: number, request: UpdateUserRoleRequest): Promise<User> => {
    const response = await api.put<User>(`/admin/users/${userId}/role`, request);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  // Create instructor account
  createInstructor: async (request: CreateInstructorRequest): Promise<User> => {
    const response = await api.post<User>('/admin/instructors', request);
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
  }
};
