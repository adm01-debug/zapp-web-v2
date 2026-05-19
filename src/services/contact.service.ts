 import { supabase } from '@/integrations/supabase/client';
 import type { Database } from '@/integrations/supabase/types';
 
 export type Contact = Database['public']['Tables']['contacts']['Row'];
 
 export interface SearchContactsParams {
   search_term?: string;
   contact_type_filter?: string | null;
   company_filter?: string | null;
   job_title_filter?: string | null;
   tag_filter?: string | null;
   date_from?: string | null;
   sort_field?: string;
   sort_direction?: string;
   page_size?: number;
   page_offset?: number;
 }
 
 export class ContactService {
   static async searchContacts(params: SearchContactsParams) {
     return supabase.rpc('search_contacts', {
       search_term: params.search_term || '',
       contact_type_filter: params.contact_type_filter || null,
       company_filter: params.company_filter || null,
       job_title_filter: params.job_title_filter || null,
       tag_filter: params.tag_filter || null,
       date_from: params.date_from || null,
       sort_field: params.sort_field || 'name',
       sort_direction: params.sort_direction || 'asc',
       page_size: params.page_size || 50,
       page_offset: params.page_offset || 0,
     });
   }
 
   static async getCountsByType() {
     return supabase.rpc('contacts_count_by_type');
   }
 
   static async getById(id: string) {
     return supabase.from('contacts').select('*').eq('id', id).maybeSingle();
   }
 
   static async update(id: string, updates: Database['public']['Tables']['contacts']['Update']) {
     return supabase.from('contacts').update(updates).eq('id', id).select().single();
   }
 }