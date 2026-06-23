import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import EmptyState from '../components/EmptyState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import RoleBadge from '../components/RoleBadge';
import StatCard from '../components/StatCard';
import { adminGetDashboardKpis } from '../lib/adminService';
import { getAdminReportCases } from '../lib/reportService';
import { mapReportCaseToCaseItem } from '../lib/statusUtils';
import useAuthProfile from '../lib/useAuthProfile';

const EMPTY_KPIS = {
  total_users: 0,
  admin_users: 0,
  regular_users: 0,
  free_reports_used: 0,
  total_reports: 0,
  uploaded_reports: 0,
  analyzed_reports: 0,
  manual_review_reports: 0,
  exceptional_reports: 0,
  average_appeal_chance: 0,
  total_payments: 0,
  paid_payments: 0,
  pending_payments: 0,
  failed_payments: 0,
  total_revenue: 0,
  monthly_revenue: 0,
  new_users_this_month: 0,
  reports_this_month: 0,
};

function formatCurrency(value) {
  return `₪${Number(value ?? 0).toLocaleString('he-IL')}`;
}

function buildKpiCards(kpis) {
  return [
    { label: 'סך משתמשים', value: String(kpis.total_users ?? 0), tone: 'blue', icon: 'group' },
    { label: 'מנהלים', value: String(kpis.admin_users ?? 0), tone: 'blue', icon: 'shield_person' },
    { label: 'משתמשים רגילים', value: String(kpis.regular_users ?? 0), tone: 'blue', icon: 'person' },
    { label: 'בדיקות חינמיות שנוצלו', value: String(kpis.free_reports_used ?? 0), tone: 'orange', icon: 'redeem' },
    { label: 'סך דוחות', value: String(kpis.total_reports ?? 0), tone: 'blue', icon: 'folder_open' },
    { label: 'דוחות שהועלו', value: String(kpis.uploaded_reports ?? 0), tone: 'orange', icon: 'upload_file' },
    { label: 'דוחות שנותחו', value: String(kpis.analyzed_reports ?? 0), tone: 'green', icon: 'task_alt' },
    { label: 'בדיקה ידנית', value: String(kpis.manual_review_reports ?? 0), tone: 'orange', icon: 'fact_check' },
    { label: 'דוחות חריגים', value: String(kpis.exceptional_reports ?? 0), tone: 'orange', icon: 'warning' },
    { label: 'ממוצע סיכויי ערעור', value: `${Number(kpis.average_appeal_chance ?? 0).toFixed(1)}%`, tone: 'blue', icon: 'analytics' },
    { label: 'סך תשלומים', value: String(kpis.total_payments ?? 0), tone: 'blue', icon: 'payments' },
    { label: 'תשלומים ששולמו', value: String(kpis.paid_payments ?? 0), tone: 'green', icon: 'check_circle' },
    { label: 'תשלומים ממתינים', value: String(kpis.pending_payments ?? 0), tone: 'orange', icon: 'hourglass_top' },
    { label: 'תשלומים שנכשלו/בוטלו', value: String(kpis.failed_payments ?? 0), tone: 'red', icon: 'cancel' },
    { label: 'הכנסה כוללת', value: formatCurrency(kpis.total_revenue), tone: 'green', icon: 'account_balance_wallet' },
    { label: 'הכנסה החודש', value: formatCurrency(kpis.monthly_revenue), tone: 'green', icon: 'trending_up' },
  ];
}

function AdminReviewPage() {
  const { role } = useAuthProfile();
  const [kpis, setKpis] = useState(EMPTY_KPIS);
  const [attentionCases, setAttentionCases] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupNotice, setSetupNotice] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadOverview() {
      setLoading(true);
      setSetupNotice('');

      const [kpiResult, casesResult] = await Promise.allSettled([
        adminGetDashboardKpis(),
        getAdminReportCases(),
      ]);

      if (!isActive) return;

      if (kpiResult.status === 'fulfilled') {
        setKpis(kpiResult.value);
      } else {
        console.error('[AdminReviewPage] failed to load dashboard KPIs:', kpiResult.reason);
        setKpis(EMPTY_KPIS);
      }

      if (casesResult.status === 'fulfilled') {
        const mapped = casesResult.value.map((reportCase) => ({
          ...mapReportCaseToCaseItem(reportCase),
          reporterLabel: reportCase.reporter?.full_name || reportCase.reporter?.email || null,
        }));
        setRecentCases(mapped.slice(0, 5));
        setAttentionCases(
          mapped.filter((c) => c.statusRaw === 'manual_review').slice(0, 5)
        );
      } else {
        console.error('[AdminReviewPage] failed to load report cases:', casesResult.reason);
        setRecentCases([]);
        setAttentionCases([]);
      }

      if (kpiResult.status === 'rejected' || casesResult.status === 'rejected') {
        setSetupNotice('חלק מנתוני הלוח לא נטענו עקב שגיאת שרת. אפשר לנסות שוב.');
      }

      setLoading(false);
    }

    loadOverview();
    return () => { isActive = false; };
  }, [reloadToken]);

  if (loading) {
    return (
      <div className="auth-page-content">
        <LoadingSpinner label="טוען לוח בקרה..." />
      </div>
    );
  }

  const kpiCards = buildKpiCards(kpis);

  return (
    <div className="auth-page-content">
      <PageHeader
        eyebrow={<RoleBadge role={role} />}
        title="לוח בקרה"
        description="סקירה כללית של פעילות המערכת — משתמשים, דוחות, הכנסות ומקרים פתוחים."
        actions={
          <Link to="/admin/reports" className="button button-primary">
            <Icon name="table_rows" />
            ניהול דוחות
          </Link>
        }
      />

      {setupNotice && (
        <div className="admin-setup-notice">
          <Icon name="info" />
          <span>{setupNotice}</span>
          <button className="button button-secondary button-sm" type="button" onClick={() => setReloadToken((t) => t + 1)}>
            <Icon name="refresh" />
            נסה שוב
          </button>
        </div>
      )}

      <div className="section-grid kpi-grid">
        {kpiCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section>
        <div className="section-title-row">
          <h2>מקרים שממתינים לבדיקה</h2>
          <Link to="/admin/reports" className="section-title-link">
            כל הדוחות
            <Icon name="arrow_back" />
          </Link>
        </div>

        {attentionCases.length > 0 ? (
          <>
            <div className="attention-banner">
              <Icon name="warning" />
              <div>
                <strong>{attentionCases.length} מקרים דורשים בדיקה ידנית</strong>
                <p>מקרים שסומנו לסטטוס manual_review.</p>
              </div>
            </div>
            <div className="card admin-list">
              {attentionCases.map((caseItem) => (
                <CaseCard key={caseItem.id} caseItem={caseItem} variant="admin-row" />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={<Icon name="check_circle" />}
            title="אין מקרים שדורשים תשומת לב"
            description="כל המקרים הפתוחים מטופלים כסדרם."
          />
        )}
      </section>

      <section>
        <div className="section-title-row">
          <h2>פעילות אחרונה</h2>
          <Link to="/admin/activity" className="section-title-link">
            יומן פעילות מלא
            <Icon name="arrow_back" />
          </Link>
        </div>

        {recentCases.length > 0 ? (
          <div className="cases-grid">
            {recentCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <EmptyState icon={<Icon name="inbox" />} title="עדיין לא הועלו דוחות במערכת" />
        )}
      </section>
    </div>
  );
}

export default AdminReviewPage;
