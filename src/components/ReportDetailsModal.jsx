import { useEffect, useState } from 'react';
import AppealGuidance from './AppealGuidance';
import ErrorState from './ErrorState';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';
import ResultCard from './ResultCard';
import StatusBadge from './StatusBadge';
import { getReportCaseDetails } from '../lib/reportService';
import { formatDate } from '../lib/statusUtils';

function ReportDetailsModal({ reportCaseId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setErrorMessage('');
      try {
        const result = await getReportCaseDetails(reportCaseId);
        if (!isActive) return;
        if (!result) {
          setErrorMessage('הדוח לא נמצא.');
        } else {
          setDetails(result);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('[ReportDetailsModal] failed to load report details:', error);
        setErrorMessage('לא ניתן היה לטעון את פרטי הדוח כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => { isActive = false; };
  }, [reportCaseId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card report-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn icon-button" type="button" onClick={onClose} aria-label="סגור">
          <Icon name="close" />
        </button>

        {loading ? (
          <LoadingSpinner label="טוען פרטי דוח..." />
        ) : errorMessage ? (
          <ErrorState description={errorMessage} />
        ) : (
          <ReportDetailsModalContent details={details} />
        )}
      </div>
    </div>
  );
}

function ReportDetailsModalContent({ details }) {
  const { reportCase, analysisResult, analysisFactors, adminReview, extractedDetails, files } = details;

  const strongPoints = analysisFactors
    .filter((f) => f.factor_type === 'strong_point')
    .map((f) => `${f.title}: ${f.description}`);
  const weakPoints = analysisFactors
    .filter((f) => f.factor_type === 'weak_point')
    .map((f) => `${f.title}: ${f.description}`);
  const missingInfo = analysisFactors.filter((f) => f.factor_type === 'missing_info');

  return (
    <div className="report-details-modal-content">
      <div className="modal-header-row">
        <div>
          <span className="eyebrow">דוח #{reportCase.id?.slice(0, 8)}</span>
          <h2>{reportCase.report_type || 'דוח תנועה'}</h2>
          <p>
            {reportCase.authority || 'לא זוהה עדיין'} · נפתח בתאריך {formatDate(reportCase.created_at)}
            {' '}· עודכן בתאריך {formatDate(reportCase.updated_at)}
          </p>
        </div>
        <StatusBadge status={reportCase.status} />
      </div>

      <div className="report-details-modal-meta">
        <div>
          <span>סיכויי ערעור</span>
          <strong>{reportCase.appeal_chance == null ? '—' : `${reportCase.appeal_chance}%`}</strong>
        </div>
        <div>
          <span>רמת סיכון</span>
          <strong>{reportCase.risk_level || '—'}</strong>
        </div>
        <div>
          <span>דוח חריג</span>
          <strong>{reportCase.is_exceptional ? 'כן' : 'לא'}</strong>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-row">
          <Icon name="picture_as_pdf" />
          {files[0].file_name}
        </div>
      )}

      {analysisResult && (
        <article className="result-hero card">
          <div>
            <h3>סיכוי לביטול הדוח</h3>
            <p>{analysisResult.explanation}</p>
          </div>
          <div className="score-circle">{Math.round(analysisResult.chance_percentage ?? 0)}%</div>
        </article>
      )}

      {(strongPoints.length > 0 || weakPoints.length > 0) && (
        <div className="result-grid">
          {strongPoints.length > 0 && <ResultCard title="נקודות חוזק" items={strongPoints} tone="positive" />}
          {weakPoints.length > 0 && <ResultCard title="נקודות חולשה" items={weakPoints} tone="risk" />}
        </div>
      )}

      {missingInfo.length > 0 && (
        <div className="card info-card">
          <h3>מידע חסר</h3>
          <ul className="check-list">
            {missingInfo.map((f) => (
              <li key={f.id}>{f.description || f.title}</li>
            ))}
          </ul>
        </div>
      )}

      {extractedDetails && (
        <div className="card sidebar-card">
          <h3>פרטים שחולצו</h3>
          <dl className="details-list">
            {extractedDetails.violation_date && (
              <div><dt>תאריך עבירה</dt><dd>{extractedDetails.violation_date}</dd></div>
            )}
            {extractedDetails.location && (
              <div><dt>מיקום</dt><dd>{extractedDetails.location}</dd></div>
            )}
            {extractedDetails.fine_amount ? (
              <div><dt>סכום הקנס</dt><dd>{extractedDetails.fine_amount} ש"ח</dd></div>
            ) : null}
          </dl>
        </div>
      )}

      {adminReview?.admin_notes && (
        <div className="card info-card">
          <h3>הערות בדיקה ידנית</h3>
          <p>{adminReview.admin_notes}</p>
        </div>
      )}

      {analysisResult && <AppealGuidance />}
    </div>
  );
}

export default ReportDetailsModal;
