const PAYMENT_STATUS_META = {
  pending: { label: 'ממתין', tone: 'pending' },
  paid: { label: 'שולם', tone: 'done' },
  failed: { label: 'נכשל', tone: 'rejected' },
  cancelled: { label: 'בוטל', tone: 'rejected' },
  refunded: { label: 'הוחזר', tone: 'neutral' },
};

function PaymentStatusBadge({ status }) {
  const meta = PAYMENT_STATUS_META[status] ?? { label: status ?? 'לא ידוע', tone: 'neutral' };
  return <span className={`status-badge status-${meta.tone}`}>{meta.label}</span>;
}

export default PaymentStatusBadge;
