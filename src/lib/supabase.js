import { createClient } from '@supabase/supabase-js';

// These are browser-safe project settings. Never put a service-role or secret key here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dkzpcqoczhefinrojelp.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_qAMwlITE1tiuaiTxVdayGA_CUcU3eVE';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
