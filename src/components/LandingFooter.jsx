import { Link } from 'react-router-dom';

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container landing-footer-inner">
        <Link to="/" className="footer-brand">
          TicketGuard
        </Link>
        <p>© 2026 TicketGuard. כל הזכויות שמורות.</p>
        <p className="landing-footer-legal">המידע במערכת אינו מהווה ייעוץ משפטי.</p>
      </div>
    </footer>
  );
}

export default LandingFooter;
