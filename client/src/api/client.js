import axios from 'axios';

// In local dev, Vite's proxy forwards '/api' to the local server, so a
// relative path works. In production the client (Vercel) and server
// (Render) are on different origins, so VITE_API_URL must point at the
// deployed backend, e.g. https://your-app.onrender.com/api.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(Object.assign(err, { message }));
  }
);

export default api;