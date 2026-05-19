import type { Message, MessageRow } from '@/types';

export function mapMessageRowToMessage(row: MessageRow): Message {
  return {
    ...row,
    sender: (row.sender as 'agent' | 'contact'),
    timestamp: new Date(row.created_at),
    type: row.message_type as Message['type'],
    mediaUrl: row.media_url || undefined,
    isEdited: !!(row as { is_edited?: boolean }).is_edited,
  };
}
