import type { Database } from '@/integrations/supabase/types';

export type Queue = Database['public']['Tables']['queues']['Row'];
export type QueueMember = Database['public']['Tables']['queue_members']['Row'];

export interface QueueWithMembers extends Queue {
  members: (QueueMember & { profile?: any })[];
  waiting_count: number;
}
