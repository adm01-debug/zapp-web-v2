/**
 * Evolution API Service Layer
 *
 * Centralizes all Evolution API calls, instance management, and connection
 * status operations. Hooks should call these functions instead of building
 * requests ad-hoc, which reduces duplication and makes mocking/testing easier.
 *
 * @module services/evolution.service
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EvolutionInstance {
  id: string;
  instance_name: string;
  instance_display_name?: string | null;
  status?: string | null;
  qr_code?: string | null;
  phone_number?: string | null;
  is_connected: boolean;
  evolution_api_url?: string | null;
  evolution_api_key?: string | null;
  user_id?: string | null;
  tenant_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface EvolutionConnectionStatus {
  instanceName: string;
  state: 'open' | 'close' | 'connecting' | 'unknown';
  phoneNumber?: string | null;
}

export interface EvolutionMessagePayload {
  instanceName: string;
  number: string;
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  caption?: string;
  fileName?: string;
}

// ─── Instance queries ─────────────────────────────────────────────────────────

/**
 * Fetch all Evolution instances for the current user's tenant.
 * Returns instances ordered by display name ascending.
 */
export async function getEvolutionInstances(): Promise<EvolutionInstance[]> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .order('instance_display_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EvolutionInstance[];
}

/**
 * Fetch a single Evolution instance by its database ID.
 */
export async function getEvolutionInstanceById(
  id: string,
): Promise<EvolutionInstance | null> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as EvolutionInstance;
}

/**
 * Fetch a single Evolution instance by its instance_name (Evolution API key).
 */
export async function getEvolutionInstanceByName(
  instanceName: string,
): Promise<EvolutionInstance | null> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('instance_name', instanceName)
    .single();

  if (error) return null;
  return data as EvolutionInstance;
}

/**
 * Fetch only connected instances (status = 'open' or is_connected = true).
 */
export async function getConnectedEvolutionInstances(): Promise<EvolutionInstance[]> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .select('*')
    .eq('is_connected', true)
    .order('instance_display_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as EvolutionInstance[];
}

// ─── Instance mutations ───────────────────────────────────────────────────────

/**
 * Update the connection status of an instance.
 * Used by webhook handlers when connection state changes.
 */
export async function updateEvolutionInstanceStatus(
  instanceName: string,
  update: {
    status?: string;
    is_connected?: boolean;
    phone_number?: string | null;
    qr_code?: string | null;
  },
): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_connections')
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq('instance_name', instanceName);

  if (error) throw error;
}

/**
 * Upsert an Evolution instance. Creates if not found, updates if exists.
 * Used during instance provisioning flows.
 */
export async function upsertEvolutionInstance(
  payload: Partial<EvolutionInstance> & { instance_name: string },
): Promise<EvolutionInstance> {
  const { data, error } = await supabase
    .from('whatsapp_connections')
    .upsert({ ...payload, updated_at: new Date().toISOString() }, {
      onConflict: 'instance_name',
    })
    .select()
    .single();

  if (error) throw error;
  return data as EvolutionInstance;
}

/**
 * Soft-delete an Evolution instance by marking it inactive.
 * Does NOT call the Evolution API — call disconnect first if needed.
 */
export async function deactivateEvolutionInstance(id: string): Promise<void> {
  const { error } = await supabase
    .from('whatsapp_connections')
    .update({ is_connected: false, status: 'close', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// ─── Evolution API proxy calls (via Supabase Edge Functions) ─────────────────

/**
 * Send a text or media message through an Evolution instance.
 * Delegates to the `evolution-send-message` Edge Function.
 */
export async function sendEvolutionMessage(
  payload: EvolutionMessagePayload,
): Promise<{ messageId?: string; status: string }> {
  const { data, error } = await supabase.functions.invoke('evolution-send-message', {
    body: payload,
  });

  if (error) throw error;
  return data;
}

/**
 * Fetch the current connection status for an instance directly from the
 * Evolution API via the `evolution-instance-status` Edge Function.
 */
export async function fetchEvolutionConnectionStatus(
  instanceName: string,
): Promise<EvolutionConnectionStatus> {
  const { data, error } = await supabase.functions.invoke('evolution-instance-status', {
    body: { instanceName },
  });

  if (error) throw error;
  return data as EvolutionConnectionStatus;
}
