function AccessBadge({ label, tone = 'public' }) {
  return <span className={`access-badge access-${tone}`}>{label}</span>;
}

export default AccessBadge;
