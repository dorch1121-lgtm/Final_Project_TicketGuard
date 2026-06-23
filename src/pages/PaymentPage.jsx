import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { createPaymentIntent, getPaymentById, subscribeToPayment } from '../lib/reportAccess';

const STATUS_COPY = {
  pending: {
    title: 'ממתין לאישור תשלום',
    tone: 'pending',
    description:
      'החיבור לסליקת אשראי מקוונת בהקמה. לאחר ביצוע התשלום מול הצוות שלנו, האישור יתעדכן כאן באופן אוטומטי — אין צורך לרענן.',
  },
  paid: {
    title: 'התשלום התקבל בהצלחה',
    tone: 'done',
    description: 'ניתן להמשיך כעת לניתוח הדוח הנוסף.',
  },
  failed: {
    title: 'התשלום נכשל',
    tone: 'rejected',
    description: 'אפשר לנסות לשלם שוב, או לחזור לאזור האישי.',
  },
  cancelled: {
    title: 'התשלום בוטל',
    tone: 'rejected',
    description: 'אפשר לנסות לשלם שוב, או לחזור לאזור האישי.',
  },
};

function PaymentPage() {
  const { paymentId } = useParams();
  const [searchParams] = useSearchParams();
  const reportCaseId = searchParams.get('reportCaseId');
  const navigate = useNavigate();

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isRetrying, setIsRetrying] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isActive = true;

    async function loadPayment() {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await getPaymentById(paymentId);
        if (!isActive) return;
        if (!data) {
          setErrorMessage('בקשת התשלום לא נמצאה.');
        } else {
          setPayment(data);
        }
      } catch (error) {
        if (!isActive) return;
        console.error('[PaymentPage] failed to load payment:', error);
        setErrorMessage('לא ניתן היה לטעון את פרטי התשלום כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadPayment();
    return () => { isActive = false; };
  }, [paymentId, reloadToken]);

  useEffect(() => {
    if (!paymentId) return undefined;
    const unsubscribe = subscribeToPayment(paymentId, (next) => setPayment(next));
    return unsubscribe;
  }, [paymentId]);

  const handleRetryPayment = async () => {
    if (!reportCaseId) return;
    setIsRetrying(true);
    setErrorMessage('');
    try {
      const newPaymentId = await createPaymentIntent(reportCaseId);
      navigate(`/payment/${newPaymentId}?reportCaseId=${reportCaseId}`, { replace: true });
    } catch (error) {
      console.error('[handleRetryPayment] failed to create a new payment intent:', error);
      setErrorMessage('משהו השתבש ביצירת בקשת התשלום. נסה שוב בעוד רגע.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-page-content">
        <LoadingSpinner label="טוען פרטי תשלום..." />
      </div>
    );
  }

  if (errorMessage && !payment) {
    return (
      <div className="auth-page-content">
        <ErrorState description={errorMessage} onRetry={() => setReloadToken((token) => token + 1)} />
      </div>
    );
  }

  const paymentStatus = payment.payment_status;
  const copy = STATUS_COPY[paymentStatus] ?? STATUS_COPY.pending;

  return (
    <div className="auth-page-content">
      <PageHeader title="תשלום בעבור בדיקת דוח נוספת" description="הבדיקה הראשונה חינמית. בדיקות נוספות עולות ₪30." />

      <div className={`card payment-status-card payment-status-${copy.tone}`}>
        <div className="payment-status-icon">
          <Icon name={paymentStatus === 'paid' ? 'check_circle' : paymentStatus === 'pending' ? 'hourglass_top' : 'error'} />
        </div>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>

        <div className="payment-price-row">
          <span>סכום לתשלום</span>
          <strong>₪{payment.amount} {payment.currency}</strong>
        </div>

        {errorMessage && (
          <p className="form-error" role="alert">
            <Icon name="error" />
            {errorMessage}
          </p>
        )}

        <div className="button-row">
          {paymentStatus === 'paid' && reportCaseId && (
            <button
              className="button button-primary"
              type="button"
              onClick={() => navigate(`/upload?reportCaseId=${reportCaseId}`)}
            >
              <Icon name="fact_check" />
              המשך לניתוח הדוח
            </button>
          )}

          {(paymentStatus === 'failed' || paymentStatus === 'cancelled') && reportCaseId && (
            <button className="button button-primary" type="button" onClick={handleRetryPayment} disabled={isRetrying}>
              <Icon name="refresh" />
              {isRetrying ? 'מעבד...' : 'ניסיון תשלום נוסף'}
            </button>
          )}

          <Link to="/dashboard" className="button button-secondary">
            חזרה לאזור האישי
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
