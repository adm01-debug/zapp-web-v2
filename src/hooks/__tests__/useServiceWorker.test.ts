import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('@/lib/logger', () => ({
  log: { debug: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const mockUnregister = vi.fn().mockResolvedValue(true);
const mockCaches = {
  keys: vi.fn().mockResolvedValue([]),
  delete: vi.fn().mockResolvedValue(true),
};

describe('useServiceWorker (kill-switch: PWA desativado)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();

    Object.defineProperty(globalThis, 'caches', {
      value: mockCaches,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: vi.fn(),
        controller: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getRegistrations: vi.fn().mockResolvedValue([{ unregister: mockUnregister }]),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('unregisters existing service workers on mount', async () => {
    const { useServiceWorker } = await import('@/hooks/system/useServiceWorker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalled();
      expect(mockUnregister).toHaveBeenCalled();
    });
  });

  it('deletes all caches to purge stale UI', async () => {
    mockCaches.keys.mockResolvedValueOnce(['whatsapp-crm-v2', 'other-cache']);

    const { useServiceWorker } = await import('@/hooks/system/useServiceWorker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(mockCaches.delete).toHaveBeenCalledWith('whatsapp-crm-v2');
      expect(mockCaches.delete).toHaveBeenCalledWith('other-cache');
    });
  });

  it('never registers a new service worker', async () => {
    const { useServiceWorker } = await import('@/hooks/system/useServiceWorker');
    renderHook(() => useServiceWorker());

    await waitFor(() => {
      expect(navigator.serviceWorker.getRegistrations).toHaveBeenCalled();
    });
    expect(navigator.serviceWorker.register).not.toHaveBeenCalled();
  });

  it('does not crash when serviceWorker is unavailable', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { useServiceWorker } = await import('@/hooks/system/useServiceWorker');
    expect(() => renderHook(() => useServiceWorker())).not.toThrow();
  });
});
