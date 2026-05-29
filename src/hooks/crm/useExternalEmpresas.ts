/**
 * useExternalEmpresas
 * 
 * Fetches unique company names from the external CRM database
 * using search_contacts_advanced RPC (SECURITY DEFINER) to bypass RLS.
 * Direct queries to 'companies' table are blocked by RLS for anon role.
 */
 import { useQuery } from '@tanstack/react-query';
 import { isExternalConfigured } from '@/integrations/supabase/externalClient';
 import { ExternalCRMService } from '@/services/crm/external-crm.service';
 
 export function useExternalEmpresas() {
   return useQuery<string[]>({
     queryKey: ['external-empresas'],
     queryFn: () => ExternalCRMService.fetchUniqueCompanies(),
     enabled: isExternalConfigured,
     staleTime: 1000 * 60 * 30,
     gcTime: 1000 * 60 * 60,
   });
 }
