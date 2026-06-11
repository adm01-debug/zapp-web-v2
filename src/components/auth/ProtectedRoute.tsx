 import { ReactNode, useEffect, useState } from 'react';
 import { Navigate, useLocation } from 'react-router-dom';
 import { Loader2 } from 'lucide-react';
 import { useAuth } from '@/hooks/auth/useAuth';
 import { useUserRole } from '@/hooks/system/useUserRole';
 import { RoleService } from '@/services/role.service';
 import { AuthService } from '@/services/auth.service';
 
 interface ProtectedRouteProps {
   children: ReactNode;
   requiredRoles?: ('admin' | 'supervisor' | 'agent')[];
   requiredPermission?: string;
   fallback?: ReactNode;
 }
 
 export function ProtectedRoute({ 
   children, 
   requiredRoles,
   requiredPermission,
   fallback 
 }: ProtectedRouteProps) {
   const { user, loading: authLoading } = useAuth();
   const { loading: rolesLoading, hasRole } = useUserRole();
   const location = useLocation();
   const [hasPermission, setHasPermission] = useState<boolean | null>(null);
 
   const loading = authLoading || rolesLoading;

   useEffect(() => {
     console.log('[ProtectedRoute] State:', { 
       path: location.pathname, 
       authLoading, 
       rolesLoading, 
       userEmail: user?.email,
       requiredPermission,
       hasPermission,
       loading
     });
   }, [location.pathname, authLoading, rolesLoading, user, requiredPermission, hasPermission, loading]);

   useEffect(() => {
     if (!loading && user && requiredPermission) {
       console.log('[ProtectedRoute] Checking permission:', requiredPermission);
       RoleService.checkPermission(user.id, requiredPermission)
         .then(result => {
           console.log('[ProtectedRoute] Permission result:', requiredPermission, result);
           setHasPermission(result);
         })
         .catch(err => {
           console.error('[ProtectedRoute] Permission error:', err);
           setHasPermission(false);
         });
     } else if (!loading && !requiredPermission) {
       setHasPermission(true);
     }
   }, [loading, user, requiredPermission]);

   if (loading || (requiredPermission && hasPermission === null)) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-busy="true" aria-label="Verificando acesso">
         <div className="flex flex-col items-center gap-4 max-w-xs text-center px-4">
           <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden="true" />
           <p className="text-foreground font-medium">Verificando acesso...</p>
           
           {/* Escape hatch for infinite loading */}
           <div className="mt-8 pt-8 border-t border-border w-full">
             <p className="text-xs text-muted-foreground mb-4 italic">Se o carregamento demorar muito, tente:</p>
             <div className="flex flex-col gap-2">
               <button 
                 onClick={() => window.location.reload()}
                 className="text-xs px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
               >
                 Recarregar Página
               </button>
               <button 
                 onClick={() => {
                   void AuthService.signOut();
                   window.location.href = '/auth';
                 }}
                 className="text-xs px-4 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
               >
                 Sair e Entrar Novamente
               </button>
             </div>
           </div>
         </div>
       </div>
     );
   }
 
    if (!user) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }

    const isAuthorized = !requiredRoles?.length || requiredRoles.some(role => hasRole(role));
    const isPermissioned = !requiredPermission || hasPermission;

    if (!isAuthorized || !isPermissioned) {
      if (fallback) return <>{fallback}</>;
      // If we are not at home, go home. If we ARE at home and not authorized, we might need a logout or a public page
      if (location.pathname !== "/") {
        return <Navigate to="/" replace />;
      }
      // If unauthorized even for home, show a basic message or sign out to avoid loop
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center">
          <div className="space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta área.</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Voltar para Login
            </button>
          </div>
        </div>
      );
    }
 
   return <>{children}</>;
 }

// Higher-order component for permission-based rendering
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  permission: string
) {
  return function PermissionWrapper(props: P) {
    return (
      <ProtectedRoute requiredPermission={permission}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}
