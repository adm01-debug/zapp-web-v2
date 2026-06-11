import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createRunGuard } from '@/lib/runGuard';
import { log } from '@/lib/logger';

export interface ConnectionQueue {
  id: string;
  whatsapp_connection_id: string;
  queue_id: string;
  created_at: string;
}

export function useConnectionQueues(connectionId?: string) {
  const [connectionQueues, setConnectionQueues] = useState<ConnectionQueue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Troca rápida de conexão: respostas atrasadas não podem sobrescrever a atual
  const guard = useRef(createRunGuard()).current;
  // Chave ativa: um callback criado num render antigo não pode, após seu await,
  // recarregar/alterar a lista da conexão anterior (re-legitimaria o run velho)
  const activeConnectionRef = useRef(connectionId);

  const fetchQueues = useCallback(async () => {
    if (!connectionId) return;
    const runId = guard.start();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_connection_queues')
        .select('*')
        .eq('whatsapp_connection_id', connectionId);
      if (error) throw error;
      if (!guard.isCurrent(runId)) return;
      setConnectionQueues(data || []);
    } catch (err) {
      log.error('Error fetching connection queues:', err);
    } finally {
      // Um run obsoleto não pode apagar o spinner do run mais novo em andamento
      if (guard.isCurrent(runId)) setIsLoading(false);
    }
  }, [connectionId, guard]);

  useEffect(() => {
    activeConnectionRef.current = connectionId;
    fetchQueues();
  }, [connectionId, fetchQueues]);

  const addQueue = useCallback(async (queueId: string) => {
    if (!connectionId) return;
    try {
      const { error } = await supabase
        .from('whatsapp_connection_queues')
        .insert({ whatsapp_connection_id: connectionId, queue_id: queueId });
      if (error) throw error;
      if (activeConnectionRef.current === connectionId) await fetchQueues();
    } catch (err) {
      log.error('Error adding queue to connection:', err);
      throw err;
    }
  }, [connectionId, fetchQueues]);

  const removeQueue = useCallback(async (queueId: string) => {
    if (!connectionId) return;
    try {
      const { error } = await supabase
        .from('whatsapp_connection_queues')
        .delete()
        .eq('whatsapp_connection_id', connectionId)
        .eq('queue_id', queueId);
      if (error) throw error;
      // A conexão exibida pode ter outro vínculo com o mesmo queue_id; só filtra
      // a lista local se ela ainda pertence à conexão deste callback
      if (activeConnectionRef.current === connectionId) {
        setConnectionQueues(prev => prev.filter(cq => cq.queue_id !== queueId));
      }
    } catch (err) {
      log.error('Error removing queue from connection:', err);
      throw err;
    }
  }, [connectionId]);

  return { connectionQueues, isLoading, addQueue, removeQueue, refetch: fetchQueues };
}
