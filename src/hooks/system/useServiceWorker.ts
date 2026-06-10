import { useEffect, useRef } from 'react';
import { log } from '@/lib/logger';

/**
 * Kill-switch de service worker: o PWA foi desativado (problemas de preview),
 * então este hook desregistra workers legados e limpa caches para evitar UI obsoleta.
 */
export function useServiceWorker() {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (registeredRef.current) return;
    registeredRef.current = true;

    if (!('serviceWorker' in navigator)) return;

    const unregisterAll = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          log.info('[ServiceWorker] Unregistered existing worker');
        }
        
        if (typeof caches !== 'undefined') {
          const keys = await caches.keys();
          for (const key of keys) {
            await caches.delete(key);
            log.info('[ServiceWorker] Deleted cache:', key);
          }
        }
      } catch (error) {
        log.error('[ServiceWorker] Unregistration failed:', error);
      }
    };

    void unregisterAll();
  }, []);

}
