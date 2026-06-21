import { useEffect, useState } from 'react';
import CaseCard from '../components/CaseCard';
import Icon from '../components/Icon';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';
import { getExceptionalCasesForReview } from '../services/caseRepository';

function mapAdminReview(review) {
  const reportCase = review.report_cases ?? {};

  return {
    id:        reportCase.id || review.report_case_id,
    reason:    review.reason,
    type:      reportCase.report_type || 'דוח תנועה',
    authority: reportCase.authority || 'לא זוהה עדיין',
    chance:    reportCase.appeal_chance ?? null,
    priority:  review.priority,
    note:      review.admin_notes,
  };
}

const adminStats = [
  { label: 'מקרים פתוחים',       value: '142', helper: '+12 מהיום',              tone: 'blue',   icon: 'pending_actions'       },
  { label: 'ממתינים לבדיקה',     value: '—',   helper: 'מעודכן בזמן אמת',       tone: 'orange', icon: 'hourglass_top'         },
  { label: 'הושלמו החודש',       value: '1,024', helper: 'ב-30 הימים האחרונים', tone: 'green',  icon: 'task_alt'              },
  { label: 'מקרים חריגים',       value: '—',   helper: 'דורשים התייחסות',       tone: 'red',    icon: 'warning'               },
];

function AdminReviewPage() {
  const [exceptionalCases, setExceptionalCases] = useState(getExceptionalCasesForReview());
  const [searchQuery, setSearchQuery]           = useState('');
  const [loading, setLoading]                   = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadAdminReviews() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('admin_reviews')
        .select('*, report_cases(id, report_type, authority, appeal_chance)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        setLoading(false);
        return;
      }

      if (isActive) {
        setExceptionalCases(data.map(mapAdminReview));
        setLoading(false);
      }
    }

    loadAdminReviews();
    return () => { isActive = false; };
  }, []);

  const filteredCases = searchQuery.trim()
    ? exceptionalCases.filter(
        (c) =>
          c.type?.includes(searchQuery) ||
          c.authority?.includes(searchQuery) ||
          c.reason?.includes(searchQuery) ||
          String(c.id).includes(searchQuery),
      )
    : exceptionalCases;

  const hasCases = filteredCases.length > 0;

  /* Inject real counts into stats */
  const resolvedStats = adminStats.map((s) => {
    if (s.label === 'ממתינים לבדיקה') return { ...s, value: String(exceptionalCases.length) };
    if (s.label === 'מקרים חריגים')   return { ...s, value: String(exceptionalCases.length) };
    return s;
  });

  return (
    <div className="auth-page-content">
      {/* Page header */}
      <div className="auth-page-header">
        <div>
          <span className="access-badge access-admin">
            <Icon name="admin_panel_settings" />
            אזור מנהל
          </span>
          <h1>מסוף ניהול</h1>
          <p>סקירה וניהול של פניות ובקשות ביטול דוחות תנועה.</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="section-grid">
        {resolvedStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Exceptional cases panel */}
      <section className="card admin-list">
        <div className="admin-list-header">
          <div>
            <h2>מקרים חריגים לבדיקה ידנית</h2>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              מקרים עם סיכויי ערעור קיצוניים או שדורשים עיון אנושי.
            </p>
          </div>
          <span className="admin-list-badge">{exceptionalCases.length} ממתינים</span>
        </div>

        {/* Search toolbar */}
        <div className="admin-toolbar">
          <div className="search-input-wrap">
            <Icon name="search" />
            <input
              type="search"
              placeholder="חיפוש לפי מזהה, סוג או רשות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="חיפוש מקרים"
            />
          </div>
        </div>

        {/* Cases list */}
        {loading ? (
          <div className="loading-state">
            <div className="loader-dots">
              <span /><span /><span />
            </div>
            <p>טוען מקרים...</p>
          </div>
        ) : hasCases ? (
          <div>
            {filteredCases.map((caseItem) => (
              <CaseCard
                key={caseItem.id}
                caseItem={caseItem}
                actionLabel="בדיקה ידנית"
                variant="admin-row"
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Icon name="check_circle" />
            </div>
            <h2>
              {searchQuery ? 'לא נמצאו תוצאות' : 'אין מקרים חריגים כרגע'}
            </h2>
            <p>
              {searchQuery
                ? 'נסה חיפוש אחר או נקה את שדה החיפוש.'
                : 'כל המקרים מטופלים. המערכת פועלת כשורה.'}
            </p>
            {searchQuery && (
              <button
                className="button button-secondary button-sm"
                style={{ width: 'auto', marginTop: '0.5rem' }}
                type="button"
                onClick={() => setSearchQuery('')}
              >
                נקה חיפוש
              </button>
            )}
          </div>
        )}
      </section>

      {/* Demo notice */}
      <div className="disclaimer-band">
        <strong>מצב דמו</strong>
        <p style={{ margin: 0, fontSize: '0.875rem' }}>
          מסך זה מציג נתוני Supabase אם קיימים, ונופל לנתוני דמו אם אין נתונים זמינים.
        </p>
      </div>
    </div>
  );
}

export default AdminReviewPage;
