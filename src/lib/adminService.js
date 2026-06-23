import { throwIfError } from './errors';
import { supabase } from './supabase';

function requireSupabaseClient() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function isThisMonth(value, now = new Date()) {
  if (!value) return false;
  const date = new Date(value);
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

export async function adminGetDashboardKpis() {
  const client = requireSupabaseClient();
  const [profilesResult, reportsResult, paymentsResult] = await Promise.all([
    client.from('profiles').select('role, free_report_used, created_at'),
    client.from('report_cases').select('status, appeal_chance, is_exceptional, created_at'),
    client.from('payments').select('amount, payment_status, paid_at, created_at'),
  ]);

  throwIfError(profilesResult.error);
  throwIfError(reportsResult.error);
  throwIfError(paymentsResult.error);

  const profiles = profilesResult.data ?? [];
  const reports = reportsResult.data ?? [];
  const payments = paymentsResult.data ?? [];
  const paidPayments = payments.filter((payment) => payment.payment_status === 'paid');
  const appealChances = reports
    .map((report) => Number(report.appeal_chance))
    .filter(Number.isFinite);

  return {
    total_users: profiles.length,
    admin_users: profiles.filter((profile) => ['admin', 'super_admin'].includes(profile.role)).length,
    regular_users: profiles.filter((profile) => profile.role === 'user').length,
    free_reports_used: profiles.filter((profile) => profile.free_report_used).length,
    new_users_this_month: profiles.filter((profile) => isThisMonth(profile.created_at)).length,
    total_reports: reports.length,
    uploaded_reports: reports.filter((report) => report.status === 'uploaded').length,
    analyzed_reports: reports.filter((report) => report.status === 'analyzed').length,
    manual_review_reports: reports.filter((report) => report.status === 'manual_review').length,
    exceptional_reports: reports.filter((report) => report.is_exceptional).length,
    reports_this_month: reports.filter((report) => isThisMonth(report.created_at)).length,
    average_appeal_chance: appealChances.length
      ? appealChances.reduce((sum, chance) => sum + chance, 0) / appealChances.length
      : 0,
    total_payments: payments.length,
    paid_payments: paidPayments.length,
    pending_payments: payments.filter((payment) => payment.payment_status === 'pending').length,
    failed_payments: payments.filter((payment) => ['failed', 'cancelled'].includes(payment.payment_status)).length,
    total_revenue: paidPayments.reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    monthly_revenue: paidPayments
      .filter((payment) => isThisMonth(payment.paid_at ?? payment.created_at))
      .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
  };
}

export async function adminListUsers() {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('profiles')
    .select('user_id, full_name, email, role, free_report_used, payment_status, created_at, updated_at')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data ?? [];
}

export async function adminGetUserDetails(userId) {
  const client = requireSupabaseClient();
  const [profileResult, reportsResult, paymentsResult] = await Promise.all([
    client
      .from('profiles')
      .select('user_id, full_name, email, role, free_report_used, payment_status, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle(),
    client.from('report_cases').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    client.from('payments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
  ]);

  throwIfError(profileResult.error);
  throwIfError(reportsResult.error);
  throwIfError(paymentsResult.error);
  return {
    profile: profileResult.data,
    reports: reportsResult.data ?? [],
    payments: paymentsResult.data ?? [],
  };
}

export async function adminChangeUserRole(userId, newRole) {
  const client = requireSupabaseClient();
  const { error } = await client.rpc('admin_change_user_role', {
    p_user_id: userId,
    p_new_role: newRole,
  });
  throwIfError(error);
}

export async function adminResetFreeReport(userId) {
  const client = requireSupabaseClient();
  const { error } = await client
    .from('profiles')
    .update({ free_report_used: false, payment_status: 'none' })
    .eq('user_id', userId);
  throwIfError(error);
}

export async function adminConfirmPayment(paymentId) {
  const client = requireSupabaseClient();
  const { data: payment, error } = await client
    .from('payments')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', paymentId)
    .select('user_id')
    .single();
  throwIfError(error);

  if (payment?.user_id) {
    const { error: profileError } = await client
      .from('profiles')
      .update({ payment_status: 'paid' })
      .eq('user_id', payment.user_id);
    throwIfError(profileError);
  }
}

export async function adminMarkForReview(reportCaseId) {
  const client = requireSupabaseClient();
  const { error } = await client
    .from('report_cases')
    .update({ status: 'manual_review', is_exceptional: true })
    .eq('id', reportCaseId);
  throwIfError(error);
}

export async function adminGetActivityLogs(limit = 100) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('role_audit_logs')
    .select('id, created_at, actor_user_id, target_user_id, old_role, new_role, action')
    .order('created_at', { ascending: false })
    .limit(limit);
  throwIfError(error);
  return data ?? [];
}

export async function adminGetAllPayments() {
  const client = requireSupabaseClient();
  const { data: payments, error } = await client
    .from('payments')
    .select('id, user_id, report_case_id, amount, currency, payment_status, provider, provider_transaction_id, paid_at, created_at, updated_at')
    .order('created_at', { ascending: false });
  throwIfError(error);

  const userIds = [...new Set((payments ?? []).map((payment) => payment.user_id).filter(Boolean))];
  const profileById = new Map();
  if (userIds.length) {
    const { data: profiles, error: profilesError } = await client
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_id', userIds);
    throwIfError(profilesError);
    (profiles ?? []).forEach((profile) => profileById.set(profile.user_id, profile));
  }

  return (payments ?? []).map((payment) => ({
    ...payment,
    payer: profileById.get(payment.user_id) ?? null,
  }));
}

export async function adminCreateUser({ fullName, email, role }) {
  const client = requireSupabaseClient();
  const { data, error } = await client.functions.invoke('admin-create-user', {
    body: { fullName, email, role },
  });
  if (error) throw new Error(error.message || 'לא ניתן היה ליצור משתמש כרגע.');
  if (data?.error) throw new Error(data.error);
  return data;
}
