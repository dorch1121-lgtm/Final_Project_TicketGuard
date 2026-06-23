import { Link } from 'react-router-dom';
import Icon from './Icon';

function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="container landing-header-inner">
        <Link to="/" className="brand" aria-label="TicketGuard - דף הבית">
          <span className="brand-shield material-symbols-outlined">security</span>
          TicketGuard
        </Link>
        <Link to="/login" className="button button-secondary button-sm">
          <Icon name="login" />
          כניסה למערכת
        </Link>
      </div>
    </header>
  );
}

export default LandingHeader;
