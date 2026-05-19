 import { useMemo } from 'react';
 import { startOfDay, endOfDay } from 'date-fns';
 import { useDashboardStats, DashboardFilters } from './dashboard/useDashboardStats';
 
 const getDefaultFilters = (): DashboardFilters => ({
   dateRange: { from: startOfDay(new Date()), to: endOfDay(new Date()) },
   queueId: null,
   agentId: null,
 });
 
 export const useDashboardData = (filters: DashboardFilters = getDefaultFilters()) => {
   const mergedFilters = { ...getDefaultFilters(), ...filters };
   const { agents, contacts, isLoading, error, refetch } = useDashboardStats(mergedFilters);
 
   const stats = useMemo(() => {
     if (!agents || !contacts) return null;
     
     const today = startOfDay(new Date());
     const openConversations = contacts.filter(c => c.assigned_to).length;
     const pendingConversations = contacts.filter(c => !c.assigned_to && c.queue_id).length;
     const resolvedToday = contacts.filter(c => {
       const updatedAt = new Date(c.updated_at);
       return updatedAt >= today && !c.assigned_to;
     }).length;
 
     return {
       openConversations,
       pendingConversations,
       resolvedToday,
       totalConversations: contacts.length,
       onlineAgents: agents.onlineAgents,
       totalAgents: agents.totalAgents,
       queuesStats: [], // Placeholder for now
       recentActivity: [], // Placeholder for now
     };
   }, [agents, contacts]);
 
   return { stats, isLoading, error, refetch };
 };