import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, PlayCircleIcon, StarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Course } from '../types';
import { courseService } from '../services/courseService';

const Home: React.FC = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const featured = await courseService.getFeaturedCourses();
        setFeaturedCourses(featured);
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const features = [
    {
      name: 'Uzman Eğitmenler',
      description: 'Sektörün en iyi eğitmenlerinden öğrenin.',
      icon: UsersIcon,
    },
    {
      name: 'Kaliteli İçerik',
      description: 'HD video dersleri ve güncel müfredat.',
      icon: PlayCircleIcon,
    },
    {
      name: 'Sertifika',
      description: 'Kurs tamamladığınızda sertifikanızı alın.',
      icon: StarIcon,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-20"
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
            alt="Online learning"
          />
          <div className="absolute inset-0 bg-primary-600 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Geleceğinizi
            <span className="block text-primary-200">Bugün İnşa Edin</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-primary-200">
            En kaliteli online kurslarla becerilerinizi geliştirin. 
            Uzman eğitmenlerden öğrenin ve kariyerinizi ileriye taşıyın.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 transition duration-150 ease-in-out"
            >
              Kurslara Göz At
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-primary-700 transition duration-150 ease-in-out"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Neden CourseHub?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Öğrenme deneyiminizi en üst seviyeye çıkaracak özellikler.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="text-center">
                  <div className="flex items-center justify-center h-20 w-20 mx-auto bg-primary-100 rounded-lg">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Courses */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Öne Çıkan Kurslar
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              En popüler ve kaliteli kurslarımızı keşfedin.
            </p>
          </div>

          {loading ? (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.slice(0, 6).map((course) => (
                <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">                        <img
                          className="h-48 w-full object-cover"
                          src={course.thumbnailUrl || '/placeholder-course.jpg'}
                          alt={course.title}
                        />
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(course.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">({course.enrollmentCount || 0})</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.shortDescription}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-primary-600">
                          ₺{course.discountPrice || course.price}
                        </span>
                        {course.discountPrice && (
                          <span className="text-sm text-gray-500 line-through">₺{course.price}</span>
                        )}
                      </div>
                      <Link
                        to={`/courses/${course.id}`}
                        className="text-primary-600 hover:text-primary-500 font-medium text-sm"
                      >
                        Detayları Gör
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition duration-150 ease-in-out"
            >
              Tüm Kursları Görüntüle
              <ArrowRightIcon className="ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Rakamlarla CourseHub
            </h2>
            <p className="mt-3 text-xl text-primary-200 sm:mt-4">
              Binlerce öğrenci güveniyor
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Aktif Kurs
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">250+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Kayıtlı Öğrenci
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">10K+</dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">
                Uzman Eğitmen
              </dt>
              <dd className="order-1 text-5xl font-extrabold text-white">50+</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Home;
