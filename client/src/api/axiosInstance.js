import axios from 'axios';

const axiosInstance = axios.create({
 baseURL: 'https://plant-store-backend-n5kw.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT automatically to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eplant_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor — auto-logout on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eplant_token');
      localStorage.removeItem('eplant_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
