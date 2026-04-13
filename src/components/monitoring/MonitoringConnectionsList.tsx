import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Wifi, WifiOff, CheckCircle2, XCircle, AlertTriangle, Clock, Settings2, PlayCircle, Loader2, RefreshCw, QrCode, ChevronDown, Copy, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ConnectionInfo, WebhookTestResult } from './hooks/useEvolutionMonitoring';

interface Props {
  connections: ConnectionInfo[];
  webhookTest: WebhookTestResult;
  onCheckWebhook: (id: string) => void;
  onTestWebhook: (id: string) => void;
}

const statusIcon = (s: string | null) => {
  if (s === 'connected' || s === 'healthy') return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
  if (s === 'disconnected' || s === 'error') return <XCircle className="w-3.5 h-3.5 text-destructive" />;
  if (s === 'degraded') return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
  return <Clock className="w-3.5 h-3.5 text-muted-foreground" />;
};

function latencyBadge(ms: number | null) {
  if (ms == null) return null;
  const cls = ms < 300 ? 'text-emerald-500' : ms < 800 ? 'text-amber-500' : 'text-destructive';
  const label = ms < 300 ? 'Excelente' : ms < 800 ? 'Boa' : 'Lenta';
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn('font-bold text-sm tabular-nums', cls)}>{ms}ms</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ConnectionDetailRow({ label, value, copyable }: { label: string; value: string | null; copyable?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium">{value}</span>
        {copyable && (
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { navigator.clipboard.writeText(value); toast.success('Copiado!'); }}>
            <Copy className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function MonitoringConnectionsList({ connections, webhookTest, onCheckWebhook, onTestWebhook }: Props) {
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [loadingQr, setLoadingQr] = useState<Record<string, boolean>>({});
  const [reconnecting, setReconnecting] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchQr = useCallback(async (id: string) => {
    setLoadingQr(p => ({ ...p, [id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api', { body: { action: 'get-qrcode', instanceName: id } });
      if (error) throw error;
      const b64 = data?.qrcode?.base64 || data?.base64;
      if (b64) setQrCodes(p => ({ ...p, [id]: b64 }));
      else toast.info('QR Code indisponível — instância pode já estar conectada.');
    } catch { toast.error('Erro ao buscar QR Code'); }
    finally { setLoadingQr(p => ({ ...p, [id]: false })); }
  }, []);

  const reconnect = useCallback(async (id: string) => {
    setReconnecting(p => ({ ...p, [id]: true }));
    try {
      const { error } = await supabase.functions.invoke('evolution-api', { body: { action: 'restart-instance', instanceName: id } });
      if (error) throw error;
      toast.success(`Instância ${id} reiniciada!`);
    } catch { toast.error('Erro ao reconectar'); }
    finally { setReconnecting(p => ({ ...p, [id]: false })); }
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(p => ({ ...p, [id]: !p[id] }));
  }, []);

  if (!connections.length) return (
    <Card><CardContent className="py-12 text-center">
      <WifiOff className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">Nenhuma conexão cadastrada.</p>
      <p className="text-[11px] text-muted-foreground/60 mt-1">Cadastre uma conexão no painel da Evolution API para começar.</p>
    </CardContent></Card>
  );

  return (
    <div className="space-y-3" role="list" aria-label="Lista de conexões WhatsApp">
      {connections.map((conn, i) => {
        const offline = conn.status !== 'connected';
        const isExpanded = expanded[conn.instance_id] ?? false;

        return (
          <motion.div key={conn.id} role="listitem" aria-label={`Conexão ${conn.instance_id} - ${conn.status}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Collapsible open={isExpanded} onOpenChange={() => toggleExpand(conn.instance_id)}>
              <Card className="hover:shadow-md transition-all border-border/60">
                <CardContent className="py-4 px-5">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', conn.status === 'connected' ? 'bg-emerald-500/10' : 'bg-destructive/10')}>
                        {conn.status === 'connected' ? <Wifi className="w-5 h-5 text-emerald-500" /> : <WifiOff className="w-5 h-5 text-destructive" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{conn.instance_id}</span>
                          <Badge variant={conn.status === 'connected' ? 'default' : 'destructive'} className="text-[10px]">{conn.status}</Badge>
                          {conn.health_status && <Badge variant="outline" className="text-[10px] gap-1">{statusIcon(conn.health_status)}{conn.health_status}</Badge>}
                        </div>
                        <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground flex-wrap">
                          {conn.phone_number && <span>📱 {conn.phone_number}</span>}
                          {conn.health_response_ms != null && (
                            <span className={cn('font-medium', conn.health_response_ms < 300 ? 'text-emerald-500' : conn.health_response_ms < 800 ? 'text-amber-500' : 'text-destructive')}>
                              ⚡ {conn.health_response_ms}ms
                            </span>
                          )}
                          {conn.last_health_check && <span>🕐 {formatDistanceToNow(new Date(conn.last_health_check), { addSuffix: true, locale: ptBR })}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      {offline && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => fetchQr(conn.instance_id)} disabled={loadingQr[conn.instance_id]} className="text-xs h-8">
                            {loadingQr[conn.instance_id] ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <QrCode className="w-3.5 h-3.5 mr-1" />}QR
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => reconnect(conn.instance_id)} disabled={reconnecting[conn.instance_id]} className="text-xs h-8 text-amber-600">
                            {reconnecting[conn.instance_id] ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 mr-1" />}Reconectar
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onCheckWebhook(conn.instance_id)} className="text-xs h-8">
                        <Settings2 className="w-3.5 h-3.5 mr-1" />Webhook
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onTestWebhook(conn.instance_id)} disabled={webhookTest.status === 'testing'} className="text-xs h-8">
                        {webhookTest.status === 'testing' ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />Testando</> : <><PlayCircle className="w-3.5 h-3.5 mr-1" />Testar</>}
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-xs h-8 w-8 p-0">
                          <ChevronDown className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')} />
                          <span className="sr-only">Detalhes da conexão</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>

                  {/* QR Code */}
                  <AnimatePresence>
                    {qrCodes[conn.instance_id] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-4 flex justify-center overflow-hidden">
                        <div className="p-4 bg-background rounded-xl border shadow-sm">
                          <img src={qrCodes[conn.instance_id]} alt={`QR Code para ${conn.instance_id}`} className="w-48 h-48 object-contain" />
                          <p className="text-[10px] text-center text-muted-foreground mt-2">Escaneie com WhatsApp</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Expandable Details */}
                  <CollapsibleContent>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-border/40">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5 text-primary" />Informações
                          </p>
                          <div className="rounded-lg bg-muted/30 p-3">
                            <ConnectionDetailRow label="ID" value={conn.id} copyable />
                            <ConnectionDetailRow label="Instance ID" value={conn.instance_id} copyable />
                            <ConnectionDetailRow label="Telefone" value={conn.phone_number} copyable />
                            <ConnectionDetailRow label="Status" value={conn.status} />
                            <ConnectionDetailRow label="Health" value={conn.health_status} />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-2 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />Performance
                          </p>
                          <div className="rounded-lg bg-muted/30 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-muted-foreground">Latência</span>
                              {latencyBadge(conn.health_response_ms)}
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-t border-border/40">
                              <span className="text-[11px] text-muted-foreground">Último check</span>
                              <span className="text-xs font-medium">
                                {conn.last_health_check
                                  ? format(new Date(conn.last_health_check), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
                                  : 'Nunca'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-1.5 border-t border-border/40">
                              <span className="text-[11px] text-muted-foreground">Última atualização</span>
                              <span className="text-xs font-medium">
                                {format(new Date(conn.updated_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          </motion.div>
        );
      })}
    </div>
  );
}
