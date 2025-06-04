import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Clock, Users, Star, BookOpen, ChevronDown } from 'lucide-react';
import { Course, CourseCategory } from '../types';
import { courseService } from '../services/courseService';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const filterCourses = useCallback(() => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => course.categoryId === selectedCategory);
    }

    // Level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Sort
    switch (sortBy) {
      case 'popularity':
        filtered.sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  useEffect(() => {
    fetchCourses();
    fetchCategories();
  }, []);
  
  useEffect(() => {
    filterCourses();
  }, [filterCourses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getCourses();
      setCourses(coursesData);
      setError(null);
    } catch (error: any) {
      setError('Failed to load courses. Please try again later.');
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await courseService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }  };

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
            className={`h-4 w-4 ${
              i < Math.floor(rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <BookOpen className="h-16 w-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Courses</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Explore Courses</h1>
            <p className="mt-2 text-lg text-gray-600">
              Discover thousands of courses from expert instructors
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search courses, instructors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filter Toggle (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors mb-4"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filters
            <ChevronDown className={`h-5 w-5 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Filters */}
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="popularity">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <Link
                key={course.id}
                to={`/courses/${course.id}`}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Course Image */}
                <div className="aspect-video bg-gradient-to-r from-primary-500 to-secondary-500 relative">
                  {course.thumbnailUrl ? (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {course.price === 0 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      FREE
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      by {course.instructor.firstName} {course.instructor.lastName}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {course.description}
                  </p>

                  {/* Course Meta */}
                  <div className="space-y-2 mb-3">
                    {course.rating && course.ratingCount && (
                      <div className="flex items-center">
                        {renderStars(course.rating)}
                        <span className="ml-1 text-xs text-gray-500">
                          ({course.ratingCount} reviews)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {course.enrollmentCount || 0} students
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(course.duration || 0)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {course.level}
                      </span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
