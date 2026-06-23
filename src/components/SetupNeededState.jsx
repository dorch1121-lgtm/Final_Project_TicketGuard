import Icon from './Icon';

function SetupNeededState({ title, description, onRetry }) {
  return (
    <div className="card setup-needed-state">
      <div className="setup-needed-icon">
        <Icon name="construction" />
      </div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onRetry && (
        <button className="button button-secondary" type="button" onClick={onRetry}>
          <Icon name="refresh" />
          נסה שוב
        </button>
      )}
    </div>
  );
}

export default SetupNeededState;
