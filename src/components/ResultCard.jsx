import Icon from './Icon';

const toneIcons = {
  positive: 'thumb_up',
  risk: 'warning',
  warning: 'help_center',
  neutral: 'info',
};

function ResultCard({ title, items, tone = 'neutral' }) {
  return (
    <article className={`result-card result-${tone} card`}>
      <div className="result-card-title">
        <span className="result-icon">
          <Icon name={toneIcons[tone] || toneIcons.neutral} />
        </span>
        <h3>{title}</h3>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export default ResultCard;
