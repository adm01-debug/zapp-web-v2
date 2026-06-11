 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { AuthProvider } from "@/hooks/auth/useAuth";
 import { ThemeSync } from "@/hooks/ui/useTheme";
 import { HighContrastProvider } from "@/components/theme/HighContrastToggle";
 import { AccessibleToastProvider } from "@/components/ui/accessible-toast";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { ThemeInitializer } from "@/components/ThemeInitializer";
 import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
 import { getLogger } from "@/lib/logger";
 import { useRef, useState, useEffect } from "react";
 import { AlertTriangle } from "lucide-react";

const log = getLogger('AppProviders');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
});

 export function AppProviders({ children }: { children: React.ReactNode }) {
   const [errorKey, setErrorKey] = useState(0);
   const [failed, setFailed] = useState(false);
   const retryCountRef = useRef(0);
   const MAX_RETRIES = 3;
 
   useEffect(() => {
     setErrorKey(prev => prev + 1);
     retryCountRef.current = 0;
   }, []);

  return (
   if (failed) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
         <div className="max-w-md space-y-6">
           <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
             <log.AlertTriangle className="w-10 h-10 text-destructive" />
           </div>
           <h1 className="text-2xl font-bold text-foreground">Falha Crítica na Inicialização</h1>
           <p className="text-muted-foreground">O sistema não conseguiu iniciar após várias tentativas. Isso pode ser causado por um problema de conexão ou cache do navegador.</p>
           <div className="flex flex-col gap-3">
             <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium">Recarregar Aplicativo</button>
             <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-6 py-2 bg-muted text-muted-foreground rounded-md text-sm italic">Limpar Cache e Recarregar</button>
           </div>
         </div>
       </div>
     );
   }

   return (
     <ErrorBoundary
       resetKey={errorKey}
       onError={(error) => {
         log.error('ErrorBoundary caught:', error.message, error.stack);
         if (retryCountRef.current < MAX_RETRIES) {
           retryCountRef.current += 1;
           log.warn(`Auto-retry ${retryCountRef.current}/${MAX_RETRIES}`);
           setTimeout(() => setErrorKey(prev => prev + 1), 2000 * retryCountRef.current);
         } else {
           log.error('Max retries reached. Manual intervention required.');
           setFailed(true);
         }
       }}
     >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeSync />
          <HighContrastProvider>
            <AccessibleToastProvider>
              <TooltipProvider delayDuration={300}>
                <ThemeInitializer />
                {children}
              </TooltipProvider>
            </AccessibleToastProvider>
          </HighContrastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
