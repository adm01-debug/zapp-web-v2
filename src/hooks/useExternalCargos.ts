/**
 * useExternalCargos
 * 
 * Fetches unique job titles/roles from the external CRM database.
 * - salespeople.role: accessible directly (no RLS blocking anon)
 * - contacts.cargo: blocked by RLS, so we extract from search_contacts_advanced RPC
 */
 import { useQuery } from '@tanstack/react-query';
 import { isExternalConfigured } from '@/integrations/supabase/externalClient';
 import { ExternalCRMService } from '@/services/crm/external-crm.service';
 
 export function useExternalCargos() {
   return useQuery<string[]>({
     queryKey: ['external-cargos'],
     queryFn: () => ExternalCRMService.fetchUniqueRoles(),
     enabled: isExternalConfigured,
     staleTime: 1000 * 60 * 30,
     gcTime: 1000 * 60 * 60,
   });
 }
