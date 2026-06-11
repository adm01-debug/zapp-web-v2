import { lazy } from 'react';

/**
 * Retry wrapper for lazy imports to handle transient network failures (503, HMR).
 * Retries up to `retries` times with progressive backoff (1s × attempt).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- constraint canônico de React.lazy: props variantes exigem any
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 3
): React.LazyExoticComponent<T> {
  return lazy(() => {
    let attempt = 0;
    const load = (): Promise<{ default: T }> =>
      factory().catch((err) => {
        attempt++;
        if (attempt >= retries) throw err;
        return new Promise<{ default: T }>((resolve) =>
          setTimeout(() => resolve(load()), 1000 * attempt)
        );
      });
    return load();
  });
}
