import { supabase } from './supabase';

function requireSupabaseClient() {
  if (!supabase) {
    return {
      error: new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.'
      ),
    };
  }

  return { client: supabase };
}

export async function signInWithEmail(email, password) {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { data: null, error };
  }

  return client.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email, password, fullName) {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { data: null, error };
  }

  const signUpResult = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (signUpResult.error || !signUpResult.data?.user) {
    return signUpResult;
  }

  const user = signUpResult.data.user;
  const profileResult = await client
    .from('profiles')
    .upsert(
      {
        user_id: user.id,
        full_name: fullName,
        email: user.email ?? email,
        role: 'user',
        free_report_used: false,
        payment_status: 'none',
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (profileResult.error) {
    return { data: signUpResult.data, error: profileResult.error };
  }

  return {
    data: {
      ...signUpResult.data,
      profile: profileResult.data,
    },
    error: null,
  };
}

export async function signOut() {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { error };
  }

  return client.auth.signOut();
}

export async function getCurrentUser() {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { data: { user: null }, error };
  }

  return client.auth.getUser();
}

export async function getCurrentSession() {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { data: { session: null }, error };
  }

  return client.auth.getSession();
}

export async function getUserProfile(userId) {
  const { client, error } = requireSupabaseClient();

  if (error) {
    return { data: null, error };
  }

  return client
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
}
