import { adminExceptionalCases, dashboardStats, userCases } from '../data/mockData';

const HIGH_SUCCESS_THRESHOLD = 85;
const LOW_SUCCESS_THRESHOLD = 20;
const manualReviewReasons = ['חסר מידע חשוב', 'ניתוח מסמך נכשל', 'נדרש מעבר ידני'];

export function getUserDashboardData() {
  return {
    stats: dashboardStats,
    cases: userCases,
  };
}

export function getExceptionalCasesForReview() {
  return adminExceptionalCases.filter((caseItem) => {
    const chance = caseItem.chance;
    const hasExtremeChance = chance !== null && (chance >= HIGH_SUCCESS_THRESHOLD || chance <= LOW_SUCCESS_THRESHOLD);
    const requiresManualReview = manualReviewReasons.includes(caseItem.reason);

    return hasExtremeChance || requiresManualReview;
  });
}
