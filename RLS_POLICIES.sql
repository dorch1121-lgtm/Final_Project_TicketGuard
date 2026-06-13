-- TicketGuard Row Level Security policies
-- Module 8 backend security preparation.
-- Safe to run in the Supabase SQL Editor after SUPABASE_SCHEMA.sql.
-- This file does not drop tables, delete data, modify seed data, or include secrets.

-- =========================================================
-- Helper functions
-- =========================================================

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('admin', 'super_admin'), false)
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

create or replace function public.can_access_report_case(case_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.report_cases rc
    where rc.id = case_id
      and (
        rc.user_id = auth.uid()
        or public.is_super_admin()
        or (
          public.is_admin()
          and rc.is_exceptional = true
        )
      )
  )
$$;

-- =========================================================
-- profiles
-- Users can read their own profile.
-- New users can insert their own profile only as role user.
-- Admins can read profiles. Only super_admin can update or delete profiles.
-- Regular users cannot directly update role, payment_status, or free_report_used.
-- Add a safe RPC later for user-editable fields such as full_name.
-- =========================================================

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "profiles_insert_own_user_role" on public.profiles;
create policy "profiles_insert_own_user_role"
on public.profiles
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'user'
);

drop policy if exists "profiles_update_own_without_role_change" on public.profiles;

drop policy if exists "profiles_super_admin_update" on public.profiles;
create policy "profiles_super_admin_update"
on public.profiles
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "profiles_super_admin_delete" on public.profiles;
create policy "profiles_super_admin_delete"
on public.profiles
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- report_cases
-- Users can select and insert only their own cases.
-- Users cannot directly update analysis/status/admin-controlled case fields.
-- Admins can update only exceptional cases.
-- Super admin can read and update all cases when needed.
-- =========================================================

alter table public.report_cases enable row level security;

drop policy if exists "report_cases_select_own_admin_exceptional_or_super" on public.report_cases;
create policy "report_cases_select_own_admin_exceptional_or_super"
on public.report_cases
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin()
  or (
    public.is_admin()
    and is_exceptional = true
  )
);

drop policy if exists "report_cases_insert_own" on public.report_cases;
create policy "report_cases_insert_own"
on public.report_cases
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "report_cases_update_own_or_admin_exceptional" on public.report_cases;
drop policy if exists "report_cases_update_admin_exceptional_or_super" on public.report_cases;
create policy "report_cases_update_admin_exceptional_or_super"
on public.report_cases
for update
to authenticated
using (
  public.is_super_admin()
  or (
    public.is_admin()
    and is_exceptional = true
  )
)
with check (
  public.is_super_admin()
  or (
    public.is_admin()
    and is_exceptional = true
  )
);

drop policy if exists "report_cases_delete_own_or_super" on public.report_cases;
create policy "report_cases_delete_own_or_super"
on public.report_cases
for delete
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin()
);

-- =========================================================
-- report_files
-- Users can select and insert files through their own report case.
-- Updates remain limited through accessible report cases.
-- Deletes are limited to the case owner or super_admin.
-- =========================================================

alter table public.report_files enable row level security;

drop policy if exists "report_files_select_by_case_access" on public.report_files;
create policy "report_files_select_by_case_access"
on public.report_files
for select
to authenticated
using (public.can_access_report_case(report_case_id));

drop policy if exists "report_files_insert_by_case_access" on public.report_files;
create policy "report_files_insert_by_case_access"
on public.report_files
for insert
to authenticated
with check (public.can_access_report_case(report_case_id));

drop policy if exists "report_files_update_by_case_access" on public.report_files;
create policy "report_files_update_by_case_access"
on public.report_files
for update
to authenticated
using (public.can_access_report_case(report_case_id))
with check (public.can_access_report_case(report_case_id));

drop policy if exists "report_files_delete_by_case_access" on public.report_files;
create policy "report_files_delete_by_case_access"
on public.report_files
for delete
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.report_cases rc
    where rc.id = report_files.report_case_id
      and rc.user_id = auth.uid()
  )
);

-- =========================================================
-- extracted_report_details
-- Read access is allowed through the related report case.
-- Write access is limited to super_admin for testing until backend OCR/AI service functions exist.
-- =========================================================

alter table public.extracted_report_details enable row level security;

drop policy if exists "extracted_report_details_select_by_case_access" on public.extracted_report_details;
create policy "extracted_report_details_select_by_case_access"
on public.extracted_report_details
for select
to authenticated
using (public.can_access_report_case(report_case_id));

drop policy if exists "extracted_report_details_insert_super_admin" on public.extracted_report_details;
create policy "extracted_report_details_insert_super_admin"
on public.extracted_report_details
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "extracted_report_details_update_super_admin" on public.extracted_report_details;
create policy "extracted_report_details_update_super_admin"
on public.extracted_report_details
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "extracted_report_details_delete_super_admin" on public.extracted_report_details;
create policy "extracted_report_details_delete_super_admin"
on public.extracted_report_details
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- missing_details
-- Read access is allowed through the related report case.
-- Write access is limited to super_admin for testing until backend analysis service functions exist.
-- =========================================================

alter table public.missing_details enable row level security;

drop policy if exists "missing_details_select_by_case_access" on public.missing_details;
create policy "missing_details_select_by_case_access"
on public.missing_details
for select
to authenticated
using (public.can_access_report_case(report_case_id));

drop policy if exists "missing_details_insert_super_admin" on public.missing_details;
create policy "missing_details_insert_super_admin"
on public.missing_details
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "missing_details_update_super_admin" on public.missing_details;
create policy "missing_details_update_super_admin"
on public.missing_details
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "missing_details_delete_super_admin" on public.missing_details;
create policy "missing_details_delete_super_admin"
on public.missing_details
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- user_answers
-- Users can create, read, update, and delete answers only for their own report cases.
-- Admins can read answers only for exceptional cases.
-- Super admin can delete when needed.
-- =========================================================

alter table public.user_answers enable row level security;

drop policy if exists "user_answers_select_own_or_admin_exceptional" on public.user_answers;
create policy "user_answers_select_own_or_admin_exceptional"
on public.user_answers
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.report_cases rc
    where rc.id = user_answers.report_case_id
      and rc.user_id = auth.uid()
  )
  or (
    public.is_admin()
    and exists (
      select 1
      from public.report_cases rc
      where rc.id = user_answers.report_case_id
        and rc.is_exceptional = true
    )
  )
);

drop policy if exists "user_answers_insert_own_case" on public.user_answers;
create policy "user_answers_insert_own_case"
on public.user_answers
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = user_answers.report_case_id
      and rc.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.missing_details md
    where md.id = user_answers.missing_detail_id
      and md.report_case_id = user_answers.report_case_id
  )
);

drop policy if exists "user_answers_update_own_case" on public.user_answers;
create policy "user_answers_update_own_case"
on public.user_answers
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = user_answers.report_case_id
      and rc.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = user_answers.report_case_id
      and rc.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.missing_details md
    where md.id = user_answers.missing_detail_id
      and md.report_case_id = user_answers.report_case_id
  )
);

drop policy if exists "user_answers_delete_own_or_super" on public.user_answers;
create policy "user_answers_delete_own_or_super"
on public.user_answers
for delete
to authenticated
using (
  (
    user_id = auth.uid()
    and exists (
      select 1
      from public.report_cases rc
      where rc.id = user_answers.report_case_id
        and rc.user_id = auth.uid()
    )
  )
  or public.is_super_admin()
);

-- =========================================================
-- analysis_results
-- Read access is allowed through the related report case.
-- Write access is limited to super_admin for testing until backend analysis service functions exist.
-- =========================================================

alter table public.analysis_results enable row level security;

drop policy if exists "analysis_results_select_by_case_access" on public.analysis_results;
create policy "analysis_results_select_by_case_access"
on public.analysis_results
for select
to authenticated
using (public.can_access_report_case(report_case_id));

drop policy if exists "analysis_results_insert_super_admin" on public.analysis_results;
create policy "analysis_results_insert_super_admin"
on public.analysis_results
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "analysis_results_update_super_admin" on public.analysis_results;
create policy "analysis_results_update_super_admin"
on public.analysis_results
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "analysis_results_delete_super_admin" on public.analysis_results;
create policy "analysis_results_delete_super_admin"
on public.analysis_results
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- analysis_factors
-- Read access is allowed through the related analysis result and report case.
-- Write access is limited to super_admin for testing until backend analysis service functions exist.
-- =========================================================

alter table public.analysis_factors enable row level security;

drop policy if exists "analysis_factors_select_by_case_access" on public.analysis_factors;
create policy "analysis_factors_select_by_case_access"
on public.analysis_factors
for select
to authenticated
using (
  exists (
    select 1
    from public.analysis_results ar
    where ar.id = analysis_factors.analysis_result_id
      and public.can_access_report_case(ar.report_case_id)
  )
);

drop policy if exists "analysis_factors_insert_super_admin" on public.analysis_factors;
create policy "analysis_factors_insert_super_admin"
on public.analysis_factors
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "analysis_factors_update_super_admin" on public.analysis_factors;
create policy "analysis_factors_update_super_admin"
on public.analysis_factors
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "analysis_factors_delete_super_admin" on public.analysis_factors;
create policy "analysis_factors_delete_super_admin"
on public.analysis_factors
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- admin_reviews
-- Admins and super admins can read/update reviews for exceptional cases.
-- Super admin can insert/delete for testing until backend service functions exist.
-- Regular users cannot read this table directly.
-- =========================================================

alter table public.admin_reviews enable row level security;

drop policy if exists "admin_reviews_select_admin_exceptional" on public.admin_reviews;
create policy "admin_reviews_select_admin_exceptional"
on public.admin_reviews
for select
to authenticated
using (
  public.is_admin()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = admin_reviews.report_case_id
      and rc.is_exceptional = true
  )
);

drop policy if exists "admin_reviews_insert_super_admin_exceptional" on public.admin_reviews;
create policy "admin_reviews_insert_super_admin_exceptional"
on public.admin_reviews
for insert
to authenticated
with check (
  public.is_super_admin()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = admin_reviews.report_case_id
      and rc.is_exceptional = true
  )
);

drop policy if exists "admin_reviews_update_admin_exceptional" on public.admin_reviews;
create policy "admin_reviews_update_admin_exceptional"
on public.admin_reviews
for update
to authenticated
using (
  public.is_admin()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = admin_reviews.report_case_id
      and rc.is_exceptional = true
  )
)
with check (
  public.is_admin()
  and exists (
    select 1
    from public.report_cases rc
    where rc.id = admin_reviews.report_case_id
      and rc.is_exceptional = true
  )
);

drop policy if exists "admin_reviews_delete_super_admin" on public.admin_reviews;
create policy "admin_reviews_delete_super_admin"
on public.admin_reviews
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- payments
-- Users can read only their own payments.
-- Users cannot insert or update payment status manually.
-- Super admin can read and manage records for testing/support.
-- =========================================================

alter table public.payments enable row level security;

drop policy if exists "payments_select_own_or_super" on public.payments;
create policy "payments_select_own_or_super"
on public.payments
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_super_admin()
);

drop policy if exists "payments_insert_super_admin" on public.payments;
create policy "payments_insert_super_admin"
on public.payments
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "payments_update_super_admin" on public.payments;
create policy "payments_update_super_admin"
on public.payments
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "payments_delete_super_admin" on public.payments;
create policy "payments_delete_super_admin"
on public.payments
for delete
to authenticated
using (public.is_super_admin());

-- =========================================================
-- admin_invitations
-- Only super_admin can create, read, update, or delete admin invitations.
-- Admin users cannot invite other admins.
-- =========================================================

alter table public.admin_invitations enable row level security;

drop policy if exists "admin_invitations_super_admin_all" on public.admin_invitations;
create policy "admin_invitations_super_admin_all"
on public.admin_invitations
for all
to authenticated
using (public.is_super_admin())
with check (
  public.is_super_admin()
  and role_to_grant = 'admin'
);

-- =========================================================
-- role_audit_logs
-- Only super_admin can read audit logs.
-- Only super_admin can insert audit log records for now.
-- Audit rows are not updateable or deleteable by normal clients.
-- =========================================================

alter table public.role_audit_logs enable row level security;

drop policy if exists "role_audit_logs_select_super_admin" on public.role_audit_logs;
create policy "role_audit_logs_select_super_admin"
on public.role_audit_logs
for select
to authenticated
using (public.is_super_admin());

drop policy if exists "role_audit_logs_insert_super_admin" on public.role_audit_logs;
create policy "role_audit_logs_insert_super_admin"
on public.role_audit_logs
for insert
to authenticated
with check (
  public.is_super_admin()
  and actor_user_id = auth.uid()
);
