import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Kurslar', href: '/courses' },
  ];

  // Role-based navigation items
  const getRoleBasedNavigation = () => {
    if (!isAuthenticated || !user) return [];
    
    const items = [];
    
    // All authenticated users get dashboard
    items.push({ name: 'Dashboard', href: '/dashboard' });
    
    // Admin-specific navigation
    if (user.role === 'ADMIN') {
      items.push({ name: 'Admin Panel', href: '/admin' });
    }
    
    // Instructor-specific navigation
    if (user.role === 'INSTRUCTOR') {
      items.push({ name: 'Instructor Panel', href: '/instructor' });
    }
    
    return items;
  };

  return (
    <Disclosure as="nav" className="bg-white shadow-lg">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="text-2xl font-bold text-primary-600">
                    CourseHub
                  </Link>
                </div>                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                  {getRoleBasedNavigation().map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-primary-600 hover:border-primary-300 hover:text-primary-700"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {isAuthenticated ? (
                  <div className="relative ml-3">
                    <div>
                      <button
                        type="button"
                        className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        id="user-menu-button"
                        aria-expanded="false"
                        aria-haspopup="true"
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                      >
                        <span className="sr-only">Open user menu</span>
                        {user?.avatar ? (
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar}
                            alt=""
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-white" />
                          </div>
                        )}
                      </button>
                    </div>
                    {isProfileMenuOpen && (                      <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b">
                          <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                          <div className="text-xs text-primary-600 font-medium mt-1">{user?.role}</div>
                        </div>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Admin Panel
                          </Link>
                        )}
                        {user?.role === 'INSTRUCTOR' && (
                          <Link
                            to="/instructor"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            Instructor Panel
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Çıkış Yap
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      to="/login"
                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {getRoleBasedNavigation().map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-primary-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {isAuthenticated ? (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {user?.avatar ? (
                      <img className="h-10 w-10 rounded-full" src={user.avatar} alt="" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    <div className="text-sm font-medium text-primary-600">{user?.role}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Dashboard
                  </Disclosure.Button>
                  {user?.role === 'ADMIN' && (
                    <Disclosure.Button
                      as={Link}
                      to="/admin"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Admin Panel
                    </Disclosure.Button>
                  )}
                  {user?.role === 'INSTRUCTOR' && (
                    <Disclosure.Button
                      as={Link}
                      to="/instructor"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Instructor Panel
                    </Disclosure.Button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Giriş Yap
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Kayıt Ol
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
