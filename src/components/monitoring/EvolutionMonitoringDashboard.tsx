import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Activity, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle2, XCircle,
  Clock, Zap, ArrowUpDown, Send, MessageSquare, Webhook, Settings2,
  PlayCircle, Loader2, Radio, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConnectionInfo {
  id: string;
  instance_id: string;
  phone_number: string | null;
  status: string;
  health_status: string | null;
  health_response_ms: number | null;
  last_health_check: string | null;
  updated_at: string;
}

interface HealthLog {
  id: string;
  instance_id: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

interface WebhookTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  latencyMs?: number;
}

interface WebhookConfig {
  url?: string;
  events?: string[];
  configured: boolean;
}

export function EvolutionMonitoringDashboard() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [webhookTest, setWebhookTest] = useState<WebhookTestResult>({ status: 'idle' });
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [recentMessages, setRecentMessages] = useState<{ incoming: number; outgoing: number; total: number }>({ incoming: 0, outgoing: 0, total: 0 });
  const [reconfiguring, setReconfiguring] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [connRes, logsRes, msgStatsRes] = await Promise.all([
        supabase.from('whatsapp_connections').select('id, instance_id, phone_number, status, health_status, health_response_ms, last_health_check, updated_at'),
        supabase.from('connection_health_logs').select('*').order('checked_at', { ascending: false }).limit(50),
        supabase.from('messages').select('sender', { count: 'exact' }).gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()),
      ]);

      if (connRes.data) setConnections(connRes.data);
      if (logsRes.data) setHealthLogs(logsRes.data);
      
      if (msgStatsRes.data) {
        const incoming = msgStatsRes.data.filter(m => m.sender === 'contact').length;
        const outgoing = msgStatsRes.data.filter(m => m.sender === 'agent').length;
        setRecentMessages({ incoming, outgoing, total: msgStatsRes.data.length });
      }
    } catch (err) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const runHealthCheck = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('connection-health-check', { method: 'POST', body: {} });
      if (error) throw error;
      toast.success(`Health check concluído: ${data?.connections?.length || 0} conexões verificadas`);
      await fetchData();
    } catch {
      toast.error('Erro ao executar health check');
    } finally {
      setRefreshing(false);
    }
  };

  const testWebhookDelivery = async (instanceId: string) => {
    setWebhookTest({ status: 'testing' });
    const testId = `MONITOR_TEST_${Date.now()}`;
    const start = performance.now();
    try {
      const { error } = await supabase.functions.invoke('evolution-webhook', {
        method: 'POST',
        body: {
          event: 'messages.upsert',
          instance: instanceId,
          data: {
            key: { remoteJid: '5500000000000@s.whatsapp.net', fromMe: false, id: testId },
            pushName: '🔧 Monitor Test',
            messageTimestamp: Math.floor(Date.now() / 1000),
            message: { conversation: `[TESTE MONITOR] ${new Date().toLocaleString('pt-BR')}` },
          },
        },
      });
      const latency = Math.round(performance.now() - start);
      if (error) throw error;
      
      // Verify message was persisted
      await new Promise(r => setTimeout(r, 1000));
      const { data: msg } = await supabase.from('messages').select('id').eq('external_id', testId).maybeSingle();
      
      // Cleanup test message
      if (msg) {
        await supabase.from('messages').delete().eq('id', msg.id);
      }

      setWebhookTest({
        status: msg ? 'success' : 'error',
        message: msg ? `Webhook processou e persistiu em ${latency}ms` : 'Webhook respondeu OK mas mensagem não foi persistida',
        latencyMs: latency,
      });
    } catch (err) {
      setWebhookTest({ status: 'error', message: err instanceof Error ? err.message : 'Erro desconhecido' });
    }
  };

  const checkWebhookConfig = async (instanceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evolution-api/get-webhook', {
        method: 'POST',
        body: { instanceName: instanceId },
      });
      if (error) throw error;
      const webhook = data?.webhook || data;
      setWebhookConfig({
        url: webhook?.url || webhook?.webhookUrl,
        events: webhook?.events || [],
        configured: !!(webhook?.url || webhook?.webhookUrl),
      });
    } catch {
      setWebhookConfig({ configured: false });
      toast.error('Erro ao verificar configuração do webhook');
    }
  };

  const reconfigureWebhook = async (instanceId: string) => {
    setReconfiguring(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const webhookUrl = `${supabaseUrl}/functions/v1/evolution-webhook`;
      
      const { error } = await supabase.functions.invoke('evolution-api/set-webhook', {
        method: 'POST',
        body: {
          instanceName: instanceId,
          webhook: {
            url: webhookUrl,
            webhookByEvents: false,
            webhookBase64: true,
            events: [
              'MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'MESSAGES_DELETE', 'MESSAGES_SET',
              'SEND_MESSAGE', 'CONTACTS_UPSERT', 'CONTACTS_UPDATE', 'CONTACTS_SET',
              'PRESENCE_UPDATE', 'CHATS_UPSERT', 'CHATS_UPDATE', 'CHATS_DELETE', 'CHATS_SET',
              'CONNECTION_UPDATE', 'LABELS_EDIT', 'LABELS_ASSOCIATION',
              'GROUPS_UPSERT', 'GROUP_PARTICIPANTS_UPDATE',
              'CALL', 'QRCODE_UPDATED',
            ],
          },
        },
      });
      if (error) throw error;
      toast.success('Webhook reconfigurado com sucesso! Aguarde alguns segundos e envie uma mensagem de teste.');
      await checkWebhookConfig(instanceId);
    } catch (err) {
      toast.error('Erro ao reconfigurar webhook: ' + (err instanceof Error ? err.message : 'desconhecido'));
    } finally {
      setReconfiguring(false);
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'connected': case 'healthy': return 'text-emerald-500';
      case 'disconnected': case 'unhealthy': case 'error': return 'text-destructive';
      case 'degraded': return 'text-amber-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'connected': case 'healthy': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'disconnected': case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Monitoramento Evolution API</h1>
            <p className="text-sm text-muted-foreground">Status de conexões, webhook e health checks em tempo real</p>
          </div>
        </div>
        <Button onClick={runHealthCheck} disabled={refreshing} variant="outline" size="sm">
          <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
          {refreshing ? 'Verificando...' : 'Health Check'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Wifi className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Conexões Ativas</p>
                <p className="text-2xl font-bold">{connections.filter(c => c.status === 'connected').length}/{connections.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <MessageSquare className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Msgs Última Hora</p>
                <p className="text-2xl font-bold">{recentMessages.total}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>↓{recentMessages.incoming}</span>
                  <span>↑{recentMessages.outgoing}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Latência Média</p>
                <p className="text-2xl font-bold">
                  {connections.filter(c => c.health_response_ms).length > 0
                    ? Math.round(connections.reduce((sum, c) => sum + (c.health_response_ms || 0), 0) / connections.filter(c => c.health_response_ms).length)
                    : '--'
                  }ms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', recentMessages.incoming === 0 ? 'bg-destructive/10' : 'bg-emerald-500/10')}>
                <ArrowUpDown className={cn('w-5 h-5', recentMessages.incoming === 0 ? 'text-destructive' : 'text-emerald-500')} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Webhook Status</p>
                <p className={cn('text-lg font-bold', recentMessages.incoming === 0 ? 'text-destructive' : 'text-emerald-500')}>
                  {recentMessages.incoming === 0 ? '⚠️ Sem Incoming' : '✅ Recebendo'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections"><Wifi className="w-4 h-4 mr-1.5" />Conexões</TabsTrigger>
          <TabsTrigger value="webhook"><Webhook className="w-4 h-4 mr-1.5" />Webhook</TabsTrigger>
          <TabsTrigger value="health-logs"><Activity className="w-4 h-4 mr-1.5" />Health Logs</TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections" className="space-y-4">
          {connections.map(conn => (
            <Card key={conn.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {conn.status === 'connected' ? <Wifi className="w-6 h-6 text-emerald-500" /> : <WifiOff className="w-6 h-6 text-destructive" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">{conn.instance_id}</span>
                        <Badge variant={conn.status === 'connected' ? 'default' : 'destructive'} className="text-xs">
                          {conn.status}
                        </Badge>
                        {conn.health_status && (
                          <Badge variant="outline" className="text-xs">
                            {getStatusIcon(conn.health_status)}
                            <span className="ml-1">{conn.health_status}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        {conn.phone_number && <span>📱 {conn.phone_number}</span>}
                        {conn.health_response_ms && <span>⚡ {conn.health_response_ms}ms</span>}
                        {conn.last_health_check && (
                          <span>🕐 {formatDistanceToNow(new Date(conn.last_health_check), { addSuffix: true, locale: ptBR })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => checkWebhookConfig(conn.instance_id)}>
                      <Settings2 className="w-4 h-4 mr-1" />
                      Ver Webhook
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => testWebhookDelivery(conn.instance_id)}>
                      <PlayCircle className="w-4 h-4 mr-1" />
                      Testar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Webhook Tab */}
        <TabsContent value="webhook" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Webhook Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Teste de Entrega do Webhook
                </CardTitle>
                <CardDescription>Envia um payload de teste e verifica se foi persistido no banco</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connections.map(conn => (
                  <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{conn.instance_id}</span>
                    <Button
                      size="sm"
                      onClick={() => testWebhookDelivery(conn.instance_id)}
                      disabled={webhookTest.status === 'testing'}
                    >
                      {webhookTest.status === 'testing' ? (
                        <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Testando...</>
                      ) : (
                        <><PlayCircle className="w-4 h-4 mr-1" />Testar Webhook</>
                      )}
                    </Button>
                  </div>
                ))}

                {webhookTest.status !== 'idle' && webhookTest.status !== 'testing' && (
                  <div className={cn(
                    'p-4 rounded-lg border',
                    webhookTest.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-destructive/5 border-destructive/20'
                  )}>
                    <div className="flex items-center gap-2">
                      {webhookTest.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      <span className="font-medium">{webhookTest.status === 'success' ? 'Sucesso' : 'Falha'}</span>
                      {webhookTest.latencyMs && <Badge variant="outline">{webhookTest.latencyMs}ms</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{webhookTest.message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Webhook Config */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Configuração do Webhook
                </CardTitle>
                <CardDescription>Verifique e reconfigure o webhook na Evolution API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {webhookConfig ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {webhookConfig.configured ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="font-medium">
                        {webhookConfig.configured ? 'Webhook Configurado' : 'Webhook NÃO Configurado'}
                      </span>
                    </div>

                    {webhookConfig.url && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">URL</p>
                        <p className="text-sm font-mono break-all">{webhookConfig.url}</p>
                      </div>
                    )}

                    {webhookConfig.events && webhookConfig.events.length > 0 && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-2">Eventos ({webhookConfig.events.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {webhookConfig.events.map(e => (
                            <Badge key={e} variant="outline" className="text-xs">{e}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Check for missing critical events */}
                    {webhookConfig.events && (() => {
                      const critical = ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED', 'CONTACTS_UPSERT'];
                      const missing = critical.filter(e => !webhookConfig.events?.includes(e));
                      if (missing.length === 0) return null;
                      return (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="font-medium text-sm">Eventos críticos ausentes!</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {missing.map(e => (
                              <Badge key={e} variant="destructive" className="text-xs">{e}</Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Clique em "Ver Webhook" em uma conexão para verificar.</p>
                )}

                {connections.map(conn => (
                  <Button
                    key={conn.id}
                    variant="default"
                    className="w-full"
                    onClick={() => reconfigureWebhook(conn.instance_id)}
                    disabled={reconfiguring}
                  >
                    {reconfiguring ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Reconfigurando...</>
                    ) : (
                      <><Radio className="w-4 h-4 mr-2" />Reconfigurar Webhook ({conn.instance_id})</>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Health Logs Tab */}
        <TabsContent value="health-logs">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Histórico de Health Checks</CardTitle>
              <CardDescription>Últimas 50 verificações de saúde</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {healthLogs.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum health check registrado ainda.</p>
                  ) : healthLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{log.instance_id}</span>
                            <Badge variant="outline" className={cn('text-xs', getStatusColor(log.status))}>
                              {log.status}
                            </Badge>
                          </div>
                          {log.error_message && (
                            <p className="text-xs text-destructive mt-0.5 max-w-md truncate">{log.error_message}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {log.response_time_ms && <span>⚡ {log.response_time_ms}ms</span>}
                        <span>{format(new Date(log.checked_at), 'dd/MM HH:mm:ss', { locale: ptBR })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
