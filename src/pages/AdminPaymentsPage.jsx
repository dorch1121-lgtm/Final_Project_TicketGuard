import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import PaymentStatusBadge from '../components/PaymentStatusBadge';
import StatCard from '../components/StatCard';
import { adminConfirmPayment, adminGetAllPayments } from '../lib/adminService';
import { formatDate } from '../lib/statusUtils';

function buildRevenueStats(payments) {
  const paid = payments.filter((p) => p.payment_status === 'paid');
  const pending = payments.filter((p) => p.payment_status === 'pending');
  const failed = payments.filter((p) => p.payment_status === 'failed' || p.payment_status === 'cancelled');
  const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const now = new Date();
  const revenueThisMonth = paid
    .filter((p) => p.paid_at && new Date(p.paid_at).getMonth() === now.getMonth() && new Date(p.paid_at).getFullYear() === now.getFullYear())
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  return [
    { label: 'הכנסה כוללת', value: `₪${totalRevenue.toLocaleString('he-IL')}`, tone: 'green', icon: 'account_balance_wallet' },
    { label: 'הכנסה החודש', value: `₪${revenueThisMonth.toLocaleString('he-IL')}`, tone: 'green', icon: 'trending_up' },
    { label: 'דוחות בתשלום', value: String(paid.length), tone: 'blue', icon: 'task_alt' },
    { label: 'ממתינים לאישור', value: String(pending.length), tone: 'orange', icon: 'hourglass_top' },
    { label: 'נכשלו/בוטלו', value: String(failed.length), tone: 'red', icon: 'cancel' },
  ];
}

function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPayments() {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await adminGetAllPayments();
        if (!isActive) return;
        setPayments(data);
      } catch (error) {
        if (!isActive) return;
        console.error('[AdminPaymentsPage] failed to load payments:', error);
        setErrorMessage('לא ניתן היה לטעון את נתוני התשלומים כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadPayments();
    return () => { isActive = false; };
  }, [reloadToken]);

  const handleConfirmPayment = async (paymentId) => {
    setConfirmingId(paymentId);
    try {
      await adminConfirmPayment(paymentId);
      setReloadToken((t) => t + 1);
    } catch (error) {
      console.error('[AdminPaymentsPage] failed to confirm payment:', error);
      setErrorMessage('לא ניתן היה לאשר את התשלום כרגע.');
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <div className="auth-page-content">
        <LoadingSpinner label="טוען נתוני תשלומים..." />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="auth-page-content">
        <ErrorState description={errorMessage} onRetry={() => setReloadToken((t) => t + 1)} />
      </div>
    );
  }

  const revenueStats = buildRevenueStats(payments);

  return (
    <div className="auth-page-content">
      <PageHeader
        title="תשלומים"
        description="סקירת הכנסות וכל התשלומים במערכת — בדיקה ראשונה חינמית, כל בדיקה נוספת ₪30."
      />

      <div className="admin-setup-notice admin-setup-notice-static">
        <Icon name="info" />
        <span>מערכת התשלומים עדיין לא הוגדרה במלואה — אין חיבור לסליקת אשראי מקוונת. תשלומים מאושרים כרגע ידנית על ידי מנהל.</span>
      </div>

      <div className="section-grid stats-grid-5">
        {revenueStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section>
        <div className="section-title-row">
          <h2>כל התשלומים</h2>
        </div>

        {payments.length === 0 ? (
          <EmptyState icon={<Icon name="payments" />} title="אין תשלומים במערכת עדיין" />
        ) : (
          <div className="card admin-list">
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>משתמש</th>
                    <th>דוח</th>
                    <th>סכום</th>
                    <th>סטטוס</th>
                    <th>אמצעי תשלום</th>
                    <th>תאריך בקשה</th>
                    <th>תאריך תשלום</th>
                    <th aria-label="פעולות" />
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td data-label="משתמש">{payment.payer?.full_name || payment.payer?.email || 'לא ידוע'}</td>
                      <td data-label="דוח">{payment.report_case_id?.slice(0, 8) || '—'}</td>
                      <td data-label="סכום">₪{payment.amount} {payment.currency}</td>
                      <td data-label="סטטוס"><PaymentStatusBadge status={payment.payment_status} /></td>
                      <td data-label="אמצעי תשלום">{payment.provider || '—'}</td>
                      <td data-label="תאריך בקשה">{formatDate(payment.created_at)}</td>
                      <td data-label="תאריך תשלום">{payment.paid_at ? formatDate(payment.paid_at) : '—'}</td>
                      <td className="data-table-actions" data-label="פעולות">
                        {payment.payment_status === 'pending' && (
                          <button
                            className="button button-primary button-sm"
                            type="button"
                            onClick={() => handleConfirmPayment(payment.id)}
                            disabled={confirmingId === payment.id}
                          >
                            <Icon name="check_circle" />
                            {confirmingId === payment.id ? 'מאשר...' : 'אשר תשלום'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminPaymentsPage;
