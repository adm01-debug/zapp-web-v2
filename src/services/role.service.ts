 import { supabase } from '@/integrations/supabase/client';
 
 export type AppRole = 'admin' | 'supervisor' | 'agent' | 'special_agent';
 
 export class RoleService {
   static async fetchUserRoles(userId: string): Promise<AppRole[]> {
     const { data, error } = await supabase
       .from('user_roles')
       .select('role')
       .eq('user_id', userId);
 
     if (error) throw error;
     return (data?.map(r => r.role) || []) as AppRole[];
   }
 
   static async checkPermission(userId: string, permission: string): Promise<boolean> {
     const { data, error } = await supabase.rpc('user_has_permission', {
       _user_id: userId,
       _permission_name: permission
     });
 
     if (error) return false;
     return data === true;
   }
 }