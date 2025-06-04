import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User, AuthState } from '../types';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string, role?: 'STUDENT' | 'INSTRUCTOR') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'STUDENT' | 'INSTRUCTOR' = 'STUDENT'
  ) => {
    try {
      const response = await authService.register({
        firstName,
        lastName,
        email,
        password,
        role,
      });
      const { user, token } = response;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
    });
    authService.logout().catch(() => {
      // Ignore logout errors
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
