import { Link } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import Icon from '../components/Icon';
import ResultCard from '../components/ResultCard';
import { legalDisclaimer } from '../data/mockData';
import { getCurrentAnalysisResult } from '../services/reportWorkflow';

function AnalysisResultPage() {
  const analysisResult = getCurrentAnalysisResult();

  return (
    <section className="page container">
      <div className="page-heading">
        <AccessBadge label="מסך ציבורי לדוח ראשון - בעתיד תידרש כניסה" />
        <h1>תוצאות ניתוח הדוח</h1>
        <p>דוח מספר #7492-492-12 נותח בהצלחה על ידי המערכת החכמה שלנו.</p>
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
          <p>{legalDisclaimer}</p>
        </div>
      </section>
    </section>
  );
}

export default AnalysisResultPage;
