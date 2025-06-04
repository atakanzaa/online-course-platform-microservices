import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Globe,
  Award,
  Calendar,
  DollarSign,
  Lock,
  PlayCircle
} from 'lucide-react';
import { Course, Lesson } from '../types';
import { courseService } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
      if (isAuthenticated) {
        checkEnrollmentStatus(id);
      }
    }
  }, [id, isAuthenticated]);

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const [courseData, lessonsData] = await Promise.all([
        courseService.getCourseById(courseId),
        courseService.getCourseLessons(courseId)
      ]);
      setCourse(courseData);
      setLessons(lessonsData);
      setError(null);
    } catch (error: any) {
      setError('Failed to load course details. Please try again later.');
      console.error('Error fetching course details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async (courseId: string) => {
    try {
      const enrollments = await courseService.getUserEnrollments();
      const enrolled = enrollments.some(enrollment => enrollment.courseId === courseId);
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      await courseService.enrollInCourse(course.id);
      setIsEnrolled(true);
      // You might want to show a success message here
    } catch (error: any) {
      setError('Failed to enroll in course. Please try again.');
      console.error('Error enrolling in course:', error);
    } finally {
      setEnrolling(false);
    }
  };

  const formatPrice = (price: number): string => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-600">
                  {course.level}
                </span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>
              
              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 mb-6">
                {course.rating && (
                  <div className="flex items-center">
                    {renderStars(course.rating)}
                    <span className="ml-2 text-sm">
                      ({course.ratingCount} reviews)
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{course.enrollmentCount || 0} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{formatDuration(course.duration || 0)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="text-sm text-gray-300">Course Instructor</p>
                </div>
              </div>
            </div>

            {/* Course Preview & Enrollment */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                {/* Course Preview */}
                <div className="aspect-video bg-gray-900 rounded-lg mb-4 relative overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white" />
                  </div>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(course.price)}
                  </div>
                </div>

                {/* Enroll Button */}
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/dashboard/courses/${course.id}`)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors mb-4"
                  >
                    <CheckCircle className="h-5 w-5 inline mr-2" />
                    Go to Course
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
                  >
                    {enrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 inline mr-2" />
                        {course.price === 0 ? 'Enroll for Free' : 'Enroll Now'}
                      </>
                    )}
                  </button>
                )}

                {/* Course Includes */}
                <div className="space-y-3 text-sm">
                  <h4 className="font-semibold text-gray-900">This course includes:</h4>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{formatDuration(course.duration || 0)} of video content</span>
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                    <span>{lessons.length} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-gray-500 mr-2" />
                    <span>Certificate of completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'curriculum', label: 'Curriculum' },
                  { key: 'instructor', label: 'Instructor' },
                  { key: 'reviews', label: 'Reviews' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3>About this course</h3>
                <p>{course.description}</p>
                {course.requirements && course.requirements.length > 0 && (
                  <>
                    <h4>Requirements</h4>
                    <ul>
                      {course.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </>
                )}
                {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                  <>
                    <h4>What you'll learn</h4>
                    <ul>
                      {course.learningOutcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Course Curriculum</h3>
                <div className="space-y-4">
                  {lessons.map((lesson, index) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            {isEnrolled || lesson.isPreview ? (
                              <PlayCircle className="h-4 w-4 text-primary-600" />
                            ) : (
                              <Lock className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {index + 1}. {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDuration(lesson.duration)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructor' && (
              <div>
                <div className="flex items-center mb-6">
                  <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-600">
                      {course.instructor.firstName[0]}{course.instructor.lastName[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold">
                      {course.instructor.firstName} {course.instructor.lastName}
                    </h3>
                    <p className="text-gray-600">{course.instructor.email}</p>
                  </div>
                </div>
                {course.instructor.bio && (
                  <div className="prose max-w-none">
                    <p>{course.instructor.bio}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Student Reviews</h3>
                <div className="text-center py-8">
                  <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No reviews yet. Be the first to review this course!</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Course Details</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Level</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{formatDuration(course.duration || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lessons</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.enrollmentCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language</span>
                  <span className="font-medium">English</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
