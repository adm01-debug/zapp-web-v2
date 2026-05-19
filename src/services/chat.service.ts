 import { supabase } from '@/integrations/supabase/client';
 import type { Database } from '@/integrations/supabase/types';
 
 export type Message = Database['public']['Tables']['messages']['Row'];
 
 export class ChatService {
   static async fetchMessages(contactId: string, page = 0, pageSize = 1000) {
     const from = page * pageSize;
     const to = from + pageSize - 1;
     
     return supabase
       .from('messages')
       .select('*')
       .eq('contact_id', contactId)
       .order('created_at', { ascending: true })
       .range(from, to);
   }
 
   static async sendMessage(payload: Database['public']['Tables']['messages']['Insert']) {
     return supabase.from('messages').insert(payload).select().single();
   }
 
   static async markAsRead(messageId: string) {
     return supabase.from('messages').update({ is_read: true }).eq('id', messageId);
   }
 }