/**
 * Inbox Service Layer
 *
 * Centralizes all inbox (conversation/message) database operations.
 * Hooks should call these functions instead of building Supabase queries
 * inline, which reduces duplication and makes testing easier.
 *
 * @module services/inbox.service
 */

import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InboxConversation {
  id: string;
  contact_id?: string | null;
  whatsapp_connection_id?: string | null;
  remote_jid?: string | null;
  status?: string | null;
  unread_count?: number | null;
  last_message?: string | null;
  last_message_at?: string | null;
  assigned_to?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InboxMessage {
  id: string;
  conversation_id?: string | null;
  whatsapp_connection_id?: string | null;
  message_id?: string | null;
  remote_jid?: string | null;
  from_me?: boolean | null;
  message_type?: string | null;
  body?: string | null;
  media_url?: string | null;
  timestamp?: string | null;
  status?: string | null;
  created_at?: string | null;
}

export type ConversationStatus = 'open' | 'resolved' | 'pending' | 'archived';

export interface ConversationFilters {
  status?: ConversationStatus | ConversationStatus[];
  assignedTo?: string;
  connectionId?: string;
  tags?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

// ─── Conversation queries ─────────────────────────────────────────────────────

/**
 * Fetch conversations with optional filters.
 * Returns results ordered by last_message_at descending (most recent first).
 */
export async function getConversations(
  filters: ConversationFilters = {},
): Promise<InboxConversation[]> {
  let query = supabase
    .from('conversations' as any)
    .select('*')
    .order('last_message_at', { ascending: false });

  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status);
    } else {
      query = query.eq('status', filters.status);
    }
  }

  if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  if (filters.connectionId) {
    query = query.eq('whatsapp_connection_id', filters.connectionId);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit ?? 20) - 1);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InboxConversation[];
}

/**
 * Fetch a single conversation by ID.
 */
export async function getConversationById(
  id: string,
): Promise<InboxConversation | null> {
  const { data, error } = await supabase
    .from('conversations' as any)
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as InboxConversation;
}

/**
 * Count conversations by status (for sidebar badges / KPIs).
 */
export async function countConversationsByStatus(): Promise<
  Record<ConversationStatus, number>
> {
  const { data, error } = await supabase
    .from('conversations' as any)
    .select('status');

  if (error) throw error;

  const counts: Record<string, number> = {
    open: 0,
    resolved: 0,
    pending: 0,
    archived: 0,
  };

  for (const row of data ?? []) {
    if ((row as any).status && (row as any).status in counts) {
      counts[(row as any).status]++;
    }
  }

  return counts as Record<ConversationStatus, number>;
}

// ─── Conversation mutations ───────────────────────────────────────────────────

/**
 * Update the status of a conversation.
 */
export async function updateConversationStatus(
  id: string,
  status: ConversationStatus,
): Promise<void> {
  const { error } = await supabase
    .from('conversations' as any)
    .update({ status, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Assign a conversation to an agent.
 * Pass null to unassign.
 */
export async function assignConversation(
  id: string,
  agentId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('conversations' as any)
    .update({ assigned_to: agentId, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) throw error;
}

/**
 * Bulk update conversation status.
 * Used by bulk action bars.
 */
export async function bulkUpdateConversationStatus(
  ids: string[],
  status: ConversationStatus,
): Promise<void> {
  const { error } = await supabase
    .from('conversations' as any)
    .update({ status, updated_at: new Date().toISOString() } as any)
    .in('id', ids);

  if (error) throw error;
}

/**
 * Bulk assign conversations to an agent.
 */
export async function bulkAssignConversations(
  ids: string[],
  agentId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('conversations' as any)
    .update({ assigned_to: agentId, updated_at: new Date().toISOString() } as any)
    .in('id', ids);

  if (error) throw error;
}

/**
 * Reset unread count for a conversation (mark as read).
 */
export async function markConversationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('conversations' as any)
    .update({ unread_count: 0, updated_at: new Date().toISOString() } as any)
    .eq('id', id);

  if (error) throw error;
}

// ─── Message queries ──────────────────────────────────────────────────────────

/**
 * Fetch messages for a conversation, paginated, newest first.
 */
export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {},
): Promise<InboxMessage[]> {
  let query = supabase
    .from('evolution_messages_wpp2' as any)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: false })
    .limit(options.limit ?? 50);

  if (options.before) {
    query = query.lt('timestamp', options.before);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as InboxMessage[];
}

/**
 * Fetch the latest message for a set of conversation IDs.
 * Used to populate conversation list previews.
 */
export async function getLatestMessagesByConversations(
  conversationIds: string[],
): Promise<Record<string, InboxMessage>> {
  const { data, error } = await supabase.rpc('get_latest_messages', {
    conversation_ids: conversationIds,
  });

  if (error) throw error;

  const messages: Record<string, InboxMessage> = {};
  for (const row of (data as any) ?? []) {
    messages[row.conversation_id] = row as InboxMessage;
  }

  return messages;
}

// ─── Message mutations ────────────────────────────────────────────────────────

/**
 * Mark a message as read or delivered.
 */
export async function updateMessageStatus(
  messageId: string,
  status: string,
): Promise<void> {
  const { error } = await supabase
    .from('evolution_messages_wpp2' as any)
    .update({ status } as any)
    .eq('message_id', messageId);

  if (error) throw error;
}
