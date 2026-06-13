/**
 * External Supabase Client — supabase.atomicabr.com.br (CRM 360)
 *
 * Connects to the secondary Supabase instance used by CRM 360 and external
 * integrations. Returns null gracefully when env vars are not set (e.g. in CI).
 *
 * Required env vars:
 *   VITE_EXTERNAL_SUPABASE_URL
 *   VITE_EXTERNAL_SUPABASE_ANON_KEY
 *
 * FIX: unique storageKey prevents "Multiple GoTrueClient instances" browser warning
 * (main branch commit 5e96809 — incorporated here with the env-vars approach)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = import.meta.env.VITE_EXTERNAL_SUPABASE_URL || '';
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env.VITE_EXTERNAL_SUPABASE_ANON_KEY || '';

export const isExternalConfigured = Boolean(
  EXTERNAL_SUPABASE_URL && EXTERNAL_SUPABASE_ANON_KEY
);

export const externalSupabase: SupabaseClient | null = isExternalConfigured
  ? createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY, {
      auth: {
        // Unique key isolates this client from the main one (sb-supabase-auth-token)
        // and from the clientes client (clientes-sb-auth-token).
        storageKey: 'external-sb-auth-token',
        storage:
          typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          'x-client-info': 'zapp-web-external-360',
        },
      },
    })
  : null;

/**
 * Returns the external client, throwing if not configured.
 * Always check `isExternalConfigured` before calling this.
 */
export function getExternalSupabase(): SupabaseClient {
  if (!externalSupabase) {
    throw new Error(
      'External Supabase is not configured. ' +
        'Set VITE_EXTERNAL_SUPABASE_URL and VITE_EXTERNAL_SUPABASE_ANON_KEY.'
    );
  }
  return externalSupabase;
}
