 import { useMemo } from 'react';
 import { useQuery } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { startOfDay, endOfDay } from 'date-fns';
 
 export interface DashboardFilters {
   dateRange?: { from: Date; to: Date };
   queueId?: string | null;
   agentId?: string | null;
 }
 
 export function useDashboardStats(filters: DashboardFilters) {
   const todayStart = startOfDay(new Date()).toISOString();
 
   const agentsQuery = useQuery({
     queryKey: ['dashboard-agents', filters.agentId],
     queryFn: async () => {
       let query = supabase
         .from('profiles')
         .select('id, name, is_active, role')
         .or('role.eq.agent,role.eq.supervisor');
       if (filters.agentId) query = query.eq('id', filters.agentId);
       const { data, error } = await query;
       if (error) throw error;
       return {
         agents: data || [],
         onlineAgents: data?.filter(a => a.is_active).length || 0,
         totalAgents: data?.length || 0,
       };
     },
   });
 
   const contactsQuery = useQuery({
     queryKey: ['dashboard-contacts', filters],
     queryFn: async () => {
       let query = supabase
         .from('contacts')
         .select('id, name, phone, avatar_url, queue_id, assigned_to, created_at, updated_at')
         .order('updated_at', { ascending: false });
       if (filters.queueId) query = query.eq('queue_id', filters.queueId);
       if (filters.agentId) query = query.eq('assigned_to', filters.agentId);
       if (filters.dateRange?.from) query = query.gte('updated_at', filters.dateRange.from.toISOString());
       if (filters.dateRange?.to) query = query.lte('updated_at', filters.dateRange.to.toISOString());
       const { data, error } = await query;
       if (error) throw error;
       return data || [];
     },
   });
 
   return {
     agents: agentsQuery.data,
     contacts: contactsQuery.data,
     isLoading: agentsQuery.isLoading || contactsQuery.isLoading,
     error: agentsQuery.error || contactsQuery.error,
     refetch: () => { agentsQuery.refetch(); contactsQuery.refetch(); }
   };
 }