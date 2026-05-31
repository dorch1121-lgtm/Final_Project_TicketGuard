import Icon from './Icon';

function StatCard({ label, value, tone = 'blue', helper, icon }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
      {icon ? (
        <div className="stat-icon">
          <Icon name={icon} />
        </div>
      ) : null}
    </article>
  );
}

export default StatCard;
