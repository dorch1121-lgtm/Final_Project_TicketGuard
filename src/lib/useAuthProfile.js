import { useEffect, useState } from 'react';
import { getCurrentSession, getUserProfile } from './auth';
import { supabase } from './supabase';

const initialAuthState = {
  loading: true,
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
};

function buildAuthState(user, profile) {
  const role = profile?.role ?? null;

  return {
    loading: false,
    user,
    profile,
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
  };
}

async function loadAuthState() {
  const { data: sessionData, error: sessionError } = await getCurrentSession();

  if (sessionError || !sessionData?.session?.user) {
    return buildAuthState(null, null);
  }

  const user = sessionData.session.user;
  const { data: profile, error: profileError } = await getUserProfile(user.id);

  if (profileError) {
    return buildAuthState(user, null);
  }

  return buildAuthState(user, profile);
}

export function useAuthProfile() {
  const [authState, setAuthState] = useState(initialAuthState);

  useEffect(() => {
    let isActive = true;

    const refreshAuthState = async () => {
      const nextState = await loadAuthState();

      if (isActive) {
        setAuthState(nextState);
      }
    };

    refreshAuthState();

    const {
      data: { subscription } = { subscription: null },
    } =
      supabase?.auth.onAuthStateChange(() => {
        refreshAuthState();
      }) ?? {};

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, []);

  return authState;
}

export default useAuthProfile;
