// Holds the logged-in user (student OR admin) and exposes login/logout
// helpers. Token + role + user are persisted to localStorage so a page
// refresh doesn't log the user out.
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'student' | 'admin'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('busyway_token');
    const storedUser = localStorage.getItem('busyway_user');
    const storedRole = localStorage.getItem('busyway_role');
    if (token && storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole);
    }
    setLoading(false);
  }, []);

  const login = ({ token, user: userData, role: userRole }) => {
    localStorage.setItem('busyway_token', token);
    localStorage.setItem('busyway_user', JSON.stringify(userData));
    localStorage.setItem('busyway_role', userRole);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('busyway_token');
    localStorage.removeItem('busyway_user');
    localStorage.removeItem('busyway_role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
