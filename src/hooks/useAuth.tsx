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
     console.log('[BOOT] AuthProvider initialized, starting session check');
     const subscription = AuthService.onAuthStateChange((event, session) => {
       console.log('[BOOT] Auth state change:', event, session ? 'Authenticated' : 'Unauthenticated');
       setSession(session);
       setUser(session?.user ?? null);
       if (session?.user) {
         fetchProfile(session.user.id);
       } else {
         setProfile(null);
       }
     });
 
     AuthService.getSession()
       .then((session) => {
         console.log('[BOOT] Initial session retrieved:', session ? 'User Found' : 'No User');
         setSession(session);
         setUser(session?.user ?? null);
         if (session?.user) {
           fetchProfile(session.user.id);
         }
         setLoading(false);
         console.log('[BOOT] Auth loading finished');
       })
       .catch((err) => {
         console.error('[BOOT] Error fetching session:', err);
         setLoading(false);
       });
 
     return () => subscription.unsubscribe();
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
