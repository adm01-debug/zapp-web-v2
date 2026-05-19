import type { Message, MessageRow } from '@/types';

export function mapMessageRowToMessage(row: MessageRow): Message {
  return {
    ...row,
    timestamp: new Date(row.created_at),
    type: row.message_type as any,
    mediaUrl: row.media_url || undefined,
    isEdited: !!(row as any).is_edited
  };
}
