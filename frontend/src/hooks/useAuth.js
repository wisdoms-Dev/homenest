import React, { createContext, useContext, useState } from 'react';

const AuthCtx = createContext({ user: null, loading: false, login: null, register: null, logout: null });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hn_user')); } catch { return null; }
  });

  const base = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const login = async (email, password) => {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    localStorage.setItem('hn_token', data.token);
    localStorage.setItem('hn_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw { response: { data } };
    localStorage.setItem('hn_token', data.token);
    localStorage.setItem('hn_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthCtx.Provider value={{ user, loading: false, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
export default useAuth;