import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const EXTERNAL_URL = 'https://supabase.atomicabr.com.br';
const EXTERNAL_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.rvamc0XHuSCYB1glBwOCCxgfd9yxWVYLnhFzg5-7TRk';

export const isExternalConfigured = true;

export const externalSupabase: SupabaseClient = createClient(EXTERNAL_URL, EXTERNAL_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    autoRefreshToken: true,
    persistSession: false,
  },
  global: {
    headers: {
      'x-client-info': 'zapp-web-external-360',
    },
  },
});

export function getExternalSupabase(): SupabaseClient {
  return externalSupabase;
}