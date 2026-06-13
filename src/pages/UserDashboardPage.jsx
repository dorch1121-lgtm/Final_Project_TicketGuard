import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import CaseCard from '../components/CaseCard';
import StatCard from '../components/StatCard';
import { getCurrentUser } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { getUserDashboardData } from '../services/caseRepository';

const fallbackDashboardData = getUserDashboardData();

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('he-IL').format(new Date(value));
}

function getStatusLabel(status) {
  const labels = {
    uploaded: 'הועלה',
    missing_details: 'חסר מידע',
    analyzing: 'בניתוח',
    analyzed: 'הושלמה בדיקה',
    manual_review: 'נדרש מעבר ידני',
    closed: 'נסגר',
  };

  return labels[status] || status;
}

function mapReportCase(reportCase) {
  return {
    id: reportCase.id,
    title: reportCase.report_type || 'דוח תנועה',
    type: reportCase.report_type || 'דוח תנועה',
    authority: reportCase.authority || 'לא זוהה עדיין',
    date: formatDate(reportCase.created_at),
    amount: null,
    status: getStatusLabel(reportCase.status),
    chance: reportCase.appeal_chance ?? null,
    risk: reportCase.risk_level,
  };
}

function buildStats(cases) {
  const analyzedCases = cases.filter((caseItem) => caseItem.chance !== null);
  const averageChance =
    analyzedCases.length > 0
      ? Math.round(analyzedCases.reduce((sum, caseItem) => sum + caseItem.chance, 0) / analyzedCases.length)
      : 0;
  const waitingCases = cases.filter((caseItem) => caseItem.status === 'חסר מידע').length;

  return [
    { label: 'דוחות שנבדקו', value: String(cases.length), tone: 'blue' },
    { label: 'ממוצע סיכויי ערעור', value: `${averageChance}%`, tone: 'green' },
    { label: 'ממתינים להשלמה', value: String(waitingCases), tone: 'orange' },
    { label: 'דוח חינם נוצל', value: cases.length > 0 ? 'כן' : 'לא', tone: 'red' },
  ];
}

function UserDashboardPage() {
  const [stats, setStats] = useState(fallbackDashboardData.stats);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    let isActive = true;

    async function loadUserCases() {
      if (!supabase) {
        setCases(fallbackDashboardData.cases);
        return;
      }

      const { data: userData, error: userError } = await getCurrentUser();

      if (userError || !userData?.user) {
        return;
      }

      const { data, error } = await supabase
        .from('report_cases')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        setStats(fallbackDashboardData.stats);
        setCases(fallbackDashboardData.cases);
        return;
      }

      const mappedCases = (data ?? []).map(mapReportCase);
      setStats(buildStats(mappedCases));
      setCases(mappedCases);
    }

    loadUserCases();

    return () => {
      isActive = false;
    };
  }, []);

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
