import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getCurrentUser } from '../api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  apiKey?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if we have an API key in localStorage
        const apiKey = localStorage.getItem('apiKey');
        if (!apiKey) {
          setLoading(false);
          return;
        }

        // Set the API key in the headers for all future requests
        localStorage.setItem('apiKey', apiKey);

        // Get the current user
        const userData = await getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear localStorage if auth check fails
        localStorage.removeItem('apiKey');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      localStorage.setItem('apiKey', response.user.apiKey || '');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await apiRegister(name, email, password);
      // After registration, login automatically
      await login(email, password);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('apiKey');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
