import axios from 'axios';

const api = axios.create({ baseURL: 'https://api-micro.freeloz.com' });

// Add a request interceptor
api.interceptors.request.use(
  config => {
    // Si la ruta de la solicitud es /visitas y el método no es GET, se envía el token
    if (config.url == '/visitas') return config;
    if (config.method == 'get') return config;

    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;