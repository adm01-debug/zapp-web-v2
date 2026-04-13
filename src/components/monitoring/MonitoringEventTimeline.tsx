import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Radio, MessageSquare, ArrowUp, Wifi, WifiOff, PlugZap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type EventType = 'message_in' | 'message_out' | 'health_ok' | 'health_fail' | 'connection_change';

interface TimelineEvent {
  id: string;
  type: EventType;
  label: string;
  detail: string;
  timestamp: string;
}

const iconMap: Record<EventType, typeof MessageSquare> = {
  message_in: MessageSquare,
  message_out: ArrowUp,
  health_ok: Wifi,
  health_fail: WifiOff,
  connection_change: PlugZap,
};

const colorMap: Record<EventType, string> = {
  message_in: 'text-primary',
  message_out: 'text-emerald-500',
  health_ok: 'text-emerald-500',
  health_fail: 'text-destructive',
  connection_change: 'text-amber-500',
};

type FilterType = 'all' | 'messages' | 'health' | 'connection';

export function MonitoringEventTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const load = async () => {
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
      const [msgRes, healthRes] = await Promise.all([
        supabase.from('messages').select('id, sender, content, created_at').gte('created_at', oneHourAgo).order('created_at', { ascending: false }).limit(20),
        supabase.from('connection_health_logs').select('id, instance_id, status, error_message, checked_at').order('checked_at', { ascending: false }).limit(15),
      ]);

      const timeline: TimelineEvent[] = [];
      msgRes.data?.forEach(m => timeline.push({
        id: m.id,
        type: m.sender === 'contact' ? 'message_in' : 'message_out',
        label: m.sender === 'contact' ? 'Mensagem Recebida' : 'Mensagem Enviada',
        detail: (m.content || '').slice(0, 60) + ((m.content || '').length > 60 ? '…' : ''),
        timestamp: m.created_at,
      }));

      healthRes.data?.forEach(h => {
        const ok = h.status === 'connected' || h.status === 'healthy';
        timeline.push({
          id: h.id,
          type: ok ? 'health_ok' : 'health_fail',
          label: ok ? 'Health OK' : 'Health Falha',
          detail: `${h.instance_id}${h.error_message ? ` — ${h.error_message.slice(0, 40)}` : ''}`,
          timestamp: h.checked_at,
        });
      });

      timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setEvents(timeline.slice(0, 40));
    };

    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return events;
    if (filter === 'messages') return events.filter(e => e.type === 'message_in' || e.type === 'message_out');
    if (filter === 'health') return events.filter(e => e.type === 'health_ok' || e.type === 'health_fail');
    return events.filter(e => e.type === 'connection_change');
  }, [events, filter]);

  const filters: { value: FilterType; label: string; count: number }[] = [
    { value: 'all', label: 'Todos', count: events.length },
    { value: 'messages', label: 'Msgs', count: events.filter(e => e.type.startsWith('message')).length },
    { value: 'health', label: 'Health', count: events.filter(e => e.type.startsWith('health')).length },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Radio className="w-4 h-4 text-primary" />
          Atividade Recente
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Última hora</span>
          <Badge variant="outline" className="text-[10px]">{filtered.length} eventos</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex gap-1">
          {filters.map(f => (
            <Button key={f.value} variant="ghost" size="sm"
              className={cn('h-6 text-[10px] px-2', filter === f.value && 'bg-muted font-semibold')}
              onClick={() => setFilter(f.value)}
            >
              {f.label} ({f.count})
            </Button>
          ))}
        </div>

        <ScrollArea className="h-[340px]">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
              <Radio className="w-10 h-10 mb-2 opacity-20" />
              <p className="text-sm">Nenhuma atividade</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
              <AnimatePresence initial={false}>
                {filtered.map(ev => {
                  const Icon = iconMap[ev.type];
                  return (
                    <motion.div key={ev.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                      className="relative flex items-start gap-3 py-2 pl-1">
                      <div className="relative z-10 flex items-center justify-center w-[30px] h-[30px] rounded-full bg-background border border-border shrink-0">
                        <Icon className={cn('w-3.5 h-3.5', colorMap[ev.type])} />
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{ev.label}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                            {formatDistanceToNow(new Date(ev.timestamp), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{ev.detail}</p>
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
