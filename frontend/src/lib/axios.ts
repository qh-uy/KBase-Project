import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kbase-project.onrender.com/api/v1';

const api = axios.create({
  baseURL: BACKEND_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Only set JSON content-type when body is NOT FormData (file uploads)
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');
        
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://kbase-project.onrender.com/api/v1';
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          token: refreshToken
        });
        
        const newAccessToken = response.data.accessToken;
        useAuthStore.getState().updateToken(newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
