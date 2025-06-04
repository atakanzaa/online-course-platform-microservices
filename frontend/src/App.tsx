import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { GoogleAuthWrapper } from './components/GoogleLoginButton';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleProtectedRoute from './components/common/RoleProtectedRoute';

function App() {
  return (
    <GoogleAuthWrapper>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="min-h-[calc(100vh-64px)]">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <RoleProtectedRoute requiredRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleProtectedRoute>
                  } 
                />
                <Route 
                  path="/instructor" 
                  element={
                    <RoleProtectedRoute requiredRoles={['INSTRUCTOR', 'ADMIN']}>
                      <InstructorDashboard />
                    </RoleProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </GoogleAuthWrapper>
  );
}

export default App;
