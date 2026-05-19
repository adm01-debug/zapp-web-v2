import type { Database } from '@/integrations/supabase/client';

export type QueueRow = Database['public']['Tables']['queues']['Row'];
export type QueueMemberRow = Database['public']['Tables']['queue_members']['Row'];

export interface Queue extends QueueRow {
  // Compatibility
}

export interface QueueMember extends QueueMemberRow {
  profile?: {
    id: string;
    name: string;
    avatar_url: string | null;
    is_active: boolean;
  };
}

export interface QueueWithMembers extends Queue {
  members: QueueMember[];
  waiting_count: number;
}
