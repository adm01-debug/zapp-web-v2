import type { Database } from '@/integrations/supabase/client';

export type ContactRow = Database['public']['Tables']['contacts']['Row'];

export interface Contact extends ContactRow {
  createdAt?: Date;
}

export interface ContactStats {
  totalMessages: number;
  avgResponseTimeMinutes: number;
  totalConversations: number;
  csatAverage: number | null;
  csatCount: number;
}
