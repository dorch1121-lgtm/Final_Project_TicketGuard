import { Link } from 'react-router-dom';
import Icon from '../components/Icon';
import { legalDisclaimer } from '../data/mockData';

const steps = [
  {
    icon: 'upload_file',
    title: 'מעלים את הדוח',
    description: 'מעלים קובץ PDF של דוח התנועה שקיבלתם. המערכת תחלץ את הנתונים הרלוונטיים באופן אוטומטי.',
  },
  {
    icon: 'analytics',
    title: 'ניתוח חכם',
    description: 'מנוע הניתוח שלנו בוחן את הפרמטרים המשפטיים ומשווה לפסיקות קודמות כדי להעריך את סיכויי ההצלחה.',
  },
  {
    icon: 'gavel',
    title: 'קבלת תשובה',
    description: 'מקבלים דוח מפורט עם אחוזי הצלחה צפויים והמלצה ברורה האם להגיש ערעור או לשלם.',
  },
];

const benefits = [
  {
    icon: 'shield_check',
    title: 'ניתוח אמין',
    description: 'הערכת סיכויים מבוססת על נתונים משפטיים ופסיקות קודמות.',
  },
  {
    icon: 'speed',
    title: 'תשובה מהירה',
    description: 'קבלו הערכה תוך שניות, ללא המתנה לעורך דין.',
  },
  {
    icon: 'lock',
    title: 'מאובטח לחלוטין',
    description: 'המסמכים שלכם שמורים בסביבה מאובטחת עם הצפנה מלאה.',
  },
];

function LandingPage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="container hero-content">
          <span className="eyebrow">
            <Icon name="security" />
            TicketGuard — מנוע ניתוח דוחות תנועה
          </span>
          <h1>האם כדאי להגיש<br />ערעור על הדוח?</h1>
          <p>
            קבלו הערכה חכמה ומהירה של סיכויי הביטול לפני שאתם מחליטים לשלם או לערער.
            המערכת מנתחת את הדוח שלכם ומספקת המלצה ברורה ומנומקת.
          </p>
          <div className="hero-actions">
            <Link to="/upload" className="button button-primary">
              <Icon name="upload_file" />
              בדיקת דוח חינם
            </Link>
            <Link to="/login" className="button button-secondary">
              <Icon name="account_circle" />
              כניסה לאזור האישי
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="stitch-section container">
        <div className="section-heading">
          <h2>איך זה עובד?</h2>
          <p>תהליך פשוט ושקוף — מהעלאה ועד תשובה ב-3 שלבים.</p>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <article className="step-card card" key={step.title}>
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">
                <Icon name={step.icon} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-heading">
            <h2>למה TicketGuard?</h2>
            <p>הכלי הדיגיטלי החכם לניהול דוחות תנועה.</p>
          </div>
          <div className="benefits-grid">
            {benefits.map((b) => (
              <div className="benefit-card" key={b.title}>
                <div className="benefit-icon">
                  <Icon name={b.icon} />
                </div>
                <div>
                  <h3>{b.title}</h3>
                  <p>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <h2>מוכנים לבדוק את הדוח שלכם?</h2>
          <p>הדוח הראשון חינם — ללא הרשמה, ללא חיוב. פשוט העלו ותקבלו תשובה.</p>
          <div className="hero-actions">
            <Link to="/upload" className="button button-white">
              <Icon name="upload_file" />
              התחילו עכשיו — חינם
            </Link>
            <Link to="/login" className="button button-outline-white">
              <Icon name="login" />
              כניסה לחשבון
            </Link>
          </div>
        </div>
      </section>

      {/* ── Legal disclaimer ── */}
      <section className="container stitch-section">
        <div className="disclaimer-band">
          <strong>הבהרה משפטית</strong>
          <p style={{ marginBottom: 0 }}>{legalDisclaimer}</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
