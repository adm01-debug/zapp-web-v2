import type { Database } from '@/integrations/supabase/types';

export type Contact = Database['public']['Tables']['contacts']['Row'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export interface ContactStats {
  totalMessages: number;
  avgResponseTimeMinutes: number;
  totalConversations: number;
  csatAverage: number | null;
  csatCount: number;
}
