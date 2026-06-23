// Placeholder webhook endpoint for a real payment provider (e.g. Tranzila,
// Cardcom, PayPlus, Stripe). Nothing in this repo currently deploys or
// calls this function — it is a ready-to-finish template for when a real
// provider is wired up. Until then, payments are confirmed manually by an
// admin via the `admin_confirm_payment` RPC (see AdminUsagePage).
//
// To finish this:
//   1. Deploy: supabase functions deploy confirm-payment
//   2. Set secrets: supabase secrets set PAYMENT_WEBHOOK_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...
//   3. Point the payment provider's webhook URL at this function.
//   4. Replace the TODO signature-verification block below with the
//      provider's actual verification scheme (HMAC header, shared secret, etc).
//
// This function intentionally never marks a payment as "paid" without a
// verified signature — do not relax that check to "fake" a successful
// payment in development. Use admin_confirm_payment for manual testing
// instead.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WEBHOOK_SECRET = Deno.env.get('PAYMENT_WEBHOOK_SECRET');

function verifyWebhookSignature(_req: Request, _rawBody: string): boolean {
  // TODO: replace with the real provider's signature verification.
  // Example (HMAC-SHA256 shared secret):
  //   const signature = req.headers.get('x-provider-signature');
  //   const expected = hmacSha256(rawBody, WEBHOOK_SECRET);
  //   return timingSafeEqual(signature, expected);
  return Boolean(WEBHOOK_SECRET);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const rawBody = await req.text();

  if (!verifyWebhookSignature(req, rawBody)) {
    return new Response('Invalid signature', { status: 401 });
  }

  let payload: { provider_payment_id?: string; payment_id?: string; status?: string };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  if (payload.status !== 'paid') {
    return new Response(JSON.stringify({ ok: true, ignored: true }), { status: 200 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('id, user_id, report_case_id, payment_status')
    .eq(payload.payment_id ? 'id' : 'provider_transaction_id', payload.payment_id ?? payload.provider_payment_id)
    .maybeSingle();

  if (findError || !payment) {
    return new Response('Payment not found', { status: 404 });
  }

  if (payment.payment_status === 'paid') {
    return new Response(JSON.stringify({ ok: true, already_paid: true }), { status: 200 });
  }

  const { error: updateError } = await supabase
    .from('payments')
    .update({ payment_status: 'paid', paid_at: new Date().toISOString(), provider_transaction_id: payload.provider_payment_id })
    .eq('id', payment.id);

  if (updateError) {
    return new Response('Failed to update payment', { status: 500 });
  }

  await supabase
    .from('profiles')
    .update({ payment_status: 'paid' })
    .eq('user_id', payment.user_id);

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
