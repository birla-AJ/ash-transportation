import apiClient, { tokenStorage } from './apiClient';

export async function login({ email, password, rememberMe }) {
  const { data } = await apiClient.post('/auth/login', { email, password, rememberMe });
  const { accessToken, refreshToken, user } = data.data;
  tokenStorage.setTokens({ accessToken, refreshToken }, !!rememberMe);
  return user;
}

export async function logout() {
  const refreshToken = tokenStorage.getRefreshToken();
  try {
    await apiClient.post('/auth/logout', { refreshToken });
  } finally {
    tokenStorage.clear();
  }
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/users/me');
  return data.data;
}
