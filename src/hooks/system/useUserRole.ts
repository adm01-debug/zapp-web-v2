 import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
 import { useAuth } from '@/hooks/auth/useAuth';
 import { RoleService, type AppRole } from '@/services/role.service';
 export type { AppRole };
 
 export function useUserRole() {
   const { user } = useAuth();
   const [roles, setRoles] = useState<AppRole[]>([]);
   const [loading, setLoading] = useState(true);
   const mountedRef = useRef(true);
 
   useEffect(() => {
     mountedRef.current = true;
     return () => { mountedRef.current = false; };
   }, []);
 
   const fetchRoles = useCallback(async () => {
     if (!user) {
       console.log('[useUserRole] No user, skipping fetch');
       return;
     }
     console.log('[useUserRole] Fetching roles for:', user.id);
     try {
       const userRoles = await RoleService.fetchUserRoles(user.id);
       console.log('[useUserRole] Roles fetched:', userRoles);
       if (mountedRef.current) {
         setRoles(userRoles);
       }
     } catch (err) {
       console.error('[useUserRole] Error fetching roles:', err);
     } finally {
       if (mountedRef.current) {
         console.log('[useUserRole] Setting loading to false');
         setLoading(false);
       }
     }
   }, [user]);

   useEffect(() => {
     console.log('[useUserRole] User changed:', user?.id, 'Current loading:', loading);
     if (user) fetchRoles();
     else {
       setRoles([]);
       setLoading(false);
       console.log('[useUserRole] User cleared, loading set to false');
     }
   }, [user, fetchRoles]);
 
   const derivedRoles = useMemo(() => ({
     isAdmin: roles.includes('admin'),
     isSupervisor: roles.includes('supervisor') || roles.includes('admin'),
     isSpecialAgent: roles.includes('special_agent'),
   }), [roles]);
 
   const hasRole = useCallback((role: AppRole) => roles.includes(role), [roles]);
 
   return { roles, ...derivedRoles, hasRole, loading, refetch: fetchRoles };
 }
