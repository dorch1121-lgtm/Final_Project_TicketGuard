import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <Link to="/" className="footer-brand">
          TicketGuard
        </Link>
        <p>© 2026 TicketGuard. המידע במערכת אינו מהווה ייעוץ משפטי.</p>
      </div>
    </footer>
  );
}

export default Footer;
