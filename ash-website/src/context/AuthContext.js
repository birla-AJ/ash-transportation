import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentUser, login as loginApi, logout as logoutApi } from '../api/authApi';
import { tokenStorage } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (err) {
        tokenStorage.clear();
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function login(credentials) {
    const loggedInUser = await loginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function logout() {
    await logoutApi();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
