export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  avatar?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  instructor: User;
  instructorId: string;
  categoryId: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  duration?: number;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  tags?: string[];
  rating?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  lessonsCount?: number;
  requirements?: string[];
  learningOutcomes?: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  duration: number;
  order: number;
  courseId: string;
  isPreview: boolean;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  course?: Course;
  progress?: number;
  completedLessons?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}
