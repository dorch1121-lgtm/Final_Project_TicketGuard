import Icon from './Icon';

function ErrorState({ title = 'אירעה שגיאה, נסה שוב', description, onRetry }) {
  return (
    <div className="error-state" role="alert">
      <Icon name="error" />
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {onRetry ? (
        <button className="button button-secondary button-sm" type="button" onClick={onRetry}>
          <Icon name="refresh" />
          ניסיון חוזר
        </button>
      ) : null}
    </div>
  );
}

export default ErrorState;
