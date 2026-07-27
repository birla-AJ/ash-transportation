import apiClient, { tokenStorage } from './apiClient';
import { User } from '../types';

interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export async function login({ email, password, rememberMe }: LoginPayload): Promise<User> {
  const { data } = await apiClient.post('/auth/login', { email, password, rememberMe });
  const { accessToken, refreshToken, user } = data.data;
  await tokenStorage.setTokens({ accessToken, refreshToken });
  return user;
}

export async function logout(): Promise<void> {
  const refreshToken = await tokenStorage.getRefreshToken();
  try {
    await apiClient.post('/auth/logout', { refreshToken });
  } finally {
    await tokenStorage.clear();
  }
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get('/users/me');
  return data.data;
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  const { data } = await apiClient.post('/users/me/change-password', payload);
  return data;
}

export async function updateProfile(payload: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
  const { data } = await apiClient.patch('/users/me', payload);
  return data.data;
}
