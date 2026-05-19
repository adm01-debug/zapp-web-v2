 import { supabase } from '@/integrations/supabase/client';
 import { User, Session } from '@supabase/supabase-js';
 import { log } from '@/lib/logger';
 
 export interface Profile {
   id: string;
   user_id: string;
   name: string;
   email: string | null;
   avatar_url: string | null;
   role: string;
   max_chats: number;
 }
 
 export class AuthService {
   static async getSession() {
     const { data, error } = await supabase.auth.getSession();
     if (error) throw error;
     return data.session;
   }
 
   static async fetchProfile(userId: string): Promise<Profile | null> {
     try {
       const { data, error } = await supabase
         .from('profiles')
         .select('*')
         .eq('user_id', userId)
         .maybeSingle();
 
       if (error) throw error;
       return data as Profile;
     } catch (err) {
       log.warn('[AuthService] Failed to fetch profile:', userId, err);
       return null;
     }
   }
 
   static async signIn(email: string, password: string) {
     return supabase.auth.signInWithPassword({ email, password });
   }
 
   static async signUp(email: string, password: string, name: string) {
     const redirectUrl = `${window.location.origin}/`;
     return supabase.auth.signUp({
       email,
       password,
       options: {
         emailRedirectTo: redirectUrl,
         data: { name }
       }
     });
   }
 
   static async signOut() {
     return supabase.auth.signOut();
   }
 
   static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
     const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
     return subscription;
   }
 }