import CTASection from '../components/CTASection';
import FeatureCard from '../components/FeatureCard';
import HeroSection from '../components/HeroSection';
import LandingFooter from '../components/LandingFooter';
import LandingHeader from '../components/LandingHeader';
import ProcessStepCard from '../components/ProcessStepCard';
import { legalDisclaimer } from '../data/mockData';

const steps = [
  {
    icon: 'upload_file',
    title: 'מעלים דוח PDF',
    description: 'מעלים את קובץ ה-PDF של הדוח שקיבלתם, ישירות מהמחשב או מהנייד.',
  },
  {
    icon: 'analytics',
    title: 'המערכת מנתחת ומארגנת את הנתונים',
    description: 'TicketGuard מחלצת את הפרטים הרלוונטיים ומסדרת אותם לבדיקה ראשונית.',
  },
  {
    icon: 'visibility',
    title: 'עוקבים אחרי הטיפול באזור האישי',
    description: 'כל הדוחות וסטטוס הטיפול בהם מרוכזים במקום אחד, נגיש בכל זמן.',
  },
];

const benefits = [
  {
    icon: 'schedule',
    title: 'חיסכון בזמן',
    description: 'תהליך העלאה ובדיקה ראשונית מסודר, ללא צורך בריצות ובירוקרטיה.',
  },
  {
    icon: 'checklist',
    title: 'סדר ומעקב',
    description: 'כל הדוחות שלכם מרוכזים במקום אחד עם סטטוס טיפול עדכני.',
  },
  {
    icon: 'lock',
    title: 'העלאה מאובטחת',
    description: 'קבצי ה-PDF מועלים ונשמרים בצורה מאובטחת ומסודרת.',
  },
  {
    icon: 'groups',
    title: 'למשתמשים פרטיים וניהול פנימי',
    description: 'מתאים גם לשימוש אישי וגם לניהול דוחות בהיקף ארגוני.',
  },
];

const trustPoints = [
  {
    icon: 'shield_lock',
    title: 'תשתית מאובטחת',
    description: 'המערכת משתמשת בתשתית מאובטחת לאחסון ולניהול המידע.',
  },
  {
    icon: 'folder_open',
    title: 'אחסון מסודר',
    description: 'הקבצים שלכם נשמרים בצורה מסודרת ונגישה רק לבעל הדוח.',
  },
  {
    icon: 'admin_panel_settings',
    title: 'גישה מבוקרת',
    description: 'הגישה לדוחות מוגבלת לפי הרשאות המשתמש במערכת.',
  },
];

function LandingPage() {
  return (
    <div className="landing-page">
      <LandingHeader />

      <main>
        <HeroSection />

        {/* ── How it works ── */}
        <section className="stitch-section container">
          <div className="section-heading">
            <h2>איך זה עובד?</h2>
            <p>תהליך פשוט ושקוף — מהעלאה ועד מעקב, בשלושה שלבים.</p>
          </div>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <ProcessStepCard
                key={step.title}
                number={i + 1}
                icon={step.icon}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="benefits-section">
          <div className="container">
            <div className="section-heading">
              <h2>למה TicketGuard?</h2>
              <p>הכלי הדיגיטלי לניהול ומעקב דוחות תנועה במקום אחד.</p>
            </div>
            <div className="benefits-grid benefits-grid-4">
              {benefits.map((b) => (
                <FeatureCard key={b.title} icon={b.icon} title={b.title} description={b.description} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust / Security ── */}
        <section className="trust-section">
          <div className="container">
            <div className="section-heading">
              <h2>אבטחה ופרטיות</h2>
              <p>ניהול דוחות רגיש דורש תשתית רגישה — כך אנחנו דואגים לזה.</p>
            </div>
            <div className="benefits-grid">
              {trustPoints.map((t) => (
                <FeatureCard key={t.title} icon={t.icon} title={t.title} description={t.description} tone="trust" />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <CTASection
          title="רוצה לבדוק את הדוח שלך?"
          description="העלה את הדוח וקבל תהליך מסודר וברור באזור האישי."
          primary={{ to: '/upload', label: 'התחלת בדיקה', icon: 'upload_file' }}
          secondary={{ to: '/login', label: 'כניסה למערכת', icon: 'login' }}
        />

        {/* ── Legal disclaimer ── */}
        <section className="container stitch-section">
          <div className="disclaimer-band">
            <strong>הבהרה משפטית</strong>
            <p style={{ marginBottom: 0 }}>{legalDisclaimer}</p>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

export default LandingPage;
