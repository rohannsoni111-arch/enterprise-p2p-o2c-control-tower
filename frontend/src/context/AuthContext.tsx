import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  personas: User[];
  login: (username: string, password?: string) => Promise<void>;
  loginAsPersona: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<User[]>([]);

  // Load demo personas for single-click switching
  useEffect(() => {
    api.get('/auth/personas')
      .then((res) => {
        if (res.data.success) {
          setPersonas(res.data.data);
        }
      })
      .catch((err) => console.error('Error loading personas:', err));
  }, []);

  // Check stored user session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
      setLoading(false);
    } else {
      // Default to auto-login as ADMIN for instant frictionless portfolio review if no session
      loginAsPersona('admin')
        .catch(() => setLoading(false))
        .finally(() => setLoading(false));
    }
  }, []);

  const login = async (username: string, password = 'Password123!') => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    }
  };

  const loginAsPersona = async (username: string) => {
    await login(username, 'Password123!');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, personas, login, loginAsPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
