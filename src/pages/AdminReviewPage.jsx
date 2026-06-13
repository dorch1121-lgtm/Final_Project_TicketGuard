import { useEffect, useState } from 'react';
import AccessBadge from '../components/AccessBadge';
import CaseCard from '../components/CaseCard';
import StatCard from '../components/StatCard';
import { supabase } from '../lib/supabase';
import { getExceptionalCasesForReview } from '../services/caseRepository';

function mapAdminReview(review) {
  const reportCase = review.report_cases ?? {};

  return {
    id: reportCase.id || review.report_case_id,
    reason: review.reason,
    type: reportCase.report_type || 'דוח תנועה',
    authority: reportCase.authority || 'לא זוהה עדיין',
    chance: reportCase.appeal_chance ?? null,
    priority: review.priority,
    note: review.admin_notes,
  };
}

function AdminReviewPage() {
  const [exceptionalCases, setExceptionalCases] = useState(getExceptionalCasesForReview());

  useEffect(() => {
    let isActive = true;

    async function loadAdminReviews() {
      if (!supabase) {
        return;
      }

      const { data, error } = await supabase
        .from('admin_reviews')
        .select('*, report_cases(id, report_type, authority, appeal_chance)')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return;
      }

      if (isActive) {
        setExceptionalCases(data.map(mapAdminReview));
      }
    }

    loadAdminReviews();

    return () => {
      isActive = false;
    };
  }, []);

  const hasExceptionalCases = exceptionalCases.length > 0;

  return (
    <section className="page container">
      <div className="page-heading">
        <AccessBadge label="אזור מנהל" tone="admin" />
        <h1>אזור מנהל</h1>
        <p>סקירה וניהול של פניות ובקשות ביטול דוחות.</p>
      </div>

      <div className="section-grid">
        <StatCard label="מקרים פתוחים" value="142" helper="+12 מהיום" icon="pending_actions" />
        <StatCard label="מקרים חריגים" value={exceptionalCases.length} helper="דורש התערבות מיידית" tone="red" icon="warning" />
        <StatCard label="מקרים שנסגרו" value="1,024" helper="ב-30 הימים האחרונים" tone="green" icon="check_circle" />
      </div>

      <section className="admin-list card">
        <div className="admin-list-header">
          <h2>מקרים חריגים לבדיקה ידנית</h2>
          <span className="admin-list-badge">{exceptionalCases.length} ממתינים</span>
        </div>

        {hasExceptionalCases ? (
          <div>
            {exceptionalCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} actionLabel="בדיקה ידנית" variant="admin-row" />
            ))}
          </div>
        ) : (
          <section className="empty-state inline-empty-state">
            <h2>אין כרגע מקרים חריגים לבדיקה</h2>
            <p>כל המערכות פועלות כשורה.</p>
          </section>
        )}
      </section>

      <section className="disclaimer-band upload-disclaimer">
        <strong>נתוני דמו</strong>
        <p>מסך זה מציג נתוני Supabase אם קיימים, ונופל לנתוני דמו אם אין נתונים זמינים.</p>
      </section>
    </section>
  );
}

export default AdminReviewPage;
