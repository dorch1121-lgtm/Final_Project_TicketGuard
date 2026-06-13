import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import Icon from '../components/Icon';
import ResultCard from '../components/ResultCard';
import { legalDisclaimer } from '../data/mockData';
import { latestReportStorageKeys } from '../lib/reportService';
import { supabase } from '../lib/supabase';
import { getCurrentAnalysisResult } from '../services/reportWorkflow';

function mapAnalysisResult(analysisResult, analysisFactors) {
  const fallback = getCurrentAnalysisResult();
  const strongPoints = analysisFactors
    .filter((factor) => factor.factor_type === 'strong_point')
    .map((factor) => `${factor.title}: ${factor.description}`);
  const weakPoints = analysisFactors
    .filter((factor) => factor.factor_type === 'weak_point')
    .map((factor) => `${factor.title}: ${factor.description}`);
  const missingInfo = analysisFactors
    .filter((factor) => factor.factor_type === 'missing_info')
    .map((factor) => factor.description || factor.title);

  return {
    chance: Math.round(analysisResult.chance_percentage ?? fallback.chance),
    riskLevel: analysisResult.risk_level ?? fallback.riskLevel,
    summary: analysisResult.explanation || fallback.summary,
    strongPoints: strongPoints.length > 0 ? strongPoints : fallback.strongPoints,
    weakPoints: weakPoints.length > 0 ? weakPoints : fallback.weakPoints,
    missingInfo: missingInfo.length > 0 ? missingInfo : fallback.missingInfo,
    recommendation: analysisResult.recommendation || fallback.recommendation,
    legalDisclaimer: analysisResult.legal_disclaimer || legalDisclaimer,
  };
}

function AnalysisResultPage() {
  const [analysisResult, setAnalysisResult] = useState(getCurrentAnalysisResult());

  useEffect(() => {
    let isActive = true;

    async function loadLatestAnalysis() {
      if (!supabase) {
        return;
      }

      const latestAnalysisResultId = localStorage.getItem(latestReportStorageKeys.analysisResultId);
      const latestReportCaseId = localStorage.getItem(latestReportStorageKeys.reportCaseId);

      if (!latestAnalysisResultId && !latestReportCaseId) {
        return;
      }

      let query = supabase.from('analysis_results').select('*');

      query = latestAnalysisResultId
        ? query.eq('id', latestAnalysisResultId)
        : query.eq('report_case_id', latestReportCaseId);

      const { data: resultData, error: resultError } = await query.maybeSingle();

      if (resultError || !resultData) {
        return;
      }

      const { data: factorsData, error: factorsError } = await supabase
        .from('analysis_factors')
        .select('*')
        .eq('analysis_result_id', resultData.id);

      if (factorsError) {
        return;
      }

      if (isActive) {
        setAnalysisResult(mapAnalysisResult(resultData, factorsData ?? []));
      }
    }

    loadLatestAnalysis();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="page container">
      <div className="page-heading">
        <AccessBadge label="מסך ציבורי לדוח ראשון - בעתיד תידרש כניסה" />
        <h1>תוצאות ניתוח הדוח</h1>
        <p>הדוח נותח בהצלחה באמצעות נתוני דמו שנשמרו במערכת.</p>
      </div>

      <div className="result-page-grid">
        <div className="result-main">
          <article className="result-hero card">
            <div>
              <h2>סיכוי לביטול הדוח</h2>
              <p>{analysisResult.summary}</p>
              <div className="disclaimer-band">
                <Icon name="check_circle" />
                <strong>מומלץ לשקול הגשת ערעור מנומק לאחר השלמת המידע החסר.</strong>
              </div>
            </div>
            <div className="score-circle">{analysisResult.chance}%</div>
          </article>

          <div className="result-grid">
            <ResultCard title="נקודות חוזק בתיק" items={analysisResult.strongPoints} tone="positive" />
            <ResultCard title="נקודות חולשה" items={analysisResult.weakPoints} tone="risk" />
          </div>
        </div>

        <aside className="result-sidebar">
          <section className="sidebar-card card">
            <div className="result-card-title">
              <span className="result-icon">
                <Icon name="help_center" />
              </span>
              <h3>מידע חסר</h3>
            </div>
            <p>השלמת הפרטים הבאים עשויה לשפר את איכות ההערכה.</p>
            <div>
              {analysisResult.missingInfo.slice(0, 2).map((item) => (
                <div className="missing-item" key={item}>
                  <span>{item}</span>
                  <button type="button">העלה קובץ</button>
                </div>
              ))}
            </div>
          </section>

          <section className="sidebar-card card">
            <Link to="/dashboard" className="button button-primary">
              <Icon name="gavel" />
              שמירה באזור האישי
            </Link>
            <Link to="/upload" className="button button-secondary">
              <Icon name="add_circle" />
              ניתוח דוח נוסף
            </Link>
            <Link to="/dashboard" className="button button-ghost">
              חזרה לאזור האישי
            </Link>
          </section>
        </aside>
      </div>

      <section className="recommendation card">
        <h2>המלצה כללית</h2>
        <p>{analysisResult.recommendation}</p>
        <div className="legal-box">
          <strong>הבהרה משפטית</strong>
          <p>{analysisResult.legalDisclaimer || legalDisclaimer}</p>
        </div>
      </section>
    </section>
  );
}

export default AnalysisResultPage;
