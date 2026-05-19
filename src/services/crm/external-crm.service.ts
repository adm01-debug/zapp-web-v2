  import { getExternalSupabase } from '@/integrations/supabase/externalClient';
  import { queryExternalProxy } from '@/lib/externalProxy';
   static async fetchEvolutionMessages(limit = 500) {
     const result = await queryExternalProxy<any>({
       table: 'evolution_messages',
       select: '*',
       order: { column: 'created_at', ascending: false },
       limit,
     });
     return result.data;
   }
 
   static async fetchEvolutionMessagesByJid(remoteJid: string, limit = 1000) {
     const result = await queryExternalProxy<any>({
       table: 'evolution_messages',
       select: '*',
       filters: [{ column: 'remote_jid', operator: 'eq', value: remoteJid }],
       order: { column: 'created_at', ascending: true },
       limit,
     });
     return result.data;
   }
 import { log } from '@/lib/logger';
 
 export class ExternalCRMService {
   static async getContact360(phone: string) {
     const cleanedPhone = phone.replace(/[^0-9]/g, '');
     if (cleanedPhone.length < 8) return null;
 
     const { data, error } = await getExternalSupabase().rpc('get_contact_360_by_phone', {
       p_phone: cleanedPhone,
     });
 
     if (error) {
       log.error('[ExternalCRMService] Error fetching contact 360:', error);
       return null;
     }
 
     return data;
   }
 
   static async fetchUniqueCompanies(maxPages = 5, pageSize = 200) {
     const allNames: string[] = [];
     let page = 0;
 
     while (page < maxPages) {
       const { data, error } = await getExternalSupabase().rpc('search_contacts_advanced', {
         p_search: null,
         p_vendedor: null,
         p_ramo: null,
         p_rfm_segment: null,
         p_estado: null,
         p_cliente_ativado: true,
         p_ja_comprou: null,
         p_sort_by: 'name',
         p_page: page,
         p_page_size: pageSize,
       });
 
       if (error) {
         log.error('[ExternalCRMService] Error fetching companies:', error);
         break;
       }
 
       const results = (data as any)?.results || [];
       if (results.length === 0) break;
 
       results.forEach((r: any) => {
         const name = String(r.company_name || '').trim();
         if (name) allNames.push(name);
       });
 
       if (results.length < pageSize) break;
       page++;
     }
 
     return [...new Set(allNames)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
   }
 
   static async fetchUniqueRoles() {
     const allCargos: string[] = [];
 
     const { data: salesRoles, error: e1 } = await getExternalSupabase()
       .from('salespeople')
       .select('role')
       .not('role', 'is', null)
       .limit(500);
 
     if (!e1 && salesRoles) {
       salesRoles.forEach((r: any) => {
         const v = String(r.role || '').trim();
         if (v) allCargos.push(v);
       });
     }
 
     const { data: searchData, error: e2 } = await getExternalSupabase().rpc('search_contacts_advanced', {
       p_cliente_ativado: true,
       p_page: 0,
       p_page_size: 200,
     });
 
     if (!e2 && searchData) {
       const results = (searchData as any)?.results || [];
       results.forEach((r: any) => {
         const v = String(r.cargo || '').trim();
         if (v) allCargos.push(v);
       });
     }
 
     return [...new Set(allCargos)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
   }
 }