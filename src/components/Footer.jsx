import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <Link to="/" className="footer-brand">
          TicketGuard
        </Link>
        <p>כל הזכויות שמורות ל-TicketGuard © 2024. המידע אינו מהווה ייעוץ משפטי.</p>
        <div className="footer-links">
          <Link to="/login">תקנון ותנאי שימוש</Link>
          <Link to="/login">מדיניות פרטיות</Link>
          <Link to="/login">צור קשר</Link>
          <Link to="/login">שאלות ותשובות</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
