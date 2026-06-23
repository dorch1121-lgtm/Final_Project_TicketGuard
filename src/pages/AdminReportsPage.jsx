import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import ReportDetailsModal from '../components/ReportDetailsModal';
import StatusBadge from '../components/StatusBadge';
import { adminMarkForReview } from '../lib/adminService';
import { getAdminReportCases } from '../lib/reportService';
import { formatDate, reportStatusOptions } from '../lib/statusUtils';

function AdminReportsPage() {
  const [reportCases, setReportCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [viewingReportId, setViewingReportId] = useState(null);
  const [pendingReview, setPendingReview] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadReportCases() {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await getAdminReportCases();
        if (!isActive) return;
        setReportCases(data);
      } catch (error) {
        if (!isActive) return;
        console.error('[AdminReportsPage] failed to load report cases:', error);
        setErrorMessage('לא ניתן היה לטעון את רשימת הדוחות כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadReportCases();
    return () => { isActive = false; };
  }, [reloadToken]);

  const filteredCases = reportCases.filter((reportCase) => {
    const matchesStatus = !statusFilter || reportCase.status === statusFilter;
    const trimmedQuery = searchQuery.trim();
    const reporterText = `${reportCase.reporter?.full_name ?? ''} ${reportCase.reporter?.email ?? ''}`;
    const matchesQuery =
      !trimmedQuery ||
      reportCase.authority?.includes(trimmedQuery) ||
      reportCase.report_type?.includes(trimmedQuery) ||
      reporterText.includes(trimmedQuery) ||
      String(reportCase.id).includes(trimmedQuery);

    return matchesStatus && matchesQuery;
  });

  const hasResults = filteredCases.length > 0;
  const isFiltering = Boolean(searchQuery.trim() || statusFilter);

  const handleMarkForReview = async () => {
    if (!pendingReview) return;
    setActionLoading(true);
    setActionError('');
    try {
      await adminMarkForReview(pendingReview.id, 'סומן לבדיקה ידנית על ידי מנהל');
      setPendingReview(null);
      setReloadToken((t) => t + 1);
    } catch (error) {
      console.error('[AdminReportsPage] mark-for-review failed:', error);
      setActionError('הפעולה נכשלה. נסה שוב.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="auth-page-content">
      <PageHeader title="ניהול דוחות" description="חיפוש, סינון וצפייה בכל הדוחות שהוגשו במערכת." />

      <div className="card admin-list">
        <div className="admin-toolbar">
          <div className="search-input-wrap">
            <Icon name="search" />
            <input
              type="search"
              placeholder="חיפוש לפי משתמש, רשות, סוג דוח או מזהה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="חיפוש דוחות"
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="סינון לפי סטטוס"
          >
            {reportStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner label="טוען דוחות..." />
        ) : errorMessage ? (
          <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />
        ) : hasResults ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>מזהה דוח</th>
                  <th>משתמש</th>
                  <th>תאריך</th>
                  <th>רשות</th>
                  <th>סיכויי ערעור</th>
                  <th>חריג</th>
                  <th>סטטוס</th>
                  <th>עודכן</th>
                  <th aria-label="פעולות" />
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((reportCase) => (
                  <tr key={reportCase.id}>
                    <td className="data-table-id" data-label="מזהה דוח">
                      {reportCase.id.slice(0, 8)}
                    </td>
                    <td data-label="משתמש">
                      {reportCase.reporter?.full_name || reportCase.reporter?.email || 'לא ידוע'}
                    </td>
                    <td data-label="תאריך">{formatDate(reportCase.created_at)}</td>
                    <td data-label="רשות">{reportCase.authority || '—'}</td>
                    <td data-label="סיכויי ערעור">{reportCase.appeal_chance == null ? '—' : `${reportCase.appeal_chance}%`}</td>
                    <td data-label="חריג">{reportCase.is_exceptional ? 'כן' : 'לא'}</td>
                    <td data-label="סטטוס">
                      <StatusBadge status={reportCase.status} />
                    </td>
                    <td data-label="עודכן">{formatDate(reportCase.updated_at)}</td>
                    <td className="data-table-actions" data-label="פעולות">
                      <div className="admin-row-actions">
                        <button
                          className="button button-secondary button-sm"
                          type="button"
                          onClick={() => setViewingReportId(reportCase.id)}
                        >
                          <Icon name="visibility" />
                          צפייה בפרטים
                        </button>
                        {reportCase.status !== 'manual_review' && (
                          <button
                            className="button button-secondary button-sm"
                            type="button"
                            onClick={() => setPendingReview(reportCase)}
                          >
                            <Icon name="flag" />
                            סמן לבדיקה
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isFiltering ? (
          <EmptyState
            bare
            icon={<Icon name="search_off" />}
            title="לא נמצאו תוצאות"
            description="נסה חיפוש אחר או נקה את הסינון."
            action={
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                נקה סינון
              </button>
            }
          />
        ) : (
          <EmptyState bare icon={<Icon name="inbox" />} title="עדיין לא הועלו דוחות" />
        )}
      </div>

      {viewingReportId && (
        <ReportDetailsModal reportCaseId={viewingReportId} onClose={() => setViewingReportId(null)} />
      )}

      <ConfirmDialog
        open={Boolean(pendingReview)}
        title="סימון דוח לבדיקה ידנית"
        description={`לסמן את הדוח ${pendingReview?.report_type ?? ''} לבדיקה ידנית?`}
        isLoading={actionLoading}
        errorMessage={actionError}
        onConfirm={handleMarkForReview}
        onCancel={() => { setPendingReview(null); setActionError(''); }}
      />
    </div>
  );
}

export default AdminReportsPage;
