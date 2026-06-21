import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import useAuthProfile from '../lib/useAuthProfile';
import { getUserDashboardData } from '../services/caseRepository';

const fallbackDashboardData = getUserDashboardData();

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('he-IL').format(new Date(value));
}

function getStatusLabel(status) {
  const labels = {
    uploaded:      'הועלה',
    missing_details:'חסר מידע',
    analyzing:     'בניתוח',
    analyzed:      'הושלמה בדיקה',
    manual_review: 'נדרש מעבר ידני',
    closed:        'נסגר',
  };
  return labels[status] || status;
}

function mapReportCase(reportCase) {
  return {
    id:        reportCase.id,
    title:     reportCase.report_type || 'דוח תנועה',
    type:      reportCase.report_type || 'דוח תנועה',
    authority: reportCase.authority || 'לא זוהה עדיין',
    date:      formatDate(reportCase.created_at),
    amount:    null,
    status:    getStatusLabel(reportCase.status),
    chance:    reportCase.appeal_chance ?? null,
    risk:      reportCase.risk_level,
  };
}

function buildStats(cases) {
  const analyzedCases = cases.filter((c) => c.chance !== null);
  const averageChance =
    analyzedCases.length > 0
      ? Math.round(analyzedCases.reduce((sum, c) => sum + c.chance, 0) / analyzedCases.length)
      : 0;
  const waitingCases = cases.filter((c) => c.status === 'חסר מידע').length;

  return [
    { label: 'סך הכל דוחות',      value: String(cases.length),           tone: 'blue',   icon: 'folder_open' },
    { label: 'ממוצע סיכויי ערעור', value: `${averageChance}%`,            tone: 'green',  icon: 'trending_up' },
    { label: 'ממתינים להשלמה',    value: String(waitingCases),            tone: 'orange', icon: 'pending_actions' },
    { label: 'דוח חינם נוצל',     value: cases.length > 0 ? 'כן' : 'לא', tone: 'blue',   icon: 'check_circle' },
  ];
}

function UserDashboardPage() {
  const { profile } = useAuthProfile();
  const [stats, setStats]   = useState(fallbackDashboardData.stats);
  const [cases, setCases]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadUserCases() {
      if (!supabase) {
        setCases(fallbackDashboardData.cases);
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await getCurrentUser();

      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('report_cases')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (!isActive) return;

      if (error) {
        setStats(fallbackDashboardData.stats);
        setCases(fallbackDashboardData.cases);
        setLoading(false);
        return;
      }

      const mappedCases = (data ?? []).map(mapReportCase);
      setStats(buildStats(mappedCases));
      setCases(mappedCases);
      setLoading(false);
    }

    loadUserCases();
    return () => { isActive = false; };
  }, []);

  const hasCases   = cases.length > 0;
  const firstName  = profile?.full_name?.split(' ')[0] ?? null;

  return (
    <div className="auth-page-content">
      {/* Page header */}
      <div className="auth-page-header">
        <div>
          <h1>
            {firstName ? `שלום, ${firstName} 👋` : 'האזור האישי שלך'}
          </h1>
          <p>מעקב אחר דוחות שנבדקו, סטטוסים ופעולות נדרשות.</p>
        </div>
        <Link to="/upload" className="button button-primary">
          <Icon name="upload_file" />
          העלאת דוח חדש
        </Link>
      </div>

      {/* Stats row */}
      <div className="section-grid">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Cases section */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ marginBottom: 0 }}>הדוחות שלי</h2>
          {hasCases && (
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {cases.length} דוחות
            </span>
          )}
        </div>

        {loading ? (
          <div className="card loading-state">
            <div className="loader-dots">
              <span /><span /><span />
            </div>
            <p>טוען דוחות...</p>
          </div>
        ) : hasCases ? (
          <div className="cases-grid">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <div className="card empty-state">
            <div className="empty-state-icon">
              <Icon name="folder_open" />
            </div>
            <h2>עדיין לא העלית דוחות</h2>
            <p>לאחר העלאת הדוח הראשון, פרטי הניתוח יופיעו כאן.</p>
            <Link to="/upload" className="button button-primary" style={{ width: 'auto', marginTop: '0.5rem' }}>
              <Icon name="upload_file" />
              העלאת הדוח הראשון
            </Link>
          </div>
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
          ומספקת הערכה מנומקת של סיכויי הביטול. בדיקות נוספות ידרשו הרשמה ותשלום בעתיד.
        </p>
      </div>
    </div>
  );
}

export default UserDashboardPage;
