import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstVisit, setFirstVisit] = useState(true);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    withCredentials: true, // Add this to send cookies/credentials
  });

  // Add a request interceptor to include credentials
  api.interceptors.request.use(
    (config) => {
      // Ensure credentials are sent with each request
      config.withCredentials = true;
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedFirstVisit = localStorage.getItem('firstVisit');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedFirstVisit === 'false') {
      setFirstVisit(false);
    }
    setLoading(false);
  }, []);

  const updateUser = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/login/', credentials);
      const userData = response.data;
      updateUser(userData);
      localStorage.setItem('firstVisit', 'false');
      setFirstVisit(false);
      return userData;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register/', userData);
      const newUser = response.data;
      updateUser(newUser);
      localStorage.setItem('firstVisit', 'false');
      setFirstVisit(false);
      return newUser;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      firstVisit, 
      login, 
      register,
      logout,
      updateUser,
      api 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};