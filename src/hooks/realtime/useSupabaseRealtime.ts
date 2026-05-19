 import { useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js';
 import { log } from '@/lib/logger';
 
 interface RealtimeConfig<T extends { [key: string]: any }> {
   channelName: string;
   table: string;
   filter?: string;
   schema?: string;
   onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
   onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
   onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
   onAll?: (payload: RealtimePostgresChangesPayload<T>) => void;
   enabled?: boolean;
 }
 
 export function useSupabaseRealtime<T extends { [key: string]: any }>(config: RealtimeConfig<T>) {
   const {
     channelName,
     table,
     filter,
     schema = 'public',
     onInsert,
     onUpdate,
     onDelete,
     onAll,
     enabled = true
   } = config;
 
   const handlePayload = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
     if (onAll) onAll(payload);
     if (payload.eventType === 'INSERT' && onInsert) onInsert(payload);
     if (payload.eventType === 'UPDATE' && onUpdate) onUpdate(payload);
     if (payload.eventType === 'DELETE' && onDelete) onDelete(payload);
   }, [onInsert, onUpdate, onDelete, onAll]);
 
   useEffect(() => {
     if (!enabled) return;
 
     let channel: RealtimeChannel;
 
     try {
       channel = supabase
         .channel(channelName)
         .on(
           'postgres_changes',
           {
             event: '*',
             schema,
             table,
             filter,
           },
           handlePayload
         )
         .subscribe((status) => {
           log.debug(`Realtime status (${channelName}):`, status);
         });
     } catch (err) {
       log.error(`Failed to subscribe to realtime (${channelName}):`, err);
       return;
     }
 
     return () => {
       if (channel) {
         supabase.removeChannel(channel);
       }
     };
   }, [enabled, channelName, schema, table, filter, handlePayload]);
 }