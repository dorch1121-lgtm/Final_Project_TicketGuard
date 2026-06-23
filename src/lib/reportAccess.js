import { throwIfError } from './errors';
import { supabase } from './supabase';

export const FREE_REPORT_PRICE = 30;
export const FREE_REPORT_CURRENCY = 'ILS';

function requireSupabaseClient() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

async function getAuthenticatedUser(client) {
  const { data, error } = await client.auth.getUser();
  throwIfError(error);
  if (!data?.user?.id) throw new Error('Not authenticated');
  return data.user;
}

export async function getMyAccessStatus() {
  const client = requireSupabaseClient();
  const user = await getAuthenticatedUser(client);
  const { data, error } = await client
    .from('profiles')
    .select('free_report_used, payment_status')
    .eq('user_id', user.id)
    .maybeSingle();
  throwIfError(error);
  if (!data) throw new Error('Profile not found');

  return {
    freeReportUsed: Boolean(data.free_report_used),
    paymentStatus: data.payment_status ?? 'none',
  };
}

export async function completeReportAnalysis(reportCaseId) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('complete_report_analysis', {
    p_report_case_id: reportCaseId,
  });
  throwIfError(error);
  return data;
}

export async function createPaymentIntent(reportCaseId) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('create_payment_intent', {
    p_report_case_id: reportCaseId,
  });
  throwIfError(error);
  return data;
}

export async function createAdminReviewIfNeeded(reportCaseId) {
  const client = requireSupabaseClient();
  const { data, error } = await client.rpc('create_admin_review_if_needed', {
    p_report_case_id: reportCaseId,
  });
  throwIfError(error);
  return data;
}

export async function verifyPaidAccess(reportCaseId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('payments')
    .select('id')
    .eq('report_case_id', reportCaseId)
    .eq('payment_status', 'paid')
    .limit(1)
    .maybeSingle();
  throwIfError(error);
  return Boolean(data);
}

export async function getPaymentById(paymentId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .maybeSingle();
  throwIfError(error);
  return data;
}

export async function getReportCase(reportCaseId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('report_cases')
    .select('*')
    .eq('id', reportCaseId)
    .maybeSingle();
  throwIfError(error);
  return data;
}

export function subscribeToPayment(paymentId, onChange) {
  const client = requireSupabaseClient();
  const channel = client
    .channel(`payment-${paymentId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'payments',
      filter: `id=eq.${paymentId}`,
    }, (payload) => onChange(payload.new))
    .subscribe();

  return () => client.removeChannel(channel);
}
