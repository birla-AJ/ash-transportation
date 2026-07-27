import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { tokenStorage, setSessionExpiredHandler } from '../api/apiClient';
import { login as loginApi, logout as logoutApi, fetchCurrentUser } from '../api/authApi';
import { User } from '../types';

interface LoginArgs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  login: (args: LoginArgs) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        try {
          const me = await fetchCurrentUser();
          setUser(me);
        } catch (e) {
          await tokenStorage.clear();
        }
      }
      setInitializing(false);
    })();
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }: LoginArgs) => {
    const loggedInUser = await loginApi({ email, password, rememberMe });
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchCurrentUser();
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, initializing, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
