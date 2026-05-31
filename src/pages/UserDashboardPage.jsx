import { Link } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import CaseCard from '../components/CaseCard';
import StatCard from '../components/StatCard';
import { getUserDashboardData } from '../services/caseRepository';

function UserDashboardPage() {
  const { stats, cases } = getUserDashboardData();
  const hasCases = cases.length > 0;

  return (
    <section className="page container">
      <div className="dashboard-header">
        <div className="page-heading">
          <AccessBadge label="אזור משתמש" tone="user" />
          <h1>אזור אישי</h1>
          <p>מעקב אחר דוחות שנותחו, סטטוס השלמת מידע והחלטות עתידיות לגבי תשלום או ערעור.</p>
        </div>
        <Link to="/upload" className="button button-primary">
          העלאת דוח חדש
        </Link>
      </div>

      <div className="section-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {hasCases ? (
        <div className="cases-grid">
          {cases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      ) : (
        <section className="card empty-state inline-empty-state">
          <h2>עדיין לא נותחו דוחות</h2>
          <p>לאחר העלאת הדוח הראשון, התוצאה תופיע כאן.</p>
          <Link to="/upload" className="button button-primary">
            העלאת דוח לבדיקה
          </Link>
        </section>
      )}

      <section className="payment-preview">
        <strong>מודל עתידי</strong>
        <p>הדוח הראשון פתוח ללא התחברות. בדיקות נוספות ידרשו הרשמה ותשלום חד פעמי בעתיד.</p>
      </section>
    </section>
  );
}

export default UserDashboardPage;
