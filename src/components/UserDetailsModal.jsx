import { useEffect, useState } from 'react';
import ErrorState from './ErrorState';
import Icon from './Icon';
import LoadingSpinner from './LoadingSpinner';
import PaymentStatusBadge from './PaymentStatusBadge';
import RoleBadge from './RoleBadge';
import StatusBadge from './StatusBadge';
import { adminGetUserDetails } from '../lib/adminService';
import { formatDate } from '../lib/statusUtils';

function UserDetailsModal({ userId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      setErrorMessage('');
      try {
        const result = await adminGetUserDetails(userId);
        if (!isActive) return;
        setDetails(result);
      } catch (error) {
        if (!isActive) return;
        console.error('[UserDetailsModal] failed to load user details:', error);
        setErrorMessage('לא ניתן היה לטעון את פרטי המשתמש כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => { isActive = false; };
  }, [userId]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card user-details-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn icon-button" type="button" onClick={onClose} aria-label="סגור">
          <Icon name="close" />
        </button>

        {loading ? (
          <LoadingSpinner label="טוען פרטי משתמש..." />
        ) : errorMessage || !details?.profile ? (
          <ErrorState description={errorMessage || 'המשתמש לא נמצא.'} />
        ) : (
          <UserDetailsContent details={details} />
        )}
      </div>
    </div>
  );
}

function UserDetailsContent({ details }) {
  const { profile, reports, payments } = details;

  return (
    <div className="user-details-modal-content">
      <div className="modal-header-row">
        <div>
          <span className="eyebrow">{profile.email}</span>
          <h2>{profile.full_name || 'משתמש'}</h2>
          <p>מזהה משתמש: {profile.user_id}</p>
        </div>
        <RoleBadge role={profile.role} />
      </div>

      <div className="report-details-modal-meta">
        <div>
          <span>בדיקה חינמית נוצלה</span>
          <strong>{profile.free_report_used ? 'כן' : 'לא'}</strong>
        </div>
        <div>
          <span>סטטוס תשלום</span>
          <strong>{profile.payment_status || 'none'}</strong>
        </div>
        <div>
          <span>עודכן לאחרונה</span>
          <strong>{formatDate(profile.updated_at)}</strong>
        </div>
      </div>

      <section>
        <h3>דוחות ({reports.length})</h3>
        {reports.length === 0 ? (
          <p className="form-note">המשתמש עדיין לא העלה דוחות.</p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>סוג</th>
                  <th>סטטוס</th>
                  <th>תאריך</th>
                  <th>רשות</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td data-label="סוג">{report.report_type || 'דוח תנועה'}</td>
                    <td data-label="סטטוס"><StatusBadge status={report.status} /></td>
                    <td data-label="תאריך">{formatDate(report.created_at)}</td>
                    <td data-label="רשות">{report.authority || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h3>תשלומים ({payments.length})</h3>
        {payments.length === 0 ? (
          <p className="form-note">אין תשלומים עבור משתמש זה.</p>
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>סכום</th>
                  <th>סטטוס</th>
                  <th>תאריך</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td data-label="סכום">₪{payment.amount}</td>
                    <td data-label="סטטוס"><PaymentStatusBadge status={payment.payment_status} /></td>
                    <td data-label="תאריך">{formatDate(payment.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default UserDetailsModal;
