import Icon from './Icon';

function FeatureCard({ icon, title, description, tone = 'primary' }) {
  return (
    <div className={`feature-card feature-card-${tone}`}>
      <div className="feature-card-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default FeatureCard;
