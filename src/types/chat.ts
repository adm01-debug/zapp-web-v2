import type { Database } from '@/integrations/supabase/client';

export type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface Message extends MessageRow {
  // Add camelCase aliases for backward compatibility where needed
  timestamp?: Date;
  type?: 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'interactive';
  mediaUrl?: string;
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
  body: string;
  footer?: string;
  buttons?: InteractiveButton[];
  sections?: InteractiveListSection[];
}

export interface InteractiveButton {
  id: string;
  text: string;
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
}
