import { createContext, createElement, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getUserProfile } from './auth';
import { supabase } from './supabase';

const initialAuthState = {
  loading: true,
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
};

const AuthContext = createContext(initialAuthState);

function buildAuthState(user, profile) {
  const role = profile?.role ?? null;

  return {
    loading: false,
    user,
    profile,
    role,
    isAdmin: role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
  };
}

async function loadAuthState() {
  const { data: userData, error: userError } = await getCurrentUser();

  if (userError || !userData?.user) {
    return buildAuthState(null, null);
  }

  const user = userData.user;
  const { data: profile, error: profileError } = await getUserProfile(user.id);

  if (profileError) {
    return buildAuthState(user, null);
  }

  return buildAuthState(user, profile);
}

export function AuthProvider({ children }) {
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

  return createElement(AuthContext.Provider, { value: authState }, children);
}

export function useAuthProfile() {
  return useContext(AuthContext);
}

export default useAuthProfile;
