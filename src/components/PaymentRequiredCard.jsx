import Icon from './Icon';

function PaymentRequiredCard({ price = 30, onContinue, onBack, isLoading = false, errorMessage = '' }) {
  return (
    <div className="card payment-required-card">
      <div className="payment-required-icon">
        <Icon name="lock" />
      </div>
      <h2>נדרש תשלום להמשך הבדיקה</h2>
      <p>
        הבדיקה הראשונה שלך ב-TicketGuard הייתה חינמית. כל בדיקה נוספת של דוח תנועה
        עולה <strong>₪{price}</strong> בודדים.
      </p>

      <div className="payment-price-row">
        <span>מחיר לבדיקה</span>
        <strong>₪{price}</strong>
      </div>

      {errorMessage ? (
        <p className="form-error" role="alert">
          <Icon name="error" />
          {errorMessage}
        </p>
      ) : null}

      <div className="button-row">
        <button className="button button-primary" type="button" onClick={onContinue} disabled={isLoading}>
          <Icon name="credit_card" />
          {isLoading ? 'מעבד...' : 'המשך לתשלום'}
        </button>
        <button className="button button-secondary" type="button" onClick={onBack} disabled={isLoading}>
          חזרה לאזור האישי
        </button>
      </div>
    </div>
  );
}

export default PaymentRequiredCard;
