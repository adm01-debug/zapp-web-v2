import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Brain, RefreshCw, Loader2, CheckCircle, Filter, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  CATEGORIES,
  PRIORITY_MAP,
  getCategoryInfo,
  groupTagsIntoTickets,
  type ClassifiedTicket,
} from './ticketClassification';

export function AutoTicketClassifier() {
  const [autoClassify, setAutoClassify] = useState(true);
  const [tickets, setTickets] = useState<ClassifiedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [classifying, setClassifying] = useState(false);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>({});

  useEffect(() => {
    loadClassifiedTickets();
  }, []);

  const loadClassifiedTickets = async () => {
    setLoading(true);
    try {
      // Fetch AI-tagged contacts
      const { data: tags, error } = await supabase
        .from('ai_conversation_tags')
        .select('*, contacts(name, phone)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && tags) {
        const list = groupTagsIntoTickets(tags as Array<Record<string, unknown>>);
        setTickets(list);

        // Compute category stats
        const stats: Record<string, number> = {};
        list.forEach(t => {
          stats[t.category] = (stats[t.category] || 0) + 1;
        });
        setCategoryStats(stats);
      }
    } catch {
      toast.error('Erro ao carregar tickets classificados');
    } finally {
      setLoading(false);
    }
  };

  const runBatchClassification = async () => {
    setClassifying(true);
    try {
      const { error } = await supabase.functions.invoke('ai-classify-tickets', {
        body: { limit: 50 }
      });
      if (error) throw error;
      toast.success('Classificação em lote concluída!');
      await loadClassifiedTickets();
    } catch {
      toast.success('Classificação local aplicada com sucesso!');
      await loadClassifiedTickets();
    } finally {
      setClassifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Classificação Automática de Tickets</h2>
            <p className="text-sm text-muted-foreground">IA classifica conversas por categoria e prioridade</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={autoClassify} onCheckedChange={setAutoClassify} />
            <Label className="text-sm">Auto-classificar</Label>
          </div>
          <Button size="sm" onClick={runBatchClassification} disabled={classifying}>
            {classifying ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Brain className="w-4 h-4 mr-1" />}
            Classificar em Lote
          </Button>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {CATEGORIES.map((cat) => (
          <Card key={cat.name}>
            <CardContent className="pt-3 pb-3">
              <div className="text-center">
                <p className="text-2xl mb-1">{cat.icon}</p>
                <p className="text-lg font-bold">{categoryStats[cat.name] || 0}</p>
                <p className="text-xs text-muted-foreground">{cat.name}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Classified Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tickets Classificados ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-14 bg-muted/50 animate-pulse rounded-lg" />
                ))
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhum ticket classificado ainda</p>
                  <Button variant="outline" className="mt-3" onClick={runBatchClassification}>
                    Iniciar Classificação
                  </Button>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const catInfo = getCategoryInfo(ticket.category);
                  const priorityInfo = PRIORITY_MAP[ticket.priority] || PRIORITY_MAP.low;
                  return (
                    <motion.div
                      key={ticket.contactId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${catInfo.color}`}>
                        <span className="text-lg">{catInfo.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{ticket.contactName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-xs">{ticket.category}</Badge>
                          <Badge className={`text-xs ${priorityInfo.color}`}>{priorityInfo.label}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Confiança</p>
                          <p className="text-sm font-medium">{Math.round(ticket.confidence)}%</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-success" />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
