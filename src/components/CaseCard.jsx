import { Link } from 'react-router-dom';
import Icon from './Icon';
import StatusBadge from './StatusBadge';

function CaseCard({ caseItem, actionLabel = 'צפייה בפרטים', variant = 'card' }) {
  const detailsHref = caseItem.id ? `/reports/${caseItem.id}` : null;

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
            {caseItem.reporterLabel ? (
              <p className="case-row-meta">
                <Icon name="person" /> {caseItem.reporterLabel}
              </p>
            ) : null}
            {caseItem.reason ? (
              <p>
                <strong>סיבת חריגה:</strong> <mark>{caseItem.reason}</mark>
              </p>
            ) : null}
            <p className="case-row-meta">
              {caseItem.type} · {caseItem.authority} ·{' '}
              {caseItem.chance === null ? 'לא זוהה' : `${caseItem.chance}%`}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
          {caseItem.statusRaw ? <StatusBadge status={caseItem.statusRaw} /> : null}
          {detailsHref ? (
            <Link to={detailsHref} className="button button-primary admin-case-action">
              {actionLabel}
            </Link>
          ) : null}
        </div>
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
        {caseItem.statusRaw ? (
          <StatusBadge status={caseItem.statusRaw} />
        ) : (
          <span className="status-pill">{caseItem.status || caseItem.reason}</span>
        )}
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
      {detailsHref ? (
        <Link to={detailsHref} className="button button-secondary case-action">
          <Icon name="visibility" />
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}

export default CaseCard;
