import { lazy, Suspense, useEffect } from "react";
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
const RealtimeSentimentAlertProvider = lazy(() =>
  import("@/components/notifications/RealtimeSentimentAlertProvider")
    .then(m => ({ default: m.RealtimeSentimentAlertProvider }))
);
const IncomingCallAlert = lazy(() =>
  import("@/components/calls/IncomingCallAlert")
    .then(m => ({ default: m.IncomingCallAlert }))
);
const EasterEggsProvider = lazy(() =>
  import("@/components/effects/EasterEggs")
    .then(m => ({ default: m.EasterEggsProvider }))
);
const InAppNotificationProvider = lazy(() =>
  import("@/components/mobile/InAppNotificationProvider")
    .then(m => ({ default: m.InAppNotificationProvider }))
);

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

/**
 * Lazy-loads non-critical hooks after the first paint so they don't
 * block the initial render. Uses a plain functional component —
 * no forwardRef needed since we never pass a ref to this element.
 */
const DeferredHooks = lazy(() =>
  Promise.all([
    import('@/hooks/system/useServiceWorker'),
    import('@/hooks/ui/useScreenProtection'),
  ]).then(([swMod, spMod]) => ({
    default: function DeferredHooksRunner() {
      swMod.useServiceWorker();
      spMod.useScreenProtection();
      return null;
    },
  }))
);

function AppContent() {
  useEffect(() => {
    log.info('AppContent mounted');
    if (window.performance?.mark) {
      performance.mark('app-content-mounted');
      const measure = performance.measure('total-load', undefined, 'app-content-mounted');
      log.info(`Total Load Time: ${measure.duration.toFixed(2)}ms`);
    }
  }, []);

  // Global unhandled rejection / error handler
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
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

    const handleError = (event: ErrorEvent) => {
      log.error("Uncaught error:", event.error);
    };

    window.addEventListener("unhandledrejection", handleRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <BrowserRouter>
      <SkipLinks />
      <LiveRegion />
      <GlobalKeyboardProvider>
        <ErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <DeferredProviders />
            <DeferredHooks />
          </Suspense>
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
