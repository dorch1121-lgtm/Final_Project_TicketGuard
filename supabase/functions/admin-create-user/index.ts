// Secure user-creation endpoint for the admin panel's "Add new user"
// flow. Auth user creation (auth.admin.createUser) requires the
// service-role key, which must never reach the browser — so this has
// to live in an Edge Function, not in React.
//
// Deploy:
//   supabase functions deploy admin-create-user
//   supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...   (already
//     available as SUPABASE_SERVICE_ROLE_KEY in most projects — only
//     set it if it isn't already)
//
// Called from the frontend via:
//   supabase.functions.invoke('admin-create-user', { body: { fullName, email, role } })
// supabase-js automatically forwards the caller's session JWT in the
// Authorization header, which is what this function uses to verify
// the caller is really a super_admin before doing anything privileged.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function randomTempPassword() {
  return `Tg-${crypto.randomUUID().slice(0, 12)}!`;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const authHeader = req.headers.get('Authorization') ?? '';

  // Client scoped to the CALLER's own JWT — only used to verify identity/role.
  const callerClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: callerData, error: callerError } = await callerClient.auth.getUser();
  if (callerError || !callerData?.user) {
    return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
  }

  const { data: callerProfile, error: profileError } = await callerClient
    .from('profiles')
    .select('role')
    .eq('user_id', callerData.user.id)
    .maybeSingle();

  if (profileError || callerProfile?.role !== 'super_admin') {
    return new Response(JSON.stringify({ error: 'Only super_admin can create users' }), { status: 403 });
  }

  let body: { fullName?: string; email?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { fullName, email, role } = body;

  if (!email || !['user', 'admin'].includes(role ?? '')) {
    return new Response(
      JSON.stringify({ error: 'email is required and role must be "user" or "admin"' }),
      { status: 400 },
    );
  }

  // Service-role client — only ever used server-side, never sent to the browser.
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const tempPassword = randomTempPassword();

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: fullName ?? '' },
  });

  if (createError || !created?.user) {
    return new Response(JSON.stringify({ error: createError?.message ?? 'Failed to create user' }), { status: 500 });
  }

  const { error: finishError } = await adminClient.from('profiles').insert({
    user_id: created.user.id,
    full_name: fullName ?? '',
    email,
    role,
    free_report_used: false,
    payment_status: 'none',
  });

  if (finishError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return new Response(JSON.stringify({ error: finishError.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ userId: created.user.id, email, tempPassword }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
