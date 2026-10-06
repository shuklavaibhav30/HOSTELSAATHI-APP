import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from '../utils/tokenStorage';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach bearer token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh & automatic exponential backoff retry for network drops/rate limits
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // Do NOT intercept/retry for auth endpoints (login, register, forgot-password, otps)
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/forgot-password') ||
      originalRequest.url?.includes('/auth/reset-password') ||
      originalRequest.url?.includes('/otp/');

    // 1. Handle 401 Unauthorized (Token Refresh)
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      try {
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
          const newAccessToken = res.data?.data?.accessToken;

          if (newAccessToken) {
            await setAccessToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshErr) {
        await clearTokens();
      }
    }

    // 2. Handle Network Retry for High Concurrency (502, 503, 504, 429 Rate Limit)
    const isNetworkErrorOrServerOverload =
      !error.response ||
      [429, 502, 503, 504].includes(error.response.status);

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (isNetworkErrorOrServerOverload && originalRequest._retryCount < 2 && !isAuthEndpoint) {
      originalRequest._retryCount += 1;
      const backoffDelay = Math.pow(2, originalRequest._retryCount) * 1000; // 2s, 4s backoff
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return axiosInstance(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
