/**
 * Client helper for calling the external-db-proxy edge function
 */
import { supabase } from '@/integrations/supabase/client';

interface ProxySelectParams {
  table: string;
  select?: string;
  filters?: { column: string; operator: string; value: unknown }[];
  order?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  countMode?: 'exact' | 'planned' | 'estimated';
}

interface ProxyMutationParams {
  action: 'insert' | 'update';
  table: string;
  data?: Record<string, unknown> | Record<string, unknown>[];
  match?: Record<string, unknown>;
}

interface ProxyRPCParams {
  action: 'rpc';
  rpc: string;
  params?: Record<string, unknown>;
}

type ProxyParams = ProxySelectParams | ProxyMutationParams | ProxyRPCParams;

interface ProxyResponse<T = unknown> {
  data: T[];
  count?: number;
  error?: string;
}

export async function queryExternalProxy<T = unknown>(params: ProxyParams): Promise<ProxyResponse<T>> {
  const { data, error } = await supabase.functions.invoke('external-db-proxy', {
    body: params,
  });

  if (error) {
    // Edge function not deployed / forbidden on the target Supabase instance
    // (e.g. external VPS proxy is optional and not wired). Treat as not configured
    // so callers (QuarantineMonitor, etc.) silently disable polling instead of
    // spamming warnings.
    const msg = (error.message || '').toLowerCase();
    const ctx = (error as { context?: { status?: number } }).context;
    const status = ctx?.status;
    if (status === 403 || status === 404 || msg.includes('not found') || msg.includes('non-2xx')) {
      return { data: [], count: 0, ...( { notConfigured: true } as object) } as ProxyResponse<T>;
    }
    throw new Error(error.message || 'External DB proxy error');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as ProxyResponse<T>;
}
