-- TicketGuard Supabase Storage policies
-- Module 8 storage security preparation.
-- Safe to run in the Supabase SQL Editor after RLS_POLICIES.sql.
-- This file does not include API keys, secrets, or service_role usage.

-- Bucket expected:
--   report-pdfs
--
-- Path convention for uploaded files:
--   {user_id}/{report_case_id}/{file_name}.pdf
--
-- Example:
--   ad409983-1389-40e4-a06b-c27ddf1442a6/REPORT_CASE_UUID/sample-ticket.pdf
--
-- The report-pdfs bucket should remain private.
-- PDF-only enforcement is configured in the bucket settings with:
--   file size limit: 10 MB
--   allowed MIME type: application/pdf
--
-- Frontend validation should also check PDF file type before upload.

-- =========================================================
-- storage.objects policies for report-pdfs
-- =========================================================

-- Authenticated users can read files in their own top-level folder.
-- Admins can read files only for exceptional report cases.
-- super_admin can read any report PDF when needed.
drop policy if exists "report_pdfs_select_own_or_admin" on storage.objects;
create policy "report_pdfs_select_own_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'report-pdfs'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_super_admin()
    or (
      public.is_admin()
      and exists (
        select 1
        from public.report_cases rc
        where rc.id::text = (storage.foldername(name))[2]
          and rc.is_exceptional = true
      )
    )
  )
);

-- Authenticated users can upload only into their own top-level folder.
-- Expected object name shape: user_id/report_case_id/file_name.pdf
drop policy if exists "report_pdfs_insert_own_folder" on storage.objects;
create policy "report_pdfs_insert_own_folder"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'report-pdfs'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) >= 2
);

-- Updates are allowed only for the owning user's folder.
-- This supports replacing a file path owned by the current user without broad write access.
drop policy if exists "report_pdfs_update_own_folder" on storage.objects;
create policy "report_pdfs_update_own_folder"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'report-pdfs'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'report-pdfs'
  and (storage.foldername(name))[1] = auth.uid()::text
  and array_length(storage.foldername(name), 1) >= 2
);

-- Deletes are restricted.
-- Regular users can delete only files in their own folder.
-- super_admin can delete any report PDF if needed.
drop policy if exists "report_pdfs_delete_own_or_super_admin" on storage.objects;
create policy "report_pdfs_delete_own_or_super_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'report-pdfs'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_super_admin()
  )
);
