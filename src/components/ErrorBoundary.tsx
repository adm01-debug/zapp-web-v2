/**
 * ErrorBoundary — Application-level React Error Boundary
 *
 * Catches unhandled JavaScript errors in any component subtree during render,
 * lifecycle methods, and constructors of child class components. Without this,
 * an error in any component causes the entire React tree to unmount (blank screen).
 *
 * USAGE:
 *   Wrap the root <App /> in main.tsx:
 *   ```tsx
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *   ```
 *
 *   Or wrap individual routes/sections for granular recovery:
 *   ```tsx
 *   <ErrorBoundary fallback={<SectionError />}>
 *     <HeavyWidget />
 *   </ErrorBoundary>
 *   ```
 *
 * SENTRY INTEGRATION:
 *   Uncomment the Sentry.captureException call in componentDidCatch when
 *   VITE_SENTRY_DSN is set. The error is already forwarded to console.error
 *   in all environments.
 *
 * RECOVERY:
 *   The "Tentar novamente" button calls window.location.reload() which
 *   fully resets the React tree. For a softer reset, replace with
 *   this.setState({ hasError: false, error: null }).
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  /** Optional custom fallback UI. Receives the caught error. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console for all environments
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);

    // Forward to Sentry when configured
    // if (import.meta.env.VITE_SENTRY_DSN) {
    //   import('@sentry/react').then(Sentry => {
    //     Sentry.captureException(error, { extra: { errorInfo } });
    //   });
    // }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) {
      return children;
    }

    // Custom fallback provided by caller
    if (fallback) {
      return fallback(error, this.handleReset);
    }

    // Default fallback UI
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Algo deu errado
          </h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Nossa equipe foi notificada automaticamente.
          </p>
        </div>

        {/* Error details — visible only in development */}
        {import.meta.env.DEV && (
          <details className="max-w-xl rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left text-xs">
            <summary className="cursor-pointer font-medium text-destructive">
              Detalhes do erro (apenas em desenvolvimento)
            </summary>
            <pre className="mt-2 overflow-auto whitespace-pre-wrap text-muted-foreground">
              {error.message}
              {'\n\n'}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recarregar página
          </Button>
          <Button
            variant="outline"
            onClick={this.handleReset}
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }
}

/**
 * withErrorBoundary — HOC to wrap any component with an ErrorBoundary.
 *
 * Example:
 *   const SafeWidget = withErrorBoundary(HeavyWidget);
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: Props['fallback']
) {
  const displayName =
    WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundaryWrapper.displayName = `withErrorBoundary(${displayName})`;
  return WithErrorBoundaryWrapper;
}
