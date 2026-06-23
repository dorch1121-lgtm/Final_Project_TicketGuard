-- TicketGuard upload/analysis flow security fix.
--
-- This migration fixes the production path used by UploadReportPage:
-- auth.uid() is matched against profiles.user_id and report_cases.user_id.
-- It does not rely on profiles.id for authorization.

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

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.is_super_admin()
$$;

drop function if exists public.complete_report_analysis(uuid);

create function public.complete_report_analysis(p_report_case_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_report_user_id uuid;
  v_free_report_used boolean;
  v_is_paid boolean;
  v_access_type text;
begin
  if v_actor_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select rc.user_id
  into v_report_user_id
  from public.report_cases rc
  where rc.id = p_report_case_id
  for update;

  if not found then
    raise exception 'Report not found';
  end if;

  if v_report_user_id is null then
    raise exception 'Report is not linked to a user profile';
  end if;

  if v_report_user_id is null
     or (v_report_user_id <> v_actor_user_id and not public.is_super_admin()) then
    raise exception 'Permission denied';
  end if;

  if not exists (
    select 1
    from public.analysis_results ar
    where ar.report_case_id = p_report_case_id
  ) then
    raise exception 'Analysis result missing';
  end if;

  select p.free_report_used
  into v_free_report_used
  from public.profiles p
  where p.user_id = v_report_user_id
  for update;

  if not found then
    raise exception 'Profile not found';
  end if;

  if v_free_report_used then
    select exists (
      select 1
      from public.payments pay
      where pay.report_case_id = p_report_case_id
        and pay.user_id = v_report_user_id
        and pay.payment_status = 'paid'
    )
    into v_is_paid;

    if not v_is_paid then
      raise exception 'Payment required';
    end if;

    v_access_type := 'paid';
  else
    update public.profiles
    set free_report_used = true,
        updated_at = now()
    where user_id = v_report_user_id;

    v_access_type := 'free';
  end if;

  update public.report_cases
  set status = 'analyzed',
      updated_at = now()
  where id = p_report_case_id;

  return jsonb_build_object(
    'report_case_id', p_report_case_id,
    'user_id', v_report_user_id,
    'status', 'analyzed',
    'access_type', v_access_type,
    'free_report_used', true
  );
end;
$$;

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
    select 1
    from public.report_cases rc
    where rc.id = p_report_case_id
      and rc.user_id = v_user_id
  ) then
    raise exception 'Report not found';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.user_id = v_user_id
      and p.free_report_used = true
  ) then
    raise exception 'The first completed analysis is free';
  end if;

  select pay.id
  into v_payment_id
  from public.payments pay
  where pay.report_case_id = p_report_case_id
    and pay.user_id = v_user_id
    and pay.payment_status in ('pending', 'paid')
  order by pay.created_at desc
  limit 1;

  if v_payment_id is null then
    insert into public.payments (
      user_id,
      report_case_id,
      amount,
      currency,
      payment_status,
      provider
    ) values (
      v_user_id,
      p_report_case_id,
      30,
      'ILS',
      'pending',
      'manual'
    )
    returning id into v_payment_id;
  end if;

  update public.profiles
  set payment_status = 'required',
      updated_at = now()
  where user_id = v_user_id;

  return v_payment_id;
end;
$$;

create or replace function public.create_admin_review_if_needed(p_report_case_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_user_id uuid := auth.uid();
  v_report_user_id uuid;
  v_is_exceptional boolean;
  v_review_id uuid;
begin
  if v_actor_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select rc.user_id, rc.is_exceptional
  into v_report_user_id, v_is_exceptional
  from public.report_cases rc
  where rc.id = p_report_case_id;

  if not found then
    raise exception 'Report not found';
  end if;

  if v_report_user_id <> v_actor_user_id and not public.is_super_admin() then
    raise exception 'Permission denied';
  end if;

  if not coalesce(v_is_exceptional, false) then
    return null;
  end if;

  select ar.id
  into v_review_id
  from public.admin_reviews ar
  where ar.report_case_id = p_report_case_id
  limit 1;

  if v_review_id is null then
    insert into public.admin_reviews (
      report_case_id,
      reason,
      priority,
      status,
      admin_notes
    ) values (
      p_report_case_id,
      'ניתוח דוח סומן כחריג ודורש בדיקה ידנית',
      'medium',
      'pending',
      'נוצר אוטומטית לאחר ניתוח הדוח. reviewed_by נשאר ריק עד שאדמין מטפל בבדיקה.'
    )
    returning id into v_review_id;
  end if;

  return v_review_id;
end;
$$;

revoke all on function public.complete_report_analysis(uuid) from public;
grant execute on function public.complete_report_analysis(uuid) to authenticated;

revoke all on function public.create_payment_intent(uuid) from public;
grant execute on function public.create_payment_intent(uuid) to authenticated;

revoke all on function public.create_admin_review_if_needed(uuid) from public;
grant execute on function public.create_admin_review_if_needed(uuid) to authenticated;

alter table public.report_files enable row level security;
alter table public.analysis_results enable row level security;
alter table public.admin_reviews enable row level security;

drop policy if exists "report_files_select_by_case_access" on public.report_files;
drop policy if exists "report_files_select_own_or_super_admin" on public.report_files;
create policy "report_files_select_own_or_super_admin"
on public.report_files
for select
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

drop policy if exists "report_files_insert_by_case_access" on public.report_files;
drop policy if exists "report_files_insert_own_case" on public.report_files;
create policy "report_files_insert_own_case"
on public.report_files
for insert
to authenticated
with check (
  exists (
    select 1
    from public.report_cases rc
    where rc.id = report_files.report_case_id
      and rc.user_id = auth.uid()
  )
);

drop policy if exists "report_files_update_by_case_access" on public.report_files;
drop policy if exists "report_files_update_own_case" on public.report_files;
create policy "report_files_update_own_case"
on public.report_files
for update
to authenticated
using (
  exists (
    select 1
    from public.report_cases rc
    where rc.id = report_files.report_case_id
      and rc.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.report_cases rc
    where rc.id = report_files.report_case_id
      and rc.user_id = auth.uid()
  )
);

drop policy if exists "report_files_delete_by_case_access" on public.report_files;
drop policy if exists "report_files_delete_own_or_super_admin" on public.report_files;
create policy "report_files_delete_own_or_super_admin"
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

drop policy if exists "analysis_results_select_by_case_access" on public.analysis_results;
drop policy if exists "analysis_results_select_own_or_super_admin" on public.analysis_results;
create policy "analysis_results_select_own_or_super_admin"
on public.analysis_results
for select
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.report_cases rc
    where rc.id = analysis_results.report_case_id
      and rc.user_id = auth.uid()
  )
);

drop policy if exists "analysis_results_insert_super_admin" on public.analysis_results;
drop policy if exists "analysis_results_insert_own_case" on public.analysis_results;
create policy "analysis_results_insert_own_case"
on public.analysis_results
for insert
to authenticated
with check (
  exists (
    select 1
    from public.report_cases rc
    where rc.id = analysis_results.report_case_id
      and rc.user_id = auth.uid()
  )
);

drop policy if exists "analysis_results_update_super_admin" on public.analysis_results;
drop policy if exists "analysis_results_update_own_case_or_super_admin" on public.analysis_results;
create policy "analysis_results_update_own_case_or_super_admin"
on public.analysis_results
for update
to authenticated
using (
  public.is_super_admin()
  or exists (
    select 1
    from public.report_cases rc
    where rc.id = analysis_results.report_case_id
      and rc.user_id = auth.uid()
  )
)
with check (
  public.is_super_admin()
  or exists (
    select 1
    from public.report_cases rc
    where rc.id = analysis_results.report_case_id
      and rc.user_id = auth.uid()
  )
);

drop policy if exists "analysis_results_delete_super_admin" on public.analysis_results;
create policy "analysis_results_delete_super_admin"
on public.analysis_results
for delete
to authenticated
using (public.is_super_admin());

drop policy if exists "admin_reviews_select_admin_exceptional" on public.admin_reviews;
drop policy if exists "admin_reviews_select_super_admin" on public.admin_reviews;
create policy "admin_reviews_select_super_admin"
on public.admin_reviews
for select
to authenticated
using (public.is_super_admin());

drop policy if exists "admin_reviews_insert_super_admin_exceptional" on public.admin_reviews;
drop policy if exists "admin_reviews_insert_super_admin" on public.admin_reviews;
create policy "admin_reviews_insert_super_admin"
on public.admin_reviews
for insert
to authenticated
with check (public.is_super_admin());

drop policy if exists "admin_reviews_update_admin_exceptional" on public.admin_reviews;
drop policy if exists "admin_reviews_update_super_admin" on public.admin_reviews;
create policy "admin_reviews_update_super_admin"
on public.admin_reviews
for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "admin_reviews_delete_super_admin" on public.admin_reviews;
create policy "admin_reviews_delete_super_admin"
on public.admin_reviews
for delete
to authenticated
using (public.is_super_admin());
