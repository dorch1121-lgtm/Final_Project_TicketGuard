import { Link } from 'react-router-dom';
import Icon from './Icon';

const trustItems = [
  { icon: 'lock', label: 'העלאת PDF מאובטחת' },
  { icon: 'sync', label: 'מעקב סטטוס בזמן אמת' },
  { icon: 'folder_open', label: 'ניהול דוחות במקום אחד' },
];

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <Icon name="security" />
            TicketGuard — ניהול דוחות תנועה
          </span>
          <h1>בדיקת דוחות תנועה בצורה חכמה, מהירה ומאובטחת</h1>
          <p>
            מעלים את דוח התנועה כקובץ PDF, מקבלים בדיקה ראשונית מסודרת, ועוקבים אחרי
            התקדמות הטיפול בדוח מתוך האזור האישי שלכם — בכל זמן ובכל מקום.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="button button-primary">
              <Icon name="upload_file" />
              התחלת בדיקה
            </Link>
            <Link to="/login" className="button button-secondary">
              <Icon name="login" />
              כניסה למערכת
            </Link>
          </div>
          <ul className="trust-indicators">
            {trustItems.map((item) => (
              <li key={item.label}>
                <Icon name={item.icon} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-preview" aria-hidden="true">
          <div className="preview-card card">
            <div className="preview-card-header">
              <span className="preview-dot" />
              <span className="preview-dot" />
              <span className="preview-dot" />
            </div>
            <div className="preview-row">
              <div className="preview-row-icon">
                <Icon name="upload_file" />
              </div>
              <div>
                <strong>דוח-תנועה.pdf</strong>
                <span>הועלה בהצלחה</span>
              </div>
            </div>
            <div className="preview-row">
              <div className="preview-row-icon preview-row-icon-warning">
                <Icon name="hourglass_top" />
              </div>
              <div>
                <strong>סטטוס בדיקה</strong>
                <span className="status-badge status-pending">ממתין לבדיקה</span>
              </div>
            </div>
            <div className="preview-row">
              <div className="preview-row-icon preview-row-icon-success">
                <Icon name="lock" />
              </div>
              <div>
                <strong>אחסון מאובטח</strong>
                <span>הקובץ נשמר בצורה מסודרת</span>
              </div>
            </div>
            <div className="preview-row">
              <div className="preview-row-icon">
                <Icon name="dashboard" />
              </div>
              <div>
                <strong>אזור אישי</strong>
                <span>מעקב בזמן אמת אחרי כל הדוחות</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
