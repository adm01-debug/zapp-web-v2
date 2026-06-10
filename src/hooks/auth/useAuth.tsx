 import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
 import { User, Session } from '@supabase/supabase-js';
 import { AuthService } from '@/services/auth.service';
 import { Profile } from '@/types';
 import { log } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

 export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const fetchingRef = useRef(false);

   const fetchProfile = useCallback(async (userId: string) => {
     if (fetchingRef.current) return;
     fetchingRef.current = true;
     const data = await AuthService.fetchProfile(userId);
     if (data) setProfile(data);
     fetchingRef.current = false;
   }, []);

  useEffect(() => {
    log.debug('[BOOT] AuthProvider initialized, starting session check');
    
    // Check for existing session first to prevent flickering
    AuthService.getSession()
      .then(async (session) => {
        log.debug('[BOOT] Initial session retrieved:', session ? 'User Found' : 'No User');
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          void fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      })
      .catch((err) => {
        log.error('[BOOT] Error fetching session:', err);
      })
      .finally(() => {
        setLoading(false);
        log.debug('[BOOT] Auth initial load finished');
      });

    const subscription = AuthService.onAuthStateChange(async (event, session) => {
      log.debug('[BOOT] Auth state change:', event, session ? 'Authenticated' : 'Unauthenticated');
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        void fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      
      // Handle login/logout specific UI feedback if needed
      if (event === 'SIGNED_IN') {
        log.debug('[AUTH] User signed in');
      } else if (event === 'SIGNED_OUT') {
        log.debug('[AUTH] User signed out');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      fetchingRef.current = false; // Reset guard to allow re-fetch
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

   const signIn = async (email: string, password: string) => {
     const { error } = await AuthService.signIn(email, password);
     return { error };
   };
 
   const signUp = async (email: string, password: string, name: string) => {
     const { error } = await AuthService.signUp(email, password, name);
     return { error };
   };
 
   const signOut = async () => {
     await AuthService.signOut();
     setProfile(null);
   };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
