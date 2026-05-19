import { supabase } from '@/integrations/supabase/client';
import type { Message, MessageInsert } from '@/types/chat';

export type { Message, MessageInsert };

export class ChatService {
  static async fetchMessages(contactId: string, page = 0, pageSize = 1000) {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    
    return supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contactId)
      .order('created_at', { ascending: true })
      .range(from, to);
  }

  static async sendMessage(payload: MessageInsert) {
    return supabase.from('messages').insert(payload).select().single();
  }

  static async markAsRead(messageId: string) {
    return supabase.from('messages').update({ is_read: true }).eq('id', messageId);
  }

  static async deleteMessage(messageId: string) {
    return supabase
      .from('messages')
      .update({ is_deleted: true, content: '[Mensagem apagada]' })
      .eq('id', messageId);
  }

  static async uploadAudio(contactId: string, blob: Blob) {
    const fileName = `${contactId}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('audio-messages')
      .upload(fileName, blob, { contentType: 'audio/webm' });

    if (uploadError) throw uploadError;

    const { data: signedData, error: signError } = await supabase.storage
      .from('audio-messages')
      .createSignedUrl(fileName, 3600);

    if (signError) throw signError;
    return signedData.signedUrl;
  }
}
