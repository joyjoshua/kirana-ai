import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Supabase client singleton — uses the SERVICE ROLE key.
 * This bypasses RLS and should ONLY be used on the backend.
 * Never expose this client or its key to the frontend.
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
