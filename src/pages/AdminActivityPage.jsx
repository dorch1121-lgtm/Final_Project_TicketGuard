import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { adminGetActivityLogs } from '../lib/adminService';

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;
    async function loadLogs() {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await adminGetActivityLogs(150);
        if (isActive) setLogs(data);
      } catch (error) {
        console.error('[AdminActivityPage] failed to load role_audit_logs:', error);
        if (isActive) setErrorMessage('לא ניתן היה לטעון את יומן הפעילות כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }
    loadLogs();
    return () => { isActive = false; };
  }, [reloadToken]);

  if (loading) return <div className="auth-page-content"><LoadingSpinner label="טוען יומן פעילות..." /></div>;
  if (errorMessage) return <div className="auth-page-content"><ErrorState description={errorMessage} onRetry={() => setReloadToken((token) => token + 1)} /></div>;

  return (
    <div className="auth-page-content">
      <PageHeader title="פעילות מערכת" description="יומן שינויי התפקידים שנשמר בטבלת role_audit_logs." />
      {logs.length === 0 ? (
        <EmptyState icon={<Icon name="history" />} title="עדיין אין פעילות להצגה." />
      ) : (
        <div className="card admin-list"><div className="data-table-wrap"><table className="data-table">
          <thead><tr><th>תאריך ושעה</th><th>מבצע הפעולה</th><th>משתמש יעד</th><th>תפקיד קודם</th><th>תפקיד חדש</th><th>פעולה</th></tr></thead>
          <tbody>{logs.map((log) => (
            <tr key={log.id}>
              <td data-label="תאריך ושעה">{formatDateTime(log.created_at)}</td>
              <td data-label="מבצע הפעולה" className="data-table-id">{log.actor_user_id}</td>
              <td data-label="משתמש יעד" className="data-table-id">{log.target_user_id}</td>
              <td data-label="תפקיד קודם">{log.old_role}</td>
              <td data-label="תפקיד חדש">{log.new_role}</td>
              <td data-label="פעולה">{log.action}</td>
            </tr>
          ))}</tbody>
        </table></div></div>
      )}
    </div>
  );
}

export default AdminActivityPage;
