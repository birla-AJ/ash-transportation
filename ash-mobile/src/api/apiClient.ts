import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

export const BASE_URL = API_BASE_URL;

const TOKEN_KEY = 'ash_access_token';
const REFRESH_KEY = 'ash_refresh_token';

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },
  async getRefreshToken(): Promise<string | null> {
    return AsyncStorage.getItem(REFRESH_KEY);
  },
  async setTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, accessToken],
      [REFRESH_KEY, refreshToken],
    ]);
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_KEY]);
  },
};

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
// Set by AuthContext so we can force a logout / navigate to Login on refresh failure.
let onSessionExpired: () => void = () => {};
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

function subscribeToRefresh(callback: (token: string) => void) {
  refreshQueue.push(callback);
}

function onRefreshed(newToken: string) {
  refreshQueue.forEach((callback) => callback(newToken));
  refreshQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = (error.config || {}) as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        await tokenStorage.clear();
        onSessionExpired();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeToRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        await tokenStorage.setTokens({ accessToken, refreshToken: newRefreshToken });
        isRefreshing = false;
        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        await tokenStorage.clear();
        onSessionExpired();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
