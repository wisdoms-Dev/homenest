import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token  = localStorage.getItem('hn_token');
    const stored = localStorage.getItem('hn_user');

    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('hn_token');
        localStorage.removeItem('hn_user');
        setLoading(false);
        return;
      }
      // Try to refresh from backend — but don't crash if it's offline
      authAPI.me()
        .then(res => {
          setUser(res.data);
          localStorage.setItem('hn_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Backend offline is fine — keep the stored user
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('hn_token', token);
    localStorage.setItem('hn_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password, phone) => {
    const res = await authAPI.register({ name, email, password, phone });
    const { token, user } = res.data;
    localStorage.setItem('hn_token', token);
    localStorage.setItem('hn_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('hn_token');
    localStorage.removeItem('hn_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, register, logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);