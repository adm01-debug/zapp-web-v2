import type { Database } from '@/integrations/supabase/client';

export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];

export interface Message extends MessageRow {
  timestamp?: Date;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'interactive';
  mediaUrl?: string;
  isEdited?: boolean;
}

export interface Conversation {
  id: string;
  contact: any;
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
