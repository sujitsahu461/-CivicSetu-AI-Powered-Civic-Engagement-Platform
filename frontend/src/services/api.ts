import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach JWT access token
api.interceptors.request.use(
  (config) => {
    const isPublicAuthRoute =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register') ||
      config.url?.includes('/auth/captcha') ||
      config.url?.includes('/auth/forgot-password') ||
      config.url?.includes('/auth/reset-password') ||
      config.url?.includes('/auth/refresh');

    if (!isPublicAuthRoute) {
      const token = localStorage.getItem('civicsetu_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for token refresh or error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Handle 401 Unauthorized for token refresh (exclude public login/register/auth endpoints)
    const isAuthRoute =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/captcha') ||
      originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('civicsetu_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/v1/auth/refresh/', {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          if (newAccess) {
            localStorage.setItem('civicsetu_access_token', newAccess);
            if (res.data.refresh) {
              localStorage.setItem('civicsetu_refresh_token', res.data.refresh);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            return api(originalRequest);
          }
        } catch {
          localStorage.removeItem('civicsetu_access_token');
          localStorage.removeItem('civicsetu_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
