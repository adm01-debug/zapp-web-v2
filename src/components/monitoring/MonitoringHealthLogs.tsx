import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import type { HealthLog } from './hooks/useEvolutionMonitoring';

interface Props {
  healthLogs: HealthLog[];
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  connected: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
  healthy: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
  disconnected: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
  error: { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
  degraded: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/5' },
};

const defaultStatus = { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted/30' };

export function MonitoringHealthLogs({ healthLogs }: Props) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Histórico de Health Checks</CardTitle>
            <CardDescription>Últimas 100 verificações</CardDescription>
          </div>
          <Badge variant="outline" className="text-[10px]">{healthLogs.length} registros</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-1">
            {healthLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Clock className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-sm">Nenhum health check registrado.</p>
              </div>
            ) : healthLogs.map((log, i) => {
              const cfg = statusConfig[log.status] || defaultStatus;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.01, 0.3) }}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg transition-colors hover:bg-muted/50',
                    cfg.bg
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={cn('w-4 h-4 shrink-0', cfg.color)} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{log.instance_id}</span>
                        <Badge variant="outline" className={cn('text-[10px]', cfg.color)}>
                          {log.status}
                        </Badge>
                      </div>
                      {log.error_message && (
                        <p className="text-[11px] text-destructive mt-0.5 truncate max-w-sm">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    {log.response_time_ms != null && (
                      <span className={cn(
                        'font-medium',
                        log.response_time_ms < 300 ? 'text-emerald-500' :
                        log.response_time_ms < 800 ? 'text-amber-500' : 'text-destructive'
                      )}>
                        {log.response_time_ms}ms
                      </span>
                    )}
                    <span className="tabular-nums">{format(new Date(log.checked_at), 'dd/MM HH:mm:ss', { locale: ptBR })}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
