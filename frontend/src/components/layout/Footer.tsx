import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold text-primary-400">
              CourseHub
            </Link>
            <p className="mt-4 text-gray-300 max-w-md">
              En kaliteli online kurslarla becerilerinizi geliştirin. 
              Uzman eğitmenlerden öğrenin ve kariyerinizi ileriye taşıyın.
            </p>            <div className="mt-6 flex space-x-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297L3.934 16.9l1.292-1.171c-.8-.88-1.292-2.02-1.292-3.314 0-2.734 2.226-4.96 4.96-4.96s4.96 2.226 4.96 4.96c0 2.734-2.226 4.96-4.96 4.96l-.445-.387z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Kategoriler
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/courses?category=programming" className="text-base text-gray-300 hover:text-white">
                  Programlama
                </Link>
              </li>
              <li>
                <Link to="/courses?category=design" className="text-base text-gray-300 hover:text-white">
                  Tasarım
                </Link>
              </li>
              <li>
                <Link to="/courses?category=business" className="text-base text-gray-300 hover:text-white">
                  İş Dünyası
                </Link>
              </li>
              <li>
                <Link to="/courses?category=marketing" className="text-base text-gray-300 hover:text-white">
                  Pazarlama
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              Destek
            </h3>            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/help" className="text-base text-gray-300 hover:text-white">
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-300 hover:text-white">
                  İletişim
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-base text-gray-300 hover:text-white">
                  SSS
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-base text-gray-300 hover:text-white">
                  Geri Bildirim
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link to="/privacy" className="text-gray-400 hover:text-gray-300">
              Gizlilik Politikası
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-gray-300">
              Kullanım Koşulları
            </Link>
          </div>
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; 2025 CourseHub. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
