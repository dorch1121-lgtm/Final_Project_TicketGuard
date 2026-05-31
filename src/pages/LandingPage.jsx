import { Link } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import Icon from '../components/Icon';
import { legalDisclaimer } from '../data/mockData';

const steps = [
  {
    icon: 'article',
    title: '1. מעלים',
    description: 'צלמו או העלו קובץ של דוח התנועה שקיבלתם. המערכת שלנו תחלץ את הנתונים באופן אוטומטי.',
  },
  {
    icon: 'analytics',
    title: '2. מנתחים',
    description: 'מנוע ה-AI שלנו, המבוסס על פסיקות קודמות, מנתח את סיבות המקרה ומעריך את סיכויי ההצלחה.',
  },
  {
    icon: 'gavel',
    title: '3. מקבלים תשובה',
    description: 'קבלו דוח מפורט עם אחוזי הצלחה צפויים והמלצה ברורה האם כדאי להגיש ערעור או לשלם.',
  },
];

function LandingPage() {
  return (
    <section className="landing-page">
      <div className="hero-section">
        <div className="container hero-content">
          <AccessBadge label="מסך ציבורי" />
          <h1>האם כדאי להגיש ערעור על דוח התנועה?</h1>
          <p>
            TicketGuard מנתחת את הסיכויים שלך לביטול הדוח באמצעות בינה מלאכותית ומומחיות
            משפטית. קבלו הערכה מהירה ומדויקת לפני שאתם מחליטים לשלם או לערער.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="button button-primary">
              <Icon name="upload_file" />
              העלאת דוח לבדיקה
            </Link>
            <Link to="/dashboard" className="button button-secondary">
              <Icon name="dashboard" />
              צפייה באזור האישי
            </Link>
          </div>
        </div>
      </div>

      <section className="container stitch-section">
        <div className="section-heading">
          <h2>איך זה עובד?</h2>
          <p>תהליך פשוט, מהיר ושקוף ב-3 שלבים.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step) => (
            <article className="step-card card" key={step.title}>
              <span className="step-icon">
                <Icon name={step.icon} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="disclaimer-band">
          <strong>הבהרה משפטית</strong>
          <p>{legalDisclaimer}</p>
        </div>
      </section>
    </section>
  );
}

export default LandingPage;
