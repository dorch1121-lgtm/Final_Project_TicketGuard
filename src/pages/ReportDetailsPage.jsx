import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppealGuidance from '../components/AppealGuidance';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import ResultCard from '../components/ResultCard';
import StatusBadge from '../components/StatusBadge';
import { getReportCaseDetails } from '../lib/reportService';
import { buildStatusTimeline, formatDate } from '../lib/statusUtils';
import useAuthProfile from '../lib/useAuthProfile';

function ReportDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthProfile();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadDetails() {
      setLoading(true);
      setErrorMessage('');
      setNotFound(false);

      try {
        const result = await getReportCaseDetails(id);
        if (!isActive) return;

        if (!result) {
          setNotFound(true);
        } else {
          setDetails(result);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('[ReportDetailsPage] failed to load report details:', error);
        setErrorMessage('לא ניתן היה לטעון את פרטי הדוח כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadDetails();
    return () => { isActive = false; };
  }, [id]);

  const backRoute = isAdmin ? '/admin/reports' : '/reports';

  if (loading) {
    return (
      <div className="auth-page-content">
        <LoadingSpinner label="טוען פרטי דוח..." />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="auth-page-content">
        <ErrorState
          title="הדוח לא נמצא"
          description="ייתכן שאין לך הרשאה לצפות בדוח זה, או שהקישור שגוי."
        />
        <Link to={backRoute} className="button button-secondary back-link">
          <Icon name="arrow_forward" />
          חזרה
        </Link>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="auth-page-content">
        <ErrorState description={errorMessage} onRetry={() => navigate(0)} />
      </div>
    );
  }

  const { reportCase, analysisResult, analysisFactors, adminReview, extractedDetails, files } = details;
  const timeline = buildStatusTimeline(reportCase.status);

  const strongPoints = analysisFactors
    .filter((f) => f.factor_type === 'strong_point')
    .map((f) => `${f.title}: ${f.description}`);
  const weakPoints = analysisFactors
    .filter((f) => f.factor_type === 'weak_point')
    .map((f) => `${f.title}: ${f.description}`);
  const missingInfo = analysisFactors.filter((f) => f.factor_type === 'missing_info');

  return (
    <div className="auth-page-content">
      <Link to={backRoute} className="section-title-link back-link">
        <Icon name="arrow_forward" />
        חזרה
      </Link>

      <div className="auth-page-header">
        <div>
          <span className="eyebrow">דוח #{reportCase.id?.slice(0, 8)}</span>
          <h1>{reportCase.report_type || 'דוח תנועה'}</h1>
          <p>
            {reportCase.authority || 'לא זוהה עדיין'} · נפתח בתאריך {formatDate(reportCase.created_at)}
          </p>
        </div>
        <StatusBadge status={reportCase.status} />
      </div>

      <div className="result-page-grid">
        <div className="result-main">
          {/* Status timeline */}
          <article className="card timeline-card">
            <h2>מעקב סטטוס</h2>
            <div className="status-timeline">
              {timeline.map((step, index) => (
                <div
                  key={step.key}
                  className={`status-timeline-step${step.state === 'complete' ? ' is-complete' : ''}${step.state === 'current' ? ' is-current' : ''}`}
                >
                  <div className="status-timeline-marker">
                    <div className="status-timeline-dot">
                      <Icon name={step.state === 'complete' ? 'check' : 'circle'} />
                    </div>
                    {index < timeline.length - 1 && <div className="status-timeline-line" />}
                  </div>
                  <div className="status-timeline-content">
                    <h4>{step.label}</h4>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Analysis result */}
          {analysisResult ? (
            <article className="result-hero card">
              <div>
                <h2>סיכוי לביטול הדוח</h2>
                <p>{analysisResult.explanation}</p>
              </div>
              <div className="score-circle">{Math.round(analysisResult.chance_percentage ?? 0)}%</div>
            </article>
          ) : null}

          {(strongPoints.length > 0 || weakPoints.length > 0) && (
            <div className="result-grid">
              {strongPoints.length > 0 && (
                <ResultCard title="נקודות חוזק בתיק" items={strongPoints} tone="positive" />
              )}
              {weakPoints.length > 0 && (
                <ResultCard title="נקודות חולשה" items={weakPoints} tone="risk" />
              )}
            </div>
          )}

          {/* Admin notes — only rendered if a review record exists */}
          {adminReview?.admin_notes && (
            <article className="card info-card">
              <h3>
                <Icon name="admin_panel_settings" style={{ fontSize: '1rem', marginInlineEnd: '0.4rem', verticalAlign: 'middle' }} />
                הערות הצוות המקצועי
              </h3>
              <p>{adminReview.admin_notes}</p>
            </article>
          )}

          {analysisResult && <AppealGuidance />}
        </div>

        <aside className="result-sidebar">
          <section className="sidebar-card card">
            <h3>פרטי הדוח</h3>
            <dl className="details-list">
              <div>
                <dt>סוג דוח</dt>
                <dd>{reportCase.report_type || 'לא זוהה'}</dd>
              </div>
              <div>
                <dt>רשות</dt>
                <dd>{reportCase.authority || 'לא זוהה'}</dd>
              </div>
              {extractedDetails?.violation_date && (
                <div>
                  <dt>תאריך עבירה</dt>
                  <dd>{extractedDetails.violation_date}</dd>
                </div>
              )}
              {extractedDetails?.location && (
                <div>
                  <dt>מיקום</dt>
                  <dd>{extractedDetails.location}</dd>
                </div>
              )}
              {extractedDetails?.fine_amount ? (
                <div>
                  <dt>סכום הקנס</dt>
                  <dd>{extractedDetails.fine_amount} ש"ח</dd>
                </div>
              ) : null}
            </dl>
          </section>

          {files.length > 0 && (
            <section className="sidebar-card card">
              <h3>קובץ הדוח</h3>
              {files.map((file) => (
                <div className="file-row" key={file.id}>
                  <Icon name="picture_as_pdf" />
                  {file.file_name}
                </div>
              ))}
            </section>
          )}

          {missingInfo.length > 0 && (
            <section className="sidebar-card card">
              <div className="result-card-title">
                <span className="result-icon">
                  <Icon name="help_center" />
                </span>
                <h3>מידע חסר</h3>
              </div>
              <p>השלמת הפרטים הבאים עשויה לשפר את איכות ההערכה.</p>
              <ul className="check-list">
                {missingInfo.map((f) => (
                  <li key={f.id}>{f.description || f.title}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="sidebar-card card">
            <Link to="/upload" className="button button-secondary">
              <Icon name="add_circle" />
              בדיקת דוח נוסף
            </Link>
            <Link to={backRoute} className="button button-ghost">
              חזרה לרשימת הדוחות
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ReportDetailsPage;
