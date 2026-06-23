import { Link } from 'react-router-dom';
import Icon from './Icon';

function CTASection({ title, description, primary, secondary }) {
  return (
    <section className="final-cta-section">
      <div className="container final-cta-inner">
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="hero-actions">
          <Link to={primary.to} className="button button-white">
            <Icon name={primary.icon} />
            {primary.label}
          </Link>
          <Link to={secondary.to} className="button button-outline-white">
            <Icon name={secondary.icon} />
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
