import { Message, Conversation, ConversationContact, AssignedAgentInfo } from '@/types/chat';
import { RealtimeMessage, ConversationWithMessages, ConversationContact as RealtimeContact } from '@/hooks/useRealtimeMessages';

export function mapRealtimeContactToContact(rc: RealtimeContact): ConversationContact {
  return {
    ...rc,
    avatar: rc.avatar_url || undefined,
    createdAt: new Date(rc.created_at),
    tags: rc.tags || [],
  };
}

export function mapRealtimeMessageToMessage(rm: RealtimeMessage, conversationId?: string): Message {
  return {
    ...rm,
    id: rm.id,
    conversationId: conversationId || rm.contact_id || '',
    content: rm.content,
    type: rm.message_type as Message['type'],
    sender: rm.sender as Message['sender'],
    timestamp: new Date(rm.created_at),
    status: (rm.status as Message['status'] | null) || (rm.is_read ? 'read' : 'delivered'),
    mediaUrl: rm.media_url || undefined,
    transcription: rm.transcription || null,
    transcriptionStatus: (rm.transcription_status as Message['transcriptionStatus']) || null,
    is_deleted: rm.is_deleted ?? false,
    external_id: rm.external_id || undefined,
    created_at: rm.created_at,
  };
}

export function mapRealtimeConversationToConversation(rc: ConversationWithMessages): Conversation {
  return {
    id: rc.contact.id,
    contact: mapRealtimeContactToContact(rc.contact),
    lastMessage: rc.lastMessage ? mapRealtimeMessageToMessage(rc.lastMessage, rc.contact.id) : undefined,
    unreadCount: rc.unreadCount,
    status: 'open',
    priority: (rc.contact.ai_sentiment === 'negative' ? 'high' : 'medium') as Conversation['priority'],
    tags: rc.contact.tags || [],
    createdAt: new Date(rc.contact.created_at),
    updatedAt: new Date(rc.contact.updated_at),
    assignedTo: rc.contact.assigned_to ? { id: rc.contact.assigned_to, name: 'Atendente' } : null,
    sentiment: rc.contact.ai_sentiment,
  };
}
