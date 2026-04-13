import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Radio, MessageSquare, UserPlus, Wifi, Phone, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';

interface WebhookEvent {
  id: string;
  event_type: string;
  instance_name: string | null;
  remote_jid: string | null;
  created_at: string;
  processed: boolean;
}

const eventIcon: Record<string, typeof MessageSquare> = {
  'messages.upsert': MessageSquare,
  'contacts.upsert': UserPlus,
  'connection.update': Wifi,
  'call': Phone,
  'labels.association': Tag,
};

const eventLabel: Record<string, string> = {
  'messages.upsert': 'Mensagem',
  'send.message': 'Enviada',
  'contacts.upsert': 'Contato',
  'connection.update': 'Conexão',
  'qrcode.updated': 'QR Code',
  'call': 'Chamada',
  'chats.upsert': 'Chat',
  'presence.update': 'Presença',
  'labels.association': 'Label',
};

export function MonitoringEventTimeline() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      const { data } = await supabase
        .from('evolution_webhook_events')
        .select('id, event_type, instance_name, remote_jid, created_at, processed')
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) setEvents(data);
    };

    loadEvents();

    const channel = supabase
      .channel('monitoring-webhook-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'evolution_webhook_events',
      }, (payload) => {
        const newEvent = payload.new as WebhookEvent;
        setEvents(prev => [newEvent, ...prev].slice(0, 30));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Timeline de Eventos
          <Badge variant="outline" className="text-[10px] ml-auto">{events.length} últimos</Badge>
        </CardTitle>
        <CardDescription>Webhook events recebidos em tempo real</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[360px]">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
              <Radio className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhum evento recebido ainda</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

              <AnimatePresence initial={false}>
                {events.map((ev) => {
                  const Icon = eventIcon[ev.event_type] || Radio;
                  const label = eventLabel[ev.event_type] || ev.event_type;

                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative flex items-start gap-3 py-2 pl-1"
                    >
                      <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full bg-background border border-border shrink-0">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-[10px] font-medium">{label}</Badge>
                          {ev.instance_name && (
                            <span className="text-[10px] text-muted-foreground">{ev.instance_name}</span>
                          )}
                          <Badge variant={ev.processed ? 'default' : 'outline'} className="text-[9px] ml-auto">
                            {ev.processed ? '✓' : '⏳'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {ev.remote_jid && (
                            <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[180px]">
                              {ev.remote_jid.replace('@s.whatsapp.net', '').replace('@g.us', ' (grupo)')}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
