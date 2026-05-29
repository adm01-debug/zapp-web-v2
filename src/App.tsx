import { lazy, Suspense, useEffect, useState, forwardRef } from "react";
import { getLogger } from "@/lib/logger";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { SkipLinks } from "@/components/ui/skip-link";
import { LiveRegion } from "@/components/ui/visually-hidden";
import { GlobalKeyboardProvider } from "@/components/keyboard/GlobalKeyboardProvider";
import { AppProviders } from "@/providers/AppProviders";
import { AppRoutes } from "@/routes/AppRoutes";

const log = getLogger('App');

// Deferred non-critical providers loaded after first paint
const RealtimeSentimentAlertProvider = lazy(() => import("@/components/notifications/RealtimeSentimentAlertProvider").then(m => ({ default: m.RealtimeSentimentAlertProvider })));
const IncomingCallAlert = lazy(() => import("@/components/calls/IncomingCallAlert").then(m => ({ default: m.IncomingCallAlert })));
const EasterEggsProvider = lazy(() => import("@/components/effects/EasterEggs").then(m => ({ default: m.EasterEggsProvider })));
const InAppNotificationProvider = lazy(() => import("@/components/mobile/InAppNotificationProvider").then(m => ({ default: m.InAppNotificationProvider })));

function DeferredProviders({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <RealtimeSentimentAlertProvider />
      <IncomingCallAlert />
      <InAppNotificationProvider>
        <EasterEggsProvider>{children ?? null}</EasterEggsProvider>
      </InAppNotificationProvider>
    </Suspense>
  );
}

/** Deferred hooks component — lazy-loaded so hooks don't run until after first paint */
const DeferredHooks = lazy(() =>
  import('@/hooks/system/useServiceWorker').then(swMod =>
    import('@/hooks/ui/useScreenProtection').then(spMod => ({
      default: forwardRef(function DeferredHooksInner(_props: Record<string, never>, _ref: React.ForwardedRef<unknown>) {
        swMod.useServiceWorker();
        spMod.useScreenProtection();
        return null;
      })
    }))
  )
);

function AppContent() {
  const [deferredReady, setDeferredReady] = useState(false);

  useEffect(() => {
    log.info('AppContent mounted');
    if (window.performance && window.performance.mark) {
      performance.mark('app-content-mounted');
      const measure = performance.measure('total-load', undefined, 'app-content-mounted');
      log.info(`Total Load Time: ${measure.duration.toFixed(2)}ms`);
    }
    setDeferredReady(true);
  }, []);

  // Global unhandled rejection handler
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && typeof reason === 'object' && 'name' in reason) {
        const name = (reason as { name: string }).name;
        if (name === 'TimeoutError' || name === 'InvalidStateError') {
          event.preventDefault();
          return;
        }
      }
      log.error("Unhandled promise rejection:", event.reason);
      event.preventDefault();
    };
    const errorHandler = (event: ErrorEvent) => {
      log.error("Uncaught error:", event.error);
    };
    window.addEventListener("unhandledrejection", handler);
    window.addEventListener("error", errorHandler);
    return () => {
      window.removeEventListener("unhandledrejection", handler);
      window.removeEventListener("error", errorHandler);
    };
  }, []);

  return (
    <BrowserRouter>
      <SkipLinks />
      <LiveRegion />
      <GlobalKeyboardProvider>
        <ErrorBoundary fallback={null}>
          {deferredReady && <DeferredProviders />}
          {deferredReady && (
            <Suspense fallback={null}>
              <DeferredHooks />
            </Suspense>
          )}
        </ErrorBoundary>
        <Toaster />
        <Sonner />
        <AppRoutes />
      </GlobalKeyboardProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <AppProviders>
    <AppContent />
  </AppProviders>
);

export default App;
