import Icon from './Icon';

function ProcessStepCard({ number, icon, title, description }) {
  return (
    <article className="step-card card">
      <div className="step-number">{number}</div>
      <div className="step-icon">
        <Icon name={icon} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

export default ProcessStepCard;
