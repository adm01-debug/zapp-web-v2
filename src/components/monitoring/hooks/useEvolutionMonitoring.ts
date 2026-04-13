import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TimePeriod = '1h' | '6h' | '12h' | '24h' | '7d';

const periodMs: Record<TimePeriod, number> = {
  '1h': 60 * 60 * 1000,
  '6h': 6 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
};

const periodBuckets: Record<TimePeriod, number> = {
  '1h': 6, '6h': 6, '12h': 12, '24h': 24, '7d': 7,
};

export interface DiagnosticResult {
  timestamp: string;
  diagnostics: Array<{
    instance: string;
    connectionState: string;
    webhookSeverity: string;
    webhookIssue?: string;
    webhook?: { url: string; eventsCount: number; missingCritical: string[]; urlCorrect: boolean };
    messageFlow?: { lastHour: { incoming: number; outgoing: number; total: number }; flowHealth: string };
    autoFix?: { applied: boolean };
  }>;
  overallHealth: { score: number; status: string };
}

export interface ConnectionInfo {
  id: string;
  instance_id: string;
  phone_number: string | null;
  status: string;
  health_status: string | null;
  health_response_ms: number | null;
  last_health_check: string | null;
  updated_at: string;
}

export interface HealthLog {
  id: string;
  instance_id: string;
  status: string;
  response_time_ms: number | null;
  error_message: string | null;
  checked_at: string;
}

export interface MessageStats {
  incoming: number;
  outgoing: number;
  total: number;
  hourlyData: { hour: string; incoming: number; outgoing: number }[];
}

export interface WebhookTestResult {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
  latencyMs?: number;
}

export interface WebhookConfig {
  url?: string;
  events?: string[];
  configured: boolean;
}

export interface UptimeInfo {
  percentage: number;
  totalChecks: number;
  healthyChecks: number;
  lastDowntime: string | null;
}

export interface SparklineData {
  messages: number[];
  latency: number[];
  uptime: number[];
}

export interface InstanceUptime {
  instanceId: string;
  percentage: number;
  totalChecks: number;
  healthyChecks: number;
  avgLatency: number;
  lastError: string | null;
}

export function useEvolutionMonitoring() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [webhookTest, setWebhookTest] = useState<WebhookTestResult>({ status: 'idle' });
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [messageStats, setMessageStats] = useState<MessageStats>({ incoming: 0, outgoing: 0, total: 0, hourlyData: [] });
  const [reconfiguring, setReconfiguring] = useState(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [period, setPeriod] = useState<TimePeriod>('12h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [uptime, setUptime] = useState<UptimeInfo>({ percentage: 0, totalChecks: 0, healthyChecks: 0, lastDowntime: null });
  const [sparklines, setSparklines] = useState<SparklineData>({ messages: [], latency: [], uptime: [] });
  const [instanceUptimes, setInstanceUptimes] = useState<InstanceUptime[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const countdownRef = useRef(30);
  const prevConnectionsRef = useRef<ConnectionInfo[]>([]);

  // Request notification permission
  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Send disconnect notification
  const notifyDisconnect = useCallback((instanceId: string) => {
    if (!notificationsEnabled) return;
    try {
      new Notification('⚠️ Conexão Perdida', {
        body: `A instância ${instanceId} foi desconectada.`,
        icon: '/favicon.ico',
        tag: `disconnect-${instanceId}`,
      });
    } catch { /* silent */ }
  }, [notificationsEnabled]);

  const fetchData = useCallback(async (selectedPeriod?: TimePeriod) => {
    try {
      const p = selectedPeriod || period;
      const now = new Date();
      const since = new Date(now.getTime() - periodMs[p]);

      const [connRes, logsRes, msgRes] = await Promise.all([
        supabase.from('whatsapp_connections').select('id, instance_id, phone_number, status, health_status, health_response_ms, last_health_check, updated_at'),
        supabase.from('connection_health_logs').select('*').order('checked_at', { ascending: false }).limit(500),
        supabase.from('messages').select('sender, created_at').gte('created_at', since.toISOString()).order('created_at', { ascending: true }),
      ]);

      if (connRes.data) {
        // Detect disconnections for notifications
        const prev = prevConnectionsRef.current;
        if (prev.length > 0) {
          connRes.data.forEach(conn => {
            const prevConn = prev.find(p => p.id === conn.id);
            if (prevConn && prevConn.status === 'connected' && conn.status !== 'connected') {
              notifyDisconnect(conn.instance_id);
            }
          });
        }
        prevConnectionsRef.current = connRes.data;
        setConnections(connRes.data);
      }

      if (logsRes.data) {
        setHealthLogs(logsRes.data);

        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentLogs = logsRes.data.filter(l => new Date(l.checked_at) >= dayAgo);
        const healthyStatuses = ['connected', 'healthy'];
        const healthy = recentLogs.filter(l => healthyStatuses.includes(l.status));
        const lastFail = recentLogs.find(l => !healthyStatuses.includes(l.status));

        setUptime({
          percentage: recentLogs.length > 0 ? Math.round((healthy.length / recentLogs.length) * 1000) / 10 : 100,
          totalChecks: recentLogs.length,
          healthyChecks: healthy.length,
          lastDowntime: lastFail?.checked_at || null,
        });

        // Per-instance uptime
        const instanceMap = new Map<string, HealthLog[]>();
        recentLogs.forEach(l => {
          const arr = instanceMap.get(l.instance_id) || [];
          arr.push(l);
          instanceMap.set(l.instance_id, arr);
        });

        const uptimes: InstanceUptime[] = Array.from(instanceMap.entries()).map(([instanceId, logs]) => {
          const h = logs.filter(l => healthyStatuses.includes(l.status));
          const latencies = logs.filter(l => l.response_time_ms != null).map(l => l.response_time_ms!);
          const lastErr = logs.find(l => !healthyStatuses.includes(l.status));
          return {
            instanceId,
            percentage: logs.length > 0 ? Math.round((h.length / logs.length) * 1000) / 10 : 100,
            totalChecks: logs.length,
            healthyChecks: h.length,
            avgLatency: latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0,
            lastError: lastErr?.error_message || null,
          };
        });
        setInstanceUptimes(uptimes);

        // Sparkline: uptime per hour (last 8 hours)
        const uptimeSparkline: number[] = [];
        for (let i = 7; i >= 0; i--) {
          const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
          const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourLogs = logsRes.data.filter(l => {
            const t = new Date(l.checked_at);
            return t >= hourStart && t < hourEnd;
          });
          const hourHealthy = hourLogs.filter(l => healthyStatuses.includes(l.status));
          uptimeSparkline.push(hourLogs.length > 0 ? Math.round((hourHealthy.length / hourLogs.length) * 100) : 100);
        }

        // Sparkline: latency per hour
        const latencySparkline: number[] = [];
        for (let i = 7; i >= 0; i--) {
          const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
          const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
          const hourLogs = logsRes.data.filter(l => {
            const t = new Date(l.checked_at);
            return t >= hourStart && t < hourEnd && l.response_time_ms != null;
          });
          const avg = hourLogs.length > 0
            ? Math.round(hourLogs.reduce((s, l) => s + (l.response_time_ms || 0), 0) / hourLogs.length)
            : 0;
          latencySparkline.push(avg);
        }

        setSparklines(prev => ({ ...prev, uptime: uptimeSparkline, latency: latencySparkline }));
      }

      if (msgRes.data) {
        const incoming = msgRes.data.filter(m => m.sender === 'contact').length;
        const outgoing = msgRes.data.filter(m => m.sender === 'agent').length;

        const bucketCount = periodBuckets[p];
        const bucketSize = periodMs[p] / bucketCount;
        const buckets: Record<string, { incoming: number; outgoing: number }> = {};

        for (let i = bucketCount - 1; i >= 0; i--) {
          const bucketTime = new Date(now.getTime() - i * bucketSize);
          let key: string;
          if (p === '7d') {
            key = `${bucketTime.getDate().toString().padStart(2, '0')}/${(bucketTime.getMonth() + 1).toString().padStart(2, '0')}`;
          } else {
            key = `${bucketTime.getHours().toString().padStart(2, '0')}:00`;
          }
          buckets[key] = { incoming: 0, outgoing: 0 };
        }

        msgRes.data.forEach(m => {
          const mTime = new Date(m.created_at);
          let targetKey: string | null = null;
          if (p === '7d') {
            targetKey = `${mTime.getDate().toString().padStart(2, '0')}/${(mTime.getMonth() + 1).toString().padStart(2, '0')}`;
          } else {
            targetKey = `${mTime.getHours().toString().padStart(2, '0')}:00`;
          }
          if (targetKey && buckets[targetKey]) {
            if (m.sender === 'contact') buckets[targetKey].incoming++;
            else buckets[targetKey].outgoing++;
          }
        });

        const hourlyData = Object.entries(buckets).map(([hour, data]) => ({ hour, ...data }));
        setMessageStats({ incoming, outgoing, total: msgRes.data.length, hourlyData });

        // Sparkline: messages per hour (last 8 hours)
        const msgSparkline: number[] = [];
        for (let i = 7; i >= 0; i--) {
          const hourStart = new Date(now.getTime() - (i + 1) * 60 * 60 * 1000);
          const hourEnd = new Date(now.getTime() - i * 60 * 60 * 1000);
          const count = msgRes.data.filter(m => {
            const t = new Date(m.created_at);
            return t >= hourStart && t < hourEnd;
          }).length;
          msgSparkline.push(count);
        }
        setSparklines(prev => ({ ...prev, messages: msgSparkline }));
      }
    } catch (err) {
      console.error('Monitoring fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [period, notifyDisconnect]);

  // Countdown timer
  useEffect(() => {
    if (!autoRefresh) return;
    countdownRef.current = 30;
    setCountdown(30);
    const tick = setInterval(() => {
      countdownRef.current -= 1;
      setCountdown(countdownRef.current);
      if (countdownRef.current <= 0) {
        countdownRef.current = 30;
        setCountdown(30);
        fetchData();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [autoRefresh, fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('monitoring-connections')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_connections' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const changePeriod = useCallback((p: TimePeriod) => {
    setPeriod(p);
    fetchData(p);
  }, [fetchData]);

  const runHealthCheck = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke('connection-health-check', { method: 'POST', body: {} });
      if (error) throw error;
      toast.success(`Health check: ${data?.connections?.length || 0} conexões verificadas`);
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
      await new Promise(r => setTimeout(r, 1000));
      const { data: msg } = await supabase.from('messages').select('id').eq('external_id', testId).maybeSingle();
      if (msg) await supabase.from('messages').delete().eq('id', msg.id);
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
      toast.error('Erro ao verificar webhook');
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
      toast.success('Webhook reconfigurado com sucesso!');
      await checkWebhookConfig(instanceId);
    } catch (err) {
      toast.error('Erro ao reconfigurar: ' + (err instanceof Error ? err.message : 'desconhecido'));
    } finally {
      setReconfiguring(false);
    }
  };

  const runDiagnostic = async (autoFix = false) => {
    setDiagnosing(true);
    try {
      const { data, error } = await supabase.functions.invoke('webhook-diagnostic', {
        method: 'POST',
        body: { action: autoFix ? 'auto-fix' : 'full-diagnostic' },
      });
      if (error) throw error;
      setDiagnostic(data as DiagnosticResult);
      if (autoFix) {
        toast.success('Diagnóstico + auto-fix concluído!');
        await fetchData();
      } else {
        toast.success('Diagnóstico concluído!');
      }
    } catch {
      toast.error('Erro no diagnóstico');
    } finally {
      setDiagnosing(false);
    }
  };

  return {
    connections, healthLogs, loading, refreshing, webhookTest, webhookConfig,
    messageStats, reconfiguring, diagnostic, diagnosing, uptime,
    sparklines, instanceUptimes, notificationsEnabled, requestNotifications,
    period, changePeriod, autoRefresh, setAutoRefresh, countdown,
    runHealthCheck, testWebhookDelivery, checkWebhookConfig, reconfigureWebhook,
    runDiagnostic, refetch: fetchData,
  };
}
