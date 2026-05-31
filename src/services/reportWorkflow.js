import { analysisResult, uploadedReportDetails } from '../data/mockData';

const MOCK_ANALYSIS_DELAY = 1400;
const SESSION_MISSING_DETAILS_KEY = 'ticketguard_missing_details';

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export async function analyzeUploadedReport(file) {
  await wait(MOCK_ANALYSIS_DELAY);

  const report = {
    ...uploadedReportDetails,
    fileName: file?.name || uploadedReportDetails.fileName,
  };

  return {
    report,
    analysis: analysisResult,
    hasMissingDetails: report.missingFields.length > 0,
    nextRoute: report.missingFields.length > 0 ? '/missing-details' : '/result',
  };
}

export async function saveMissingReportDetails(details) {
  sessionStorage.setItem(SESSION_MISSING_DETAILS_KEY, JSON.stringify(details));

  return {
    saved: true,
    nextRoute: '/result',
  };
}

export function getCurrentReportDetails() {
  const savedDetails = sessionStorage.getItem(SESSION_MISSING_DETAILS_KEY);

  return {
    ...uploadedReportDetails,
    userProvidedDetails: savedDetails ? JSON.parse(savedDetails) : null,
  };
}

export function getCurrentAnalysisResult() {
  return analysisResult;
}
