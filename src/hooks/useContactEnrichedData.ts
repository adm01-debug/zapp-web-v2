import { useQuery } from '@tanstack/react-query';
import { ContactService } from '@/services/contact.service';
import { log } from '@/lib/logger';

export interface EnrichedContactData {
  company: string | null;
  job_title: string | null;
  nickname: string | null;
  surname: string | null;
  contact_type: string | null;
  ai_sentiment: string | null;
  ai_priority: string | null;
  channel_type: string | null;
}

export interface AIConversationTag {
  id: string;
  tag_name: string;
  confidence: number | null;
  source: string | null;
}

export interface SLAInfo {
  first_response_breached: boolean | null;
  resolution_breached: boolean | null;
  first_response_at: string | null;
  resolved_at: string | null;
}

export function useContactEnrichedData(contactId: string) {
  const { data: enrichedData } = useQuery({
    queryKey: ['contact-enriched', contactId],
    queryFn: async () => {
      const { data, error } = await ContactService.fetchEnrichedData(contactId);
      if (error) {
        log.error('Error fetching enriched contact data:', error);
        return null;
      }
      return data as EnrichedContactData;
    },
    enabled: !!contactId,
  });

  const { data: aiTags = [] } = useQuery({
    queryKey: ['contact-ai-tags', contactId],
    queryFn: async () => {
      const { data, error } = await ContactService.fetchAITags(contactId);
      if (error) {
        log.error('Error fetching AI tags:', error);
        return [];
      }
      return data as AIConversationTag[];
    },
    enabled: !!contactId,
  });

  const { data: slaInfo } = useQuery({
    queryKey: ['contact-sla', contactId],
    queryFn: async () => {
      const { data, error } = await ContactService.fetchSLA(contactId);
      if (error) {
        log.error('Error fetching SLA info:', error);
        return null;
      }
      return data as SLAInfo | null;
    },
    enabled: !!contactId,
  });

  return { enrichedData, aiTags, slaInfo };
}
