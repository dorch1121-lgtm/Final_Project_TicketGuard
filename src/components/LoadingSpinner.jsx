function LoadingSpinner({ label = 'טוען...' }) {
  return (
    <div className="loading-state" role="status" aria-live="polite">
      <div className="loader-dots">
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </div>
  );
}

export default LoadingSpinner;
