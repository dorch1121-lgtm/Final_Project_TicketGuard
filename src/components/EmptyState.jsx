function EmptyState({ icon, title, description, action, className = '', bare = false }) {
  return (
    <div className={`${bare ? '' : 'card'} empty-state ${className}`}>
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
