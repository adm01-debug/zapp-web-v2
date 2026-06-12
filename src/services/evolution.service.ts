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
    .from('whatsapp_connections_safe' as any)
    .select('*')
    .order('instance_display_name' as any, { ascending: true });

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    ...item,
    instance_name: item.name,
    is_connected: item.status === 'open'
  })) as EvolutionInstance[];
}

/**
 * Fetch a single Evolution instance by its database ID.
 */
export async function getEvolutionInstanceById(
  id: string,
): Promise<EvolutionInstance | null> {
  const { data, error } = await supabase
    .from('whatsapp_connections_safe' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  const item = data as any;
  return {
    ...item,
    instance_name: item.name,
    is_connected: item.status === 'open'
  } as EvolutionInstance;
}

/**
 * Fetch a single Evolution instance by its instance_name (Evolution API key).
 */
export async function getEvolutionInstanceByName(
  instanceName: string,
): Promise<EvolutionInstance | null> {
  const { data, error } = await supabase
    .from('whatsapp_connections_safe' as any)
    .select('*')
    .eq('name', instanceName)
    .single();

  if (error) return null;
  const item = data as any;
  return {
    ...item,
    instance_name: item.name,
    is_connected: item.status === 'open'
  } as EvolutionInstance;
}

/**
 * Fetch only connected instances (status = 'open' or is_connected = true).
 */
export async function getConnectedEvolutionInstances(): Promise<EvolutionInstance[]> {
  const { data, error } = await supabase
    .from('whatsapp_connections_safe' as any)
    .select('*')
    .eq('status', 'open');

  if (error) throw error;
  return (data ?? []).map((item: any) => ({
    ...item,
    instance_name: item.name,
    is_connected: item.status === 'open'
  })) as EvolutionInstance[];
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
    .from('whatsapp_connections' as any)
    .update({ ...update, updated_at: new Date().toISOString() } as any)
    .eq('instance_name', instanceName);

  if (error) throw error;
}

// ─── Messaging ──────────────────────────────────────────────────────────────

/**
 * Send a text message via Evolution API.
 */
export async function sendEvolutionMessage(
  payload: EvolutionMessagePayload,
): Promise<void> {
  const { data: config } = await supabase
    .from('whatsapp_connections_safe' as any)
    .select('evolution_api_url, evolution_api_key')
    .eq('name', payload.instanceName)
    .single();

  if (!config?.evolution_api_url) {
    throw new Error(`Instance ${payload.instanceName} not configured or not found.`);
  }

  const response = await fetch(
    `${config.evolution_api_url}/message/sendText/${payload.instanceName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.evolution_api_key as string,
      },
      body: JSON.stringify({
        number: payload.number,
        text: payload.text,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send message via Evolution API');
  }
}

/**
 * Send media (image/video/audio/document) via Evolution API.
 */
export async function sendEvolutionMedia(
  payload: EvolutionMessagePayload,
): Promise<void> {
  const { data: config } = await supabase
    .from('whatsapp_connections_safe' as any)
    .select('evolution_api_url, evolution_api_key')
    .eq('name', payload.instanceName)
    .single();

  if (!config?.evolution_api_url) {
    throw new Error(`Instance ${payload.instanceName} not configured or not found.`);
  }

  const response = await fetch(
    `${config.evolution_api_url}/message/sendMedia/${payload.instanceName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.evolution_api_key as string,
      },
      body: JSON.stringify({
        number: payload.number,
        mediaUrl: payload.mediaUrl,
        mediaType: payload.mediaType,
        caption: payload.caption,
        fileName: payload.fileName,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to send media via Evolution API');
  }
}
