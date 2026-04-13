import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Stethoscope, CheckCircle2, XCircle, AlertTriangle, Loader2, Wrench, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { DiagnosticResult } from './hooks/useEvolutionMonitoring';

interface Props {
  diagnostic: DiagnosticResult | null;
  diagnosing: boolean;
  onRunDiagnostic: (autoFix?: boolean) => void;
}

const severityConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string; bg: string }> = {
  ok: { icon: CheckCircle2, color: 'text-emerald-500', label: 'OK', bg: 'bg-emerald-500/10' },
  warning: { icon: AlertTriangle, color: 'text-amber-500', label: 'Atenção', bg: 'bg-amber-500/10' },
  critical: { icon: XCircle, color: 'text-destructive', label: 'Crítico', bg: 'bg-destructive/10' },
  error: { icon: XCircle, color: 'text-destructive', label: 'Erro', bg: 'bg-destructive/10' },
};

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-destructive';
  const progressColor = score >= 80 ? '[&>div]:bg-emerald-500' : score >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-destructive';

  return (
    <div className="flex items-center gap-4">
      <motion.div
        className={cn('text-5xl font-bold tabular-nums', color)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {score}
      </motion.div>
      <div className="flex-1 space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Saúde</span>
          <span>{score}/100</span>
        </div>
        <Progress value={score} className={cn('h-2.5 rounded-full', progressColor)} />
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{score >= 80 ? 'Sistema saudável' : score >= 50 ? 'Necessita atenção' : 'Ação imediata necessária'}</span>
        </div>
      </div>
    </div>
  );
}

export function MonitoringDiagnosticPanel({ diagnostic, diagnosing, onRunDiagnostic }: Props) {
  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button onClick={() => onRunDiagnostic(false)} disabled={diagnosing} variant="outline">
          {diagnosing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Stethoscope className="w-4 h-4 mr-2" />}
          Executar Diagnóstico
        </Button>
        <Button onClick={() => onRunDiagnostic(true)} disabled={diagnosing} variant="default">
          {diagnosing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
          Diagnóstico + Auto-Fix
        </Button>
        {diagnostic && (
          <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>Último: {new Date(diagnostic.timestamp).toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>

      {diagnostic && (
        <>
          {/* Overall Health */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Saúde Geral do Sistema</CardTitle>
                <CardDescription>Score baseado em conexão, webhook e fluxo de mensagens</CardDescription>
              </CardHeader>
              <CardContent>
                <ScoreGauge score={diagnostic.overallHealth.score} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Per-instance diagnostics */}
          {diagnostic.diagnostics.map((d, i) => {
            const sev = severityConfig[d.webhookSeverity] || severityConfig.error;
            const SevIcon = sev.icon;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (i + 1) * 0.08 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      {d.instance}
                      <Badge variant={d.connectionState === 'open' ? 'default' : 'destructive'} className="text-xs">
                        {d.connectionState}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Webhook Status */}
                    <div className={cn('flex items-center gap-2 p-2.5 rounded-lg', sev.bg)}>
                      <SevIcon className={cn('w-4 h-4', sev.color)} />
                      <span className="text-sm font-medium">Webhook: {sev.label}</span>
                      {d.webhookIssue && <span className="text-xs text-muted-foreground">— {d.webhookIssue}</span>}
                    </div>

                    {d.webhook && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">URL Correta:</span>{' '}
                          <span className={d.webhook.urlCorrect ? 'text-emerald-500 font-medium' : 'text-destructive font-medium'}>
                            {d.webhook.urlCorrect ? 'Sim ✓' : 'Não ✗'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50">
                          <span className="text-muted-foreground">Eventos:</span>{' '}
                          <span className="font-medium">{d.webhook.eventsCount}</span>
                        </div>
                      </div>
                    )}

                    {d.webhook?.missingCritical && d.webhook.missingCritical.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-xs text-muted-foreground mr-1">Ausentes:</span>
                        {d.webhook.missingCritical.map(e => (
                          <Badge key={e} variant="destructive" className="text-[10px]">{e}</Badge>
                        ))}
                      </div>
                    )}

                    {/* Message Flow */}
                    {d.messageFlow && (
                      <div className="flex items-center gap-4 text-xs">
                        <Badge variant="outline" className={cn(
                          'border',
                          d.messageFlow.flowHealth === 'healthy' ? 'border-emerald-500/30 text-emerald-600' : 'border-destructive/30 text-destructive'
                        )}>
                          Fluxo: {d.messageFlow.flowHealth === 'healthy' ? '✓ Saudável' : d.messageFlow.flowHealth}
                        </Badge>
                        <span className="text-muted-foreground">↓{d.messageFlow.lastHour.incoming} ↑{d.messageFlow.lastHour.outgoing}</span>
                      </div>
                    )}

                    {/* Auto-fix result */}
                    {d.autoFix && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          'p-3 rounded-lg text-xs font-medium',
                          d.autoFix.applied ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
                        )}
                      >
                        {d.autoFix.applied ? '✅ Auto-fix aplicado com sucesso' : '❌ Auto-fix falhou'}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </>
      )}

      {!diagnostic && !diagnosing && (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Execute um diagnóstico para verificar o estado completo do sistema.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
