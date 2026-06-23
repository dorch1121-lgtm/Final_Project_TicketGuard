import Icon from './Icon';

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'אישור',
  cancelLabel = 'ביטול',
  tone = 'primary',
  isLoading = false,
  errorMessage = '',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-dialog" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-dialog-icon confirm-dialog-${tone}`}>
          <Icon name={tone === 'danger' ? 'warning' : 'help'} />
        </div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}

        {errorMessage && (
          <p className="form-error" role="alert">
            <Icon name="error" />
            {errorMessage}
          </p>
        )}

        <div className="button-row">
          <button
            className={`button ${tone === 'danger' ? 'button-danger' : 'button-primary'}`}
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'מבצע...' : confirmLabel}
          </button>
          <button className="button button-secondary" type="button" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
