/**
 * useExternalEvolution — Hooks for reading evolution_messages from external FATOR X DB
 * Replaces the local DB reads for the Inbox when external DB is the source of truth.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
 import {
   buildExternalConversations,
   evolutionToRealtimeMessage,
 } from '@/adapters/evolutionAdapter';
 import { ExternalCRMService } from '@/services/crm/external-crm.service';
import type { RealtimeMessage } from '@/hooks/useRealtimeMessages';
import { getLogger } from '@/lib/logger';

const log = getLogger('useExternalEvolution');

const POLL_INTERVAL = 5000; // 5s polling

// ─── Hook: External Conversations (list for sidebar) ──────────
export function useExternalConversations(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['external-evolution', 'conversations'],
     queryFn: async () => {
       const messages = await ExternalCRMService.fetchEvolutionMessages(500);
       return buildExternalConversations(messages);
     },
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
    staleTime: POLL_INTERVAL - 1000,
  });

  return {
    conversations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
  };
}

// ─── Hook: External Messages for a specific contact/jid ───────
export function useExternalMessages(remoteJid: string | null) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const previousJidRef = useRef<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!remoteJid || !mountedRef.current) {
      if (mountedRef.current) { setMessages([]); setLoading(false); }
      return;
    }

     try {
       setLoading(true);
       setError(null);
       const evoMessages = await ExternalCRMService.fetchEvolutionMessagesByJid(remoteJid);
       if (mountedRef.current) {
         setMessages(evoMessages.map(evolutionToRealtimeMessage));
       }
     } catch (err) {
      log.error('Error fetching external messages:', err);
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [remoteJid]);

  // Fetch on jid change
  useEffect(() => {
    if (remoteJid !== previousJidRef.current) {
      previousJidRef.current = remoteJid;
      fetchMessages();
    }
  }, [remoteJid, fetchMessages]);

  // Polling for new messages
  useEffect(() => {
    if (!remoteJid) return;
    const interval = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [remoteJid, fetchMessages]);

  const addMessage = useCallback((message: RealtimeMessage) => {
    setMessages(prev => {
      if (prev.some(m => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<RealtimeMessage>) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, ...updates } : m));
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, []);

  return { messages, loading, error, refetch: fetchMessages, addMessage, updateMessage, removeMessage };
}
