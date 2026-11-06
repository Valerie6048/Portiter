import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, requireSupabase } from '../blog/supabase';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');

  const loadSession = useCallback(async (nextSession) => {
    setSession(nextSession);
    if (!nextSession?.user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const client = requireSupabase();
    const { data: adminData, error: adminError } = await client.from('portiter_blog_admins').select('user_id').eq('user_id', nextSession.user.id).maybeSingle();
    setIsAdmin(Boolean(adminData?.user_id) && !adminError);
    setLoading(false);
  }, []);

  useEffect(() => {
    let alive = true;
    if (!isSupabaseConfigured) {
      return () => { alive = false; };
    }
    const client = requireSupabase();
    client.auth.getSession().then(({ data, error: sessionError }) => {
      if (!alive) return;
      if (sessionError) setError(sessionError.message);
      return loadSession(data.session);
    }).catch((sessionError) => {
      if (alive) {
        setError(sessionError.message);
        setLoading(false);
      }
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (alive) window.setTimeout(() => loadSession(nextSession), 0);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [loadSession]);

  const signIn = async (email, password) => {
    const client = requireSupabase();
    const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;
    const { data: adminData, error: adminError } = await client.from('portiter_blog_admins').select('user_id').eq('user_id', data.user.id).maybeSingle();
    if (adminError || !adminData?.user_id) {
      await client.auth.signOut();
      throw new Error('Akun ini tidak diizinkan mengelola blog.');
    }
    await loadSession(data.session);
  };

  const signOut = async () => {
    const client = requireSupabase();
    await client.auth.signOut();
    setSession(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ session, user: session?.user || null, isAdmin, loading, error, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) throw new Error('useAdminAuth must be used inside AdminAuthProvider');
  return value;
}
