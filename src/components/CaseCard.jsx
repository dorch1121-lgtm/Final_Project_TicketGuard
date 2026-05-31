import Icon from './Icon';

function CaseCard({ caseItem, actionLabel, variant = 'card' }) {
  if (variant === 'admin-row') {
    return (
      <article className="admin-case-row">
        <div className="case-row-info">
          <div className="case-row-icon">
            <Icon name={caseItem.chance === null ? 'image' : 'receipt_long'} />
          </div>
          <div>
            <p>
              <strong>מזהה פנייה:</strong> <span>{caseItem.id}</span>
            </p>
            <p>
              <strong>סיבת חריגה:</strong> <mark>{caseItem.reason}</mark>
            </p>
            <p className="case-row-meta">
              {caseItem.type} · {caseItem.authority} ·{' '}
              {caseItem.chance === null ? 'לא זוהה' : `${caseItem.chance}%`}
            </p>
          </div>
        </div>
        {actionLabel ? (
          <button className="button button-primary admin-case-action" type="button">
            {actionLabel}
          </button>
        ) : null}
      </article>
    );
  }

  return (
    <article className="case-card card">
      <div className="case-header">
        <div>
          <span className="eyebrow">{caseItem.id}</span>
          <h3>{caseItem.title || caseItem.type}</h3>
        </div>
        <span className="status-pill">{caseItem.status || caseItem.reason}</span>
      </div>
      <dl className="case-details">
        {caseItem.type ? (
          <div>
            <dt>סוג דוח</dt>
            <dd>{caseItem.type}</dd>
          </div>
        ) : null}
        <div>
          <dt>רשות</dt>
          <dd>{caseItem.authority}</dd>
        </div>
        {caseItem.date ? (
          <div>
            <dt>תאריך</dt>
            <dd>{caseItem.date}</dd>
          </div>
        ) : null}
        {caseItem.amount ? (
          <div>
            <dt>סכום</dt>
            <dd>{caseItem.amount} ש"ח</dd>
          </div>
        ) : null}
        <div>
          <dt>סיכוי</dt>
          <dd>{caseItem.chance === null ? 'לא זוהה' : `${caseItem.chance}%`}</dd>
        </div>
        {caseItem.reason ? (
          <div>
            <dt>סיבת בדיקה</dt>
            <dd>{caseItem.reason}</dd>
          </div>
        ) : null}
      </dl>
      {caseItem.note ? <p className="case-note">{caseItem.note}</p> : null}
      {actionLabel ? (
        <button className="button button-secondary case-action" type="button">
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}

export default CaseCard;
