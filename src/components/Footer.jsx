import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <Link to="/" className="footer-brand">
          TicketGuard
        </Link>
        <p>© 2025 TicketGuard. המידע באתר אינו מהווה ייעוץ משפטי.</p>
        <div className="footer-links">
          <Link to="/login">תקנון</Link>
          <Link to="/login">פרטיות</Link>
          <Link to="/login">צור קשר</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
