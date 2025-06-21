import { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firstVisit, setFirstVisit] = useState(true);

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

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('firstVisit', 'false');
    setUser(userData);
    setFirstVisit(false);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, firstVisit, login, logout }}>
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