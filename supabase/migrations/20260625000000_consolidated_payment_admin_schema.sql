-- TicketGuard schema-alignment migration.
-- Uses only the existing profiles, report_cases, payments, and role_audit_logs
-- columns. In particular, auth.uid() always matches profiles.user_id.

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

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

-- Preserve the legacy helper name without granting the lesser "admin" role
-- access to super-admin pages or data.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_super_admin()
$$;

-- A report consumes the free allowance only after its analysis succeeds.
-- Locking the profile prevents two concurrent requests from both consuming
-- the single free report.
create or replace function public.complete_report_analysis(p_report_case_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_free_report_used boolean;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.report_cases
    where id = p_report_case_id and user_id = v_user_id
  ) then
    raise exception 'Report not found';
  end if;

  select free_report_used
  into v_free_report_used
  from public.profiles
  where user_id = v_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_free_report_used then
    if not exists (
      select 1
      from public.payments
      where report_case_id = p_report_case_id
        and user_id = v_user_id
        and payment_status = 'paid'
    ) then
      raise exception 'Payment required';
    end if;

    update public.report_cases
    set status = 'analyzed', updated_at = now()
    where id = p_report_case_id and user_id = v_user_id;

    return 'paid';
  end if;

  update public.report_cases
  set status = 'analyzed', updated_at = now()
  where id = p_report_case_id and user_id = v_user_id;

  update public.profiles
  set free_report_used = true, updated_at = now()
  where user_id = v_user_id;

  return 'free';
end;
$$;

-- Creates (or reuses) a manual payment request for a user's own second or
-- later report. The amount is fixed server-side and cannot be supplied by
-- the browser.
create or replace function public.create_payment_intent(p_report_case_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_payment_id uuid;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.report_cases
    where id = p_report_case_id and user_id = v_user_id
  ) then
    raise exception 'Report not found';
  end if;

  if not exists (
    select 1 from public.profiles
    where user_id = v_user_id and free_report_used = true
  ) then
    raise exception 'The first completed analysis is free';
  end if;

  select id into v_payment_id
  from public.payments
  where report_case_id = p_report_case_id
    and user_id = v_user_id
    and payment_status in ('pending', 'paid')
  order by created_at desc
  limit 1;

  if v_payment_id is null then
    insert into public.payments (
      user_id, report_case_id, amount, currency, payment_status, provider
    ) values (
      v_user_id, p_report_case_id, 30, 'ILS', 'pending', 'manual'
    ) returning id into v_payment_id;
  end if;

  update public.profiles
  set payment_status = 'required', updated_at = now()
  where user_id = v_user_id;

  return v_payment_id;
end;
$$;

-- Keeps a role change and its role_audit_logs row in one transaction.
create or replace function public.admin_change_user_role(p_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_old_role text;
  v_action text;
begin
  if not public.is_super_admin() then
    raise exception 'Only super_admin can change roles';
  end if;
  if p_user_id = v_actor_user_id then
    raise exception 'Cannot change your own role';
  end if;
  if p_new_role not in ('user', 'admin') then
    raise exception 'Invalid role';
  end if;

  select role into v_old_role
  from public.profiles
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;
  if v_old_role = p_new_role then
    return;
  end if;

  v_action := case when p_new_role = 'admin' then 'promote_admin' else 'demote_admin' end;

  update public.profiles
  set role = p_new_role, updated_at = now()
  where user_id = p_user_id;

  insert into public.role_audit_logs (
    actor_user_id, target_user_id, old_role, new_role, action
  ) values (
    v_actor_user_id, p_user_id, v_old_role, p_new_role, v_action
  );
end;
$$;

revoke all on function public.complete_report_analysis(uuid) from public;
grant execute on function public.complete_report_analysis(uuid) to authenticated;
revoke all on function public.create_payment_intent(uuid) from public;
grant execute on function public.create_payment_intent(uuid) to authenticated;
revoke all on function public.admin_change_user_role(uuid, text) from public;
grant execute on function public.admin_change_user_role(uuid, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.report_cases enable row level security;
alter table public.payments enable row level security;
alter table public.role_audit_logs enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_select_own_or_super_admin" on public.profiles;
create policy "profiles_select_own_or_super_admin"
on public.profiles for select to authenticated
using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "profiles_insert_own_user_role" on public.profiles;
create policy "profiles_insert_own_user_role"
on public.profiles for insert to authenticated
with check (user_id = auth.uid() and role = 'user');

drop policy if exists "profiles_super_admin_update" on public.profiles;
create policy "profiles_super_admin_update"
on public.profiles for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "profiles_super_admin_delete" on public.profiles;
create policy "profiles_super_admin_delete"
on public.profiles for delete to authenticated
using (public.is_super_admin());

drop policy if exists "report_cases_select_own_admin_exceptional_or_super" on public.report_cases;
drop policy if exists "report_cases_select_own_or_super_admin" on public.report_cases;
create policy "report_cases_select_own_or_super_admin"
on public.report_cases for select to authenticated
using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "report_cases_insert_own" on public.report_cases;
create policy "report_cases_insert_own"
on public.report_cases for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "report_cases_update_admin_exceptional_or_super" on public.report_cases;
drop policy if exists "report_cases_update_own_or_admin_exceptional" on public.report_cases;
drop policy if exists "report_cases_update_super_admin" on public.report_cases;
create policy "report_cases_update_super_admin"
on public.report_cases for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "report_cases_delete_own_or_super" on public.report_cases;
create policy "report_cases_delete_own_or_super"
on public.report_cases for delete to authenticated
using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "payments_select_own_or_super" on public.payments;
drop policy if exists "payments_select_own_or_super_admin" on public.payments;
create policy "payments_select_own_or_super_admin"
on public.payments for select to authenticated
using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "payments_insert_super_admin" on public.payments;
create policy "payments_insert_super_admin"
on public.payments for insert to authenticated
with check (public.is_super_admin());

drop policy if exists "payments_update_super_admin" on public.payments;
create policy "payments_update_super_admin"
on public.payments for update to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "payments_delete_super_admin" on public.payments;
create policy "payments_delete_super_admin"
on public.payments for delete to authenticated
using (public.is_super_admin());

drop policy if exists "role_audit_logs_select_super_admin" on public.role_audit_logs;
create policy "role_audit_logs_select_super_admin"
on public.role_audit_logs for select to authenticated
using (public.is_super_admin());

drop policy if exists "role_audit_logs_insert_super_admin" on public.role_audit_logs;
create policy "role_audit_logs_insert_super_admin"
on public.role_audit_logs for insert to authenticated
with check (public.is_super_admin() and actor_user_id = auth.uid());
