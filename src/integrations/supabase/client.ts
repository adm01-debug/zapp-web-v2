import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Self-hosted Supabase em supabase.atomicabr.com.br.
// IMPORTANTE: NÃO ler VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — essas
// variáveis são auto-injetadas pelo Lovable Cloud apontando para o projeto interno
// (vpkmqeumtxhrwgawxdrl) e levariam o app para o banco errado. Secrets do tipo
// EXTERNAL_* só existem em edge functions, não no bundle, então usamos valores
// fixos aqui (a ANON KEY é pública por design).
export const SUPABASE_URL = 'https://supabase.atomicabr.com.br';

export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.rvamc0XHuSCYB1glBwOCCxgfd9yxWVYLnhFzg5-7TRk';

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
