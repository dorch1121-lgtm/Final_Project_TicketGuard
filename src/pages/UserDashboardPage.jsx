import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import FreeReportNotice from '../components/FreeReportNotice';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { getCurrentUser } from '../lib/auth';
import { getMyAccessStatus } from '../lib/reportAccess';
import { getUserReportCases } from '../lib/reportService';
import { buildReportStats, mapReportCaseToCaseItem } from '../lib/statusUtils';
import useAuthProfile from '../lib/useAuthProfile';

function buildStatCards(reportStats) {
  return [
    { label: 'סך הכל דוחות', value: String(reportStats.total), tone: 'blue', icon: 'folder_open' },
    { label: 'ממתינים לטיפול', value: String(reportStats.waiting), tone: 'orange', icon: 'pending_actions' },
    { label: 'בטיפול', value: String(reportStats.inProgress), tone: 'blue', icon: 'hourglass_top' },
    { label: 'הושלמו', value: String(reportStats.done), tone: 'green', icon: 'task_alt' },
    { label: 'נדחו', value: String(reportStats.rejected), tone: 'red', icon: 'cancel' },
  ];
}

function UserDashboardPage() {
  const { profile } = useAuthProfile();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [freeReportUsed, setFreeReportUsed] = useState(null);

  useEffect(() => {
    let isActive = true;

    async function loadUserCases() {
      setLoading(true);
      setErrorMessage('');

      const { data: userData, error: userError } = await getCurrentUser();

      if (!isActive) return;

      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserReportCases(userData.user.id);
        if (!isActive) return;
        setCases(data.map(mapReportCaseToCaseItem));
      } catch (error) {
        if (!isActive) return;
        console.error('[UserDashboardPage] failed to load user report cases:', error);
        setErrorMessage('לא ניתן היה לטעון את הדוחות שלך כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }

      // Free-report status is shown separately so that this brand new
      // check can never break the existing report list above if it fails.
      try {
        const access = await getMyAccessStatus();
        if (!isActive) return;
        setFreeReportUsed(access.freeReportUsed);
      } catch (error) {
        console.error('[UserDashboardPage] failed to load free-report access status:', error);
        // Notice simply stays hidden/default — never blocks the dashboard.
      }
    }

    loadUserCases();
    return () => { isActive = false; };
  }, []);

  const hasCases = cases.length > 0;
  const firstName = profile?.full_name?.split(' ')[0] ?? null;
  const stats = buildStatCards(buildReportStats(cases));
  const recentCases = cases.slice(0, 4);

  return (
    <div className="auth-page-content">
      <PageHeader
        title={firstName ? `שלום, ${firstName} 👋` : 'האזור האישי שלך'}
        description="נהל את הדוחות שלך במקום אחד — מעקב אחר סטטוסים ופעולות נדרשות."
        actions={
          <>
            <Link to="/upload" className="button button-primary">
              <Icon name="upload_file" />
              העלאת דוח חדש
            </Link>
            <Link to="/reports" className="button button-secondary">
              <Icon name="folder_open" />
              הדוחות שלי
            </Link>
          </>
        }
      />

      {freeReportUsed !== null && <FreeReportNotice freeReportUsed={freeReportUsed} />}

      {/* Stats row */}
      <div className="section-grid stats-grid-5">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent cases section */}
      <section>
        <div className="section-title-row">
          <h2>הדוחות האחרונים שלך</h2>
          {hasCases && (
            <Link to="/reports" className="section-title-link">
              לכל הדוחות
              <Icon name="arrow_back" />
            </Link>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="טוען דוחות..." />
        ) : errorMessage ? (
          <ErrorState description={errorMessage} />
        ) : hasCases ? (
          <div className="cases-grid">
            {recentCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Icon name="folder_open" />}
            title="עדיין לא העלית דוחות"
            description="לאחר העלאת הדוח הראשון, פרטי הניתוח יופיעו כאן."
            action={
              <Link to="/upload" className="button button-primary">
                <Icon name="upload_file" />
                העלה דוח ראשון
              </Link>
            }
          />
        )}
      </section>

      {/* Info card */}
      <div className="info-card">
        <h3>
          <Icon name="info" style={{ fontSize: '1rem', marginInlineEnd: '0.4rem', verticalAlign: 'middle' }} />
          כיצד המערכת עובדת?
        </h3>
        <p>
          הדוח הראשון פתוח ללא עלות. המערכת מנתחת את הדוח שלך, מחלצת נתונים רלוונטיים
          ומספקת הערכה מנומקת של סיכויי הביטול. בדיקות נוספות עולות ₪30 לבדיקה.
        </p>
      </div>
    </div>
  );
}

export default UserDashboardPage;
