function normalizeText(value) {
  return String(value ?? '').trim().toLowerCase();
}

function recommendationSuggestsCancellation(recommendation) {
  const text = normalizeText(recommendation);
  return (
    /(?:כדאי|מומלץ|ייתכן שכדאי|לשקול|עשויות לתמוך).{0,60}(?:ביטול|בקשה|ערעור)/.test(text)
    || /(?:worth|recommended|consider).{0,60}(?:cancel|appeal|request)/.test(text)
  );
}

function recommendationSuggestsLowChance(recommendation) {
  const text = normalizeText(recommendation);
  return (
    /(?:ה?סיכוי.{0,16}נמוך|נמוך יחסית|לא כדאי|לא מומלץ|לא נמצאו.{0,30}נימוקים חזקים)/.test(text)
    || /(?:low chance|not recommended|weak case)/.test(text)
  );
}

export function isHighRiskLevel(riskLevel) {
  const risk = normalizeText(riskLevel);
  return risk === 'high' || risk.includes('גבוה');
}

export function formatRiskLevel(riskLevel) {
  const risk = normalizeText(riskLevel);
  if (!risk) return 'לא צוינה';
  if (risk === 'high' || risk.includes('גבוה')) return 'גבוהה';
  if (risk === 'medium' || risk.includes('בינונ')) return 'בינונית';
  if (risk === 'low' || risk.includes('נמוכ')) return 'נמוכה';
  return riskLevel;
}

export function selectNextStepsVariant({ appealChance, recommendation }) {
  const numericChance = Number(appealChance);
  const hasChance = Number.isFinite(numericChance);
  const suggestsLow = recommendationSuggestsLowChance(recommendation);
  const suggestsCancellation = recommendationSuggestsCancellation(recommendation);

  if ((hasChance && numericChance < 40) || suggestsLow) {
    return 'low';
  }

  if ((hasChance && numericChance >= 65) || suggestsCancellation) {
    return 'high';
  }

  return 'medium';
}
