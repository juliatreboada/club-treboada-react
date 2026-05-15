import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId) => {
    // Try the full column set first. If the new `avatar_color` column does
    // not exist yet (migration not applied), retry with the legacy columns
    // so login still works. We never block the rest of the auth flow on a
    // missing/slow profile fetch — see the caller below.
    let { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, email, role, display_name, avatar, avatar_color')
      .eq('user_id', userId)
      .single();

    if (error && /avatar_color/i.test(error.message || '')) {
      const fallback = await supabase
        .from('profiles')
        .select('id, user_id, email, role, display_name, avatar')
        .eq('user_id', userId)
        .single();
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.warn('[auth] Could not load profile:', error.message);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }, []);

  const updateProfile = useCallback(async ({ displayName, avatar, avatarColor }) => {
    const { data, error } = await supabase.rpc('update_my_profile', {
      p_display_name: displayName ?? '',
      p_avatar: avatar ?? '',
      p_avatar_color: avatarColor ?? '',
    });

    if (error) {
      console.error('[auth] Failed to update profile', error);
      throw error;
    }

    setProfile(data);
    return data;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      setUser(session?.user ?? null);
      // Fire-and-forget. We never let a slow/failing profile fetch block
      // the rest of the app (supabase-js has been observed to hang on
      // network errors in this project).
      if (session?.user) {
        loadProfile(session.user.id).catch((err) => {
          console.warn('[auth] loadProfile threw (ignored)', err);
        });
      }
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id).catch((err) => {
            console.warn('[auth] loadProfile threw (ignored)', err);
          });
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    // Always reset local state first so the UI updates immediately, regardless
    // of whether the network call to Supabase succeeds.
    setUser(null);
    setProfile(null);

    // Use `scope: 'local'` so we don't depend on a server round-trip
    // (supabase-js has been observed to hang on the network layer in this
    // project). Fire-and-forget; never let it block the UI.
    try {
      supabase.auth.signOut({ scope: 'local' }).catch((err) => {
        console.warn('[auth] supabase signOut failed (ignored)', err);
      });
    } catch (err) {
      console.warn('[auth] supabase signOut threw (ignored)', err);
    }

    // Belt-and-suspenders: clear any supabase tokens left in storage.
    try {
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('sb-') || key.startsWith('supabase.auth.')) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // ignore — environments without localStorage access
    }
  };

  const value = {
    user,
    profile,
    role: profile?.role ?? null,
    displayName: profile?.display_name ?? null,
    avatar: profile?.avatar ?? null,
    avatarColor: profile?.avatar_color ?? null,
    loading,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};
