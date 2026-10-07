import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import api from '../services/api';
import { DEMO_USERS } from '../services/mockStore';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('skillchain_token'));
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('skillchain_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    const currentToken = localStorage.getItem('skillchain_token');
    const cachedUser = localStorage.getItem('skillchain_user');

    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res.data) {
        setUser(res.data);
        localStorage.setItem('skillchain_user', JSON.stringify(res.data));
      }
    } catch {
      // If server is offline / localhost is unreachable from Vercel, keep local session alive!
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          // ignore
        }
      } else {
        // Fallback default demo user if token is present
        const defaultUser = DEMO_USERS['alex@student.edu'].user;
        setUser(defaultUser);
        localStorage.setItem('skillchain_user', JSON.stringify(defaultUser));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('skillchain_token', newToken);
    localStorage.setItem('skillchain_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('skillchain_token');
    localStorage.removeItem('skillchain_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser: fetchProfile }}>
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
