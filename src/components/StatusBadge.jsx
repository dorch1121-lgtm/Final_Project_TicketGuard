import { getStatusMeta } from '../lib/statusUtils';

function StatusBadge({ status }) {
  const { label, tone } = getStatusMeta(status);

  return <span className={`status-badge status-${tone}`}>{label}</span>;
}

export default StatusBadge;
