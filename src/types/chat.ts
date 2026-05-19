import type { Database } from '@/integrations/supabase/types';

export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export interface Message extends MessageRow {
  timestamp?: Date;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'interactive';
  mediaUrl?: string;
  isEdited?: boolean;
}

export interface ConversationContact {
  id: string;
  name: string;
  surname: string | null;
  nickname: string | null;
  phone: string;
  email: string | null;
  avatar_url: string | null;
  tags: string[] | null;
  company: string | null;
  job_title: string | null;
  assigned_to: string | null;
  queue_id: string | null;
  created_at: string;
  updated_at: string;
  whatsapp_connection_id: string | null;
  contact_type: string | null;
  group_category: string | null;
  ai_sentiment: string | null;
}

export interface Conversation {
  id: string;
  contact: ConversationContact;
  lastMessage?: any;
  unreadCount: number;
  status: 'open' | 'closed' | 'pending' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string | null;
  sentiment?: string | null;
}

export interface InteractiveMessage {
  type: 'button' | 'list';
  header?: { type: 'text' | 'image' | 'video'; text?: string; media_url?: string };
  body: string;
  footer?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveListSection[];
  listButtonText?: string;
}

export interface InteractiveButton {
  id: string;
  text: string;
  title?: string;
  type?: 'reply' | 'url' | 'call';
  url?: string;
  phoneNumber?: string;
}

export interface InteractiveListSection {
  title: string;
  rows: { id: string; title: string; description?: string }[];
}

export interface LocationMessage {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
  isLive?: boolean;
  liveUntil?: string;
}
