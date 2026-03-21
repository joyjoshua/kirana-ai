import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/globals.css';
import App from './App';
import { supabase, useAuthStore } from '@/stores/authStore';

// Restore Supabase session on app boot
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({ session, isLoading: false });
});

// Check for existing session
void supabase.auth.getSession().then(({ data }) => {
  useAuthStore.setState({ session: data.session, isLoading: false });
});

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
