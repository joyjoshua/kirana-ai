import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3001',
});

// Attach JWT from persisted zustand store on every request
client.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('kirana-auth');
    const token = stored ? (JSON.parse(stored) as { state?: { accessToken?: string } }).state?.accessToken : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // ignore parse errors
  }
  return config;
});

export default client;
