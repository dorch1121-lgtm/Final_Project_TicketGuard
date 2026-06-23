import { legalDisclaimer } from '../data/mockData';
import { throwIfError } from './errors';
import { createAdminReviewIfNeeded } from './reportAccess';
import { buildReportStats } from './statusUtils';
import { supabase } from './supabase';

const REPORT_BUCKET = 'report-pdfs';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const latestReportStorageKeys = {
  reportCaseId: 'ticketguard_latest_report_case_id',
  analysisResultId: 'ticketguard_latest_analysis_result_id',
};

export const reportUploadErrors = {
  noFile: 'יש להעלות קובץ PDF לפני תחילת הבדיקה',
  invalidType: 'ניתן להעלות קובץ PDF בלבד',
  fileTooLarge: 'גודל הקובץ חייב להיות עד 10MB',
  uploadFailed: 'אירעה שגיאה בהעלאת הקובץ',
  storageUploadFailed: 'אירעה שגיאה בהעלאת הקובץ. נסה לשנות את שם הקובץ או לבחור קובץ PDF אחר.',
};

function requireSupabaseClient() {
  if (!supabase) {
    throw new Error(reportUploadErrors.uploadFailed);
  }

  return supabase;
}

function validatePdfFile(file) {
  if (!file) {
    throw new Error(reportUploadErrors.noFile);
  }

  if (file.type !== 'application/pdf') {
    throw new Error(reportUploadErrors.invalidType);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(reportUploadErrors.fileTooLarge);
  }
}

export function createSafeStorageFileName(file) {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const sizePart = Number.isFinite(file?.size) ? `-${file.size}` : '';

  return `report-${Date.now()}${sizePart}-${randomPart}.pdf`;
}

function createStoragePath({ userId, reportCaseId, file }) {
  const safeStorageFileName = createSafeStorageFileName(file);

  return [userId, reportCaseId, safeStorageFileName]
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .join('/');
}

function throwSupabaseError(error) {
  throwIfError(error, reportUploadErrors.uploadFailed);
}

export async function createReportCase({
  userId,
  reportType = 'דוח תנועה',
  authority = 'לא זוהה עדיין',
}) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('report_cases')
    .insert({
      user_id: userId,
      report_type: reportType,
      authority,
      status: 'uploaded',
      appeal_chance: 68,
      risk_level: 'medium',
      is_exceptional: true,
    })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function uploadReportPdf({ userId, reportCaseId, file }) {
  const client = requireSupabaseClient();
  validatePdfFile(file);

  const storagePath = createStoragePath({ userId, reportCaseId, file });
  const { error } = await client.storage
    .from(REPORT_BUCKET)
    .upload(storagePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new Error(reportUploadErrors.storageUploadFailed);
  }

  return storagePath;
}

export async function createReportFileRecord({ reportCaseId, file, storagePath }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('report_files')
    .upsert({
      report_case_id: reportCaseId,
      file_name: file.name,
      file_url: storagePath,
      file_type: file.type,
      file_size: file.size,
      upload_status: 'uploaded',
    }, { onConflict: 'report_case_id' })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createMockAnalysisResult({ reportCaseId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('analysis_results')
    .upsert({
      report_case_id: reportCaseId,
      chance_percentage: 68,
      risk_level: 'medium',
      explanation:
        'זהו ניתוח מדומה בלבד. נמצאו נקודות שעשויות לתמוך בבקשת ביטול או הפחתת קנס, אך לא בוצע OCR או AI אמיתי.',
      recommendation:
        'מומלץ להשלים את הפרטים החסרים ולשקול פנייה מנומקת לרשות, תוך בדיקה עצמאית של פרטי הדוח.',
      legal_disclaimer: legalDisclaimer,
    }, { onConflict: 'report_case_id' })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createMockAdminReviewIfNeeded({ reportCaseId }) {
  return createAdminReviewIfNeeded(reportCaseId);
}

export async function getUserReportCases(userId) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('report_cases')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  throwSupabaseError(error);

  return data ?? [];
}

export async function getReportCaseDetails(reportCaseId) {
  const client = requireSupabaseClient();

  const { data: reportCase, error: reportCaseError } = await client
    .from('report_cases')
    .select('*')
    .eq('id', reportCaseId)
    .maybeSingle();

  throwSupabaseError(reportCaseError);

  if (!reportCase) {
    return null;
  }

  const [filesResult, analysisResult, adminReviewResult] = await Promise.all([
    client.from('report_files').select('*').eq('report_case_id', reportCaseId),
    client.from('analysis_results').select('*').eq('report_case_id', reportCaseId).maybeSingle(),
    client.from('admin_reviews').select('*').eq('report_case_id', reportCaseId).maybeSingle(),
  ]);

  return {
    reportCase,
    files: filesResult.data ?? [],
    analysisResult: analysisResult.data ?? null,
    analysisFactors: [],
    missingDetails: [],
    adminReview: adminReviewResult.data ?? null,
    extractedDetails: null,
  };
}

async function attachReporterProfiles(client, reportCases) {
  const userIds = [...new Set(reportCases.map((c) => c.user_id).filter(Boolean))];

  if (userIds.length === 0) {
    return reportCases.map((reportCase) => ({ ...reportCase, reporter: null }));
  }

  const { data: profiles, error } = await client
    .from('profiles')
    .select('user_id, full_name, email')
    .in('user_id', userIds);

  throwSupabaseError(error);

  const profileById = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return reportCases.map((reportCase) => ({
    ...reportCase,
    reporter: profileById.get(reportCase.user_id) ?? null,
  }));
}

export async function getAdminReportCases() {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('report_cases')
    .select('*')
    .order('created_at', { ascending: false });

  throwSupabaseError(error);

  return attachReporterProfiles(client, data ?? []);
}

async function safeCount(promise) {
  try {
    const { count, error } = await promise;
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export async function getAdminOverviewCounts() {
  const client = requireSupabaseClient();

  const [statusRows, pendingReviews, registeredUsers] = await Promise.all([
    client.from('report_cases').select('status'),
    safeCount(client.from('admin_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
    safeCount(client.from('profiles').select('user_id', { count: 'exact', head: true })),
  ]);

  const cases = statusRows.error ? [] : statusRows.data ?? [];

  return {
    reportStats: buildReportStats(cases),
    pendingReviews,
    registeredUsers,
  };
}

/**
 * Runs the mock OCR/AI pipeline for an already-created (and already
 * access-gated — free reservation confirmed or payment verified)
 * report case. Gating itself lives in reportAccess.js; this function
 * only performs the data work.
 */
export async function runMockAnalysisPipeline({ reportCase, userId, file }) {
  validatePdfFile(file);

  const storagePath = await uploadReportPdf({
    userId,
    reportCaseId: reportCase.id,
    file,
  });
  const reportFile = await createReportFileRecord({
    reportCaseId: reportCase.id,
    file,
    storagePath,
  });
  const analysisResult = await createMockAnalysisResult({ reportCaseId: reportCase.id });
  const adminReview = reportCase.is_exceptional
    ? await createMockAdminReviewIfNeeded({ reportCaseId: reportCase.id })
    : null;

  return {
    reportCase,
    reportFile,
    storagePath,
    extractedDetails: null,
    missingDetails: null,
    analysisResult,
    analysisFactors: null,
    adminReview,
  };
}
