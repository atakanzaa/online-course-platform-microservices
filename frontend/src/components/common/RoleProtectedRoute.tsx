import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: ('STUDENT' | 'INSTRUCTOR' | 'ADMIN')[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRoles, 
  redirectTo = '/dashboard' 
}) => {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user doesn't have required role, redirect
  if (!requiredRoles.includes(user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
