import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { log } from '@/lib/logger';
import { Profile } from '@/types';

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
