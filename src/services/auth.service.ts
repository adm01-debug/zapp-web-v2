import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { log } from '@/lib/logger';
import { Profile } from '@/types';

export class AuthService {
  private static sessionPromise: Promise<Session | null> | null = null;

  static async getSession() {
    if (this.sessionPromise) return this.sessionPromise;
    
    this.sessionPromise = supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        this.sessionPromise = null;
        throw error;
      }
      return data.session;
    }).catch(err => {
      this.sessionPromise = null;
      throw err;
    });

    return this.sessionPromise;
  }

  static async fetchProfile(userId: string): Promise<Profile | null> {
...
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Clear session promise on auth change to ensure next getSession is fresh
      this.sessionPromise = null;
      callback(event, session);
    });
    return subscription;
  }
}
