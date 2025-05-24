import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'owner';
  address: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    address: string;
  }) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        api.setAuthToken(storedToken);
      }
      
      setLoading(false);
    };
    
    loadStoredAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      api.setAuthToken(newToken);
    } catch (error) {
      console.error('Login error:', error);
      
      const apiError = error as ApiError;
      
      if (apiError.isNetworkError) {
        throw new Error(apiError.message);
      }
      
      if (apiError.status === 401) {
        throw new Error('Invalid email or password');
      }
      
      throw new Error(apiError.message || 'An error occurred during login. Please try again.');
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    address: string;
  }) => {
    try {
      await api.post('/auth/register', userData);
    } catch (error) {
      console.error('Registration error:', error);
      
      const apiError = error as ApiError;
      
      if (apiError.isNetworkError) {
        throw new Error(apiError.message);
      }
      
      throw new Error(apiError.message || 'Registration failed. Please try again.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    api.setAuthToken(null);
  };

  const isAuthenticated = () => {
    return !!token;
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};