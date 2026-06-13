import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Self-hosted Supabase — resolução por env com fallback final.
// ANON KEY é pública por design — seguro no bundle.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_EXTERNAL_SUPABASE_URL ||
  'https://supabase.atomicabr.com.br';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.rvamc0XHuSCYB1glBwOCCxgfd9yxWVYLnhFzg5-7TRk';

if (!SUPABASE_URL) {
  console.warn('[Supabase] usando fallback self-hosted');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-app-name': 'zapp-web',
      'x-app-version': '2.0.1',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export type SupabaseClient = typeof supabase;
