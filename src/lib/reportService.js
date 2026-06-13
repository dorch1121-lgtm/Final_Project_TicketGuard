import { legalDisclaimer } from '../data/mockData';
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
  if (error) {
    throw new Error(error.message || reportUploadErrors.uploadFailed);
  }
}

async function tryCreateMockRecord(createRecord) {
  try {
    return await createRecord();
  } catch (error) {
    console.warn('Mock report data was not fully saved to Supabase:', error);
    return null;
  }
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
      status: 'analyzed',
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
    .insert({
      report_case_id: reportCaseId,
      file_name: file.name,
      file_url: storagePath,
      file_type: file.type,
      file_size: file.size,
      upload_status: 'uploaded',
    })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createMockExtractedDetails({ reportCaseId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('extracted_report_details')
    .insert({
      report_case_id: reportCaseId,
      report_number: 'MOCK-7492-492-12',
      violation_date: '2026-04-14',
      violation_time: '09:20',
      location: 'רחוב המסגר 12, תל אביב',
      vehicle_number: '123-45-678',
      fine_amount: 500,
      points: 0,
      violation_description: 'דוח תנועה לדוגמה שנוצר במסגרת ניתוח מדומה',
      raw_extracted_text: 'תוכן מדומה בלבד. לא בוצע OCR אמיתי בשלב זה.',
      confidence_score: 0.82,
    })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createMockMissingDetails({ reportCaseId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('missing_details')
    .insert([
      {
        report_case_id: reportCaseId,
        field_name: 'full_report_number',
        question_text: 'מהו מספר הדוח המלא כפי שמופיע במסמך?',
        is_required: true,
        status: 'open',
      },
      {
        report_case_id: reportCaseId,
        field_name: 'original_photo',
        question_text: 'האם יש ברשותך צילום מקורי באיכות גבוהה?',
        is_required: false,
        status: 'open',
      },
    ])
    .select();

  throwSupabaseError(error);

  return data;
}

export async function createMockAnalysisResult({ reportCaseId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('analysis_results')
    .insert({
      report_case_id: reportCaseId,
      chance_percentage: 68,
      risk_level: 'medium',
      explanation:
        'זהו ניתוח מדומה בלבד. נמצאו נקודות שעשויות לתמוך בבקשת ביטול או הפחתת קנס, אך לא בוצע OCR או AI אמיתי.',
      recommendation:
        'מומלץ להשלים את הפרטים החסרים ולשקול פנייה מנומקת לרשות, תוך בדיקה עצמאית של פרטי הדוח.',
      legal_disclaimer: legalDisclaimer,
    })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createMockAnalysisFactors({ analysisResultId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('analysis_factors')
    .insert([
      {
        analysis_result_id: analysisResultId,
        factor_type: 'strong_point',
        title: 'פער אפשרי בפרטי המיקום',
        description: 'כתובת העבירה דורשת בדיקה נוספת מול פרטי הדוח והצילום.',
        impact_score: 18,
      },
      {
        analysis_result_id: analysisResultId,
        factor_type: 'strong_point',
        title: 'חסר תיעוד משלים',
        description: 'ייתכן שקיים צורך בתיעוד מקורי ברור יותר כדי לחזק את הדוח.',
        impact_score: 12,
      },
      {
        analysis_result_id: analysisResultId,
        factor_type: 'weak_point',
        title: 'פרטי רכב ברורים',
        description: 'מספר הרכב מופיע בצורה ברורה ולכן נקודה זו מחזקת את עמדת הרשות.',
        impact_score: -10,
      },
      {
        analysis_result_id: analysisResultId,
        factor_type: 'missing_info',
        title: 'מספר דוח מלא',
        description: 'נדרש מספר הדוח המלא לצורך בדיקה מדויקת יותר.',
        impact_score: 0,
      },
    ])
    .select();

  throwSupabaseError(error);

  return data;
}

export async function createMockAdminReviewIfNeeded({ reportCaseId, userId }) {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from('admin_reviews')
    .insert({
      report_case_id: reportCaseId,
      reason: 'ניתוח מדומה סומן כחריג ודורש בדיקה ידנית',
      priority: 'medium',
      status: 'pending',
      admin_notes: 'רשומת בדיקה ידנית נוצרה מנתוני דמו. לא בוצע AI/OCR אמיתי.',
      reviewed_by: userId,
    })
    .select()
    .single();

  throwSupabaseError(error);

  return data;
}

export async function createFullMockReportAnalysis({ userId, file }) {
  validatePdfFile(file);

  const reportCase = await createReportCase({ userId });
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
  const extractedDetails = await tryCreateMockRecord(() =>
    createMockExtractedDetails({ reportCaseId: reportCase.id })
  );
  const missingDetails = await tryCreateMockRecord(() =>
    createMockMissingDetails({ reportCaseId: reportCase.id })
  );
  const analysisResult = await tryCreateMockRecord(() =>
    createMockAnalysisResult({ reportCaseId: reportCase.id })
  );
  const analysisFactors = analysisResult?.id
    ? await tryCreateMockRecord(() => createMockAnalysisFactors({ analysisResultId: analysisResult.id }))
    : null;
  const adminReview = reportCase.is_exceptional
    ? await tryCreateMockRecord(() => createMockAdminReviewIfNeeded({ reportCaseId: reportCase.id, userId }))
    : null;

  return {
    reportCase,
    reportFile,
    storagePath,
    extractedDetails,
    missingDetails,
    analysisResult,
    analysisFactors,
    adminReview,
  };
}
