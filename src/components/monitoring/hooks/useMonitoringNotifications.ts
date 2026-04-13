import { useState, useEffect, useCallback, useRef } from 'react';
import type { ConnectionInfo } from './types';

export function useMonitoringNotifications() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const prevRef = useRef<ConnectionInfo[]>([]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') setNotificationsEnabled(true);
  }, []);

  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) return;
    const perm = await Notification.requestPermission();
    setNotificationsEnabled(perm === 'granted');
  }, []);

  const checkDisconnections = useCallback((connections: ConnectionInfo[]) => {
    const prev = prevRef.current;
    if (prev.length > 0 && notificationsEnabled) {
      connections.forEach(conn => {
        const p = prev.find(x => x.id === conn.id);
        if (p && p.status === 'connected' && conn.status !== 'connected') {
          try { new Notification('⚠️ Conexão Perdida', { body: `Instância ${conn.instance_id} desconectada.`, icon: '/favicon.ico', tag: `dc-${conn.instance_id}` }); } catch { /* */ }
        }
      });
    }
    prevRef.current = connections;
  }, [notificationsEnabled]);

  return { notificationsEnabled, requestNotifications, checkDisconnections };
}
