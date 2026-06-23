-- TicketGuard Supabase schema
-- Module 8 backend preparation.
-- This file creates tables only. It intentionally does not enable RLS policies yet.
-- Do not store API keys or credentials in this file.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Stores TicketGuard-specific user data.
-- Supabase Auth remains the source of truth for login identities.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text not null unique,
  role text not null default 'user',
  free_report_used boolean not null default false,
  payment_status text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_role_check check (role in ('user', 'admin', 'super_admin')),
  constraint profiles_payment_status_check check (payment_status in ('none', 'required', 'paid', 'failed'))
);

comment on table public.profiles is 'App-specific user profile data linked to Supabase Auth users.';
comment on column public.profiles.role is 'Allowed values: user, admin, super_admin. Guests are unauthenticated and are not stored as a profile role.';

create unique index if not exists profiles_single_super_admin_unique
on public.profiles(role)
where role = 'super_admin';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Main uploaded fine/report case.
-- user_id is nullable to allow a future guest free-report flow.
create table if not exists public.report_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete set null,
  report_type text,
  authority text,
  status text not null default 'uploaded',
  appeal_chance numeric(5,2),
  risk_level text,
  is_exceptional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_cases_status_check check (status in ('uploaded', 'missing_details', 'analyzing', 'analyzed', 'manual_review', 'closed')),
  constraint report_cases_appeal_chance_check check (appeal_chance is null or (appeal_chance >= 0 and appeal_chance <= 100)),
  constraint report_cases_risk_level_check check (risk_level is null or risk_level in ('low', 'medium', 'high'))
);

comment on table public.report_cases is 'Traffic, parking, or municipal fine case uploaded by a user or future guest flow.';
comment on column public.report_cases.is_exceptional is 'When true, the case can be shown to admins for manual review.';

drop trigger if exists report_cases_set_updated_at on public.report_cases;
create trigger report_cases_set_updated_at
before update on public.report_cases
for each row execute function public.set_updated_at();

-- Metadata for the uploaded report PDF.
create table if not exists public.report_files (
  id uuid primary key default gen_random_uuid(),
  report_case_id uuid not null unique references public.report_cases(id) on delete cascade,
  file_name text not null,
  file_url text,
  file_type text not null default 'application/pdf',
  file_size bigint,
  upload_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint report_files_upload_status_check check (upload_status in ('pending', 'uploaded', 'failed')),
  constraint report_files_file_size_check check (file_size is null or file_size >= 0)
);

comment on table public.report_files is 'Metadata for uploaded PDF files associated with report cases.';

drop trigger if exists report_files_set_updated_at on public.report_files;
create trigger report_files_set_updated_at
before update on public.report_files
for each row execute function public.set_updated_at();

-- Details extracted from the uploaded report by OCR or AI.
create table if not exists public.extracted_report_details (
  id uuid primary key default gen_random_uuid(),
  report_case_id uuid not null unique references public.report_cases(id) on delete cascade,
  report_number text,
  violation_date date,
  violation_time time,
  location text,
  vehicle_number text,
  fine_amount numeric(10,2),
  points integer,
  violation_description text,
  raw_extracted_text text,
  confidence_score numeric(5,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint extracted_report_details_fine_amount_check check (fine_amount is null or fine_amount >= 0),
  constraint extracted_report_details_points_check check (points is null or points >= 0),
  constraint extracted_report_details_confidence_score_check check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1))
);

comment on table public.extracted_report_details is 'Structured data extracted from the uploaded fine PDF.';

drop trigger if exists extracted_report_details_set_updated_at on public.extracted_report_details;
create trigger extracted_report_details_set_updated_at
before update on public.extracted_report_details
for each row execute function public.set_updated_at();

-- Missing information questions generated after extraction.
create table if not exists public.missing_details (
  id uuid primary key default gen_random_uuid(),
  report_case_id uuid not null references public.report_cases(id) on delete cascade,
  field_name text not null,
  question_text text not null,
  is_required boolean not null default true,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missing_details_status_check check (status in ('open', 'answered', 'skipped'))
);

comment on table public.missing_details is 'Questions for details that were missing or unclear in the uploaded fine.';

drop trigger if exists missing_details_set_updated_at on public.missing_details;
create trigger missing_details_set_updated_at
before update on public.missing_details
for each row execute function public.set_updated_at();

-- User-provided answers for missing information.
create table if not exists public.user_answers (
  id uuid primary key default gen_random_uuid(),
  missing_detail_id uuid not null references public.missing_details(id) on delete cascade,
  report_case_id uuid not null references public.report_cases(id) on delete cascade,
  user_id uuid references public.profiles(user_id) on delete set null,
  answer_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_answers is 'Answers supplied by users or a future guest flow for missing report details.';

drop trigger if exists user_answers_set_updated_at on public.user_answers;
create trigger user_answers_set_updated_at
before update on public.user_answers
for each row execute function public.set_updated_at();

-- Final or latest analysis result for a report case.
create table if not exists public.analysis_results (
  id uuid primary key default gen_random_uuid(),
  report_case_id uuid not null unique references public.report_cases(id) on delete cascade,
  chance_percentage numeric(5,2),
  risk_level text,
  explanation text,
  recommendation text,
  legal_disclaimer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint analysis_results_chance_percentage_check check (chance_percentage is null or (chance_percentage >= 0 and chance_percentage <= 100)),
  constraint analysis_results_risk_level_check check (risk_level is null or risk_level in ('low', 'medium', 'high'))
);

comment on table public.analysis_results is 'System-generated analysis result and estimated appeal chance for a report case.';

drop trigger if exists analysis_results_set_updated_at on public.analysis_results;
create trigger analysis_results_set_updated_at
before update on public.analysis_results
for each row execute function public.set_updated_at();

-- Explanation factors that support the analysis result.
create table if not exists public.analysis_factors (
  id uuid primary key default gen_random_uuid(),
  analysis_result_id uuid not null references public.analysis_results(id) on delete cascade,
  factor_type text not null,
  title text not null,
  description text,
  impact_score numeric(6,2),
  created_at timestamptz not null default now(),
  constraint analysis_factors_factor_type_check check (factor_type in ('strong_point', 'weak_point', 'missing_info'))
);

comment on table public.analysis_factors is 'Positive, negative, or missing-information factors attached to an analysis result.';

-- Manual admin review record for exceptional report cases.
create table if not exists public.admin_reviews (
  id uuid primary key default gen_random_uuid(),
  report_case_id uuid not null unique references public.report_cases(id) on delete cascade,
  reason text not null,
  priority text not null default 'medium',
  status text not null default 'pending',
  admin_notes text,
  reviewed_by uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_reviews_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint admin_reviews_status_check check (status in ('pending', 'in_review', 'resolved'))
);

comment on table public.admin_reviews is 'Manual review workflow for exceptional report cases. Admins should only update review status and notes.';

drop trigger if exists admin_reviews_set_updated_at on public.admin_reviews;
create trigger admin_reviews_set_updated_at
before update on public.admin_reviews
for each row execute function public.set_updated_at();

-- Payment records for future paid report flows.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(user_id) on delete set null,
  report_case_id uuid references public.report_cases(id) on delete set null,
  amount numeric(10,2) not null,
  currency text not null default 'ILS',
  payment_status text not null default 'pending',
  provider text,
  provider_transaction_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_amount_check check (amount >= 0),
  constraint payments_payment_status_check check (payment_status in ('pending', 'paid', 'failed', 'cancelled', 'refunded'))
);

comment on table public.payments is 'Payment records for future paid analysis/report flows.';

create unique index if not exists payments_provider_transaction_id_unique
on public.payments(provider_transaction_id)
where provider_transaction_id is not null;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

-- Invitations created by the project owner/super admin to grant admin access.
-- role_to_grant is restricted to admin so invitations cannot create super admins.
create table if not exists public.admin_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid not null references public.profiles(user_id) on delete restrict,
  role_to_grant text not null default 'admin',
  status text not null default 'pending',
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint admin_invitations_role_to_grant_check check (role_to_grant = 'admin'),
  constraint admin_invitations_status_check check (status in ('pending', 'accepted', 'expired', 'revoked'))
);

comment on table public.admin_invitations is 'Admin invitation records. Only the super_admin should be allowed to create these through future RLS or server-side logic.';
comment on column public.admin_invitations.token_hash is 'Hash of the invitation token. Never store the raw invitation token.';

-- Immutable audit trail for role changes.
create table if not exists public.role_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.profiles(user_id) on delete restrict,
  target_user_id uuid not null references public.profiles(user_id) on delete restrict,
  old_role text not null,
  new_role text not null,
  action text not null,
  created_at timestamptz not null default now(),
  constraint role_audit_logs_old_role_check check (old_role in ('user', 'admin', 'super_admin')),
  constraint role_audit_logs_new_role_check check (new_role in ('user', 'admin', 'super_admin')),
  constraint role_audit_logs_action_check check (action in ('promote_admin', 'demote_admin', 'grant_super_admin', 'revoke_super_admin', 'accept_admin_invitation'))
);

comment on table public.role_audit_logs is 'Audit trail for role changes. Every admin promotion or demotion should create a row.';

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists report_cases_user_id_idx on public.report_cases(user_id);
create index if not exists report_cases_is_exceptional_idx on public.report_cases(is_exceptional);
create index if not exists missing_details_report_case_id_idx on public.missing_details(report_case_id);
create index if not exists user_answers_report_case_id_idx on public.user_answers(report_case_id);
create index if not exists admin_reviews_status_idx on public.admin_reviews(status);
create index if not exists admin_invitations_email_idx on public.admin_invitations(email);
create index if not exists role_audit_logs_actor_user_id_idx on public.role_audit_logs(actor_user_id);
create index if not exists role_audit_logs_target_user_id_idx on public.role_audit_logs(target_user_id);
