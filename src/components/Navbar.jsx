import { NavLink } from 'react-router-dom';
import Icon from './Icon';

const navItems = [
  { to: '/', label: 'דף הבית', end: true },
  { to: '/upload', label: 'העלאת דוח' },
  { to: '/dashboard', label: 'אזור אישי' },
  { to: '/admin', label: 'ניהול' },
];

function Navbar() {
  return (
    <header className="site-header">
      <nav className="navbar" aria-label="ניווט ראשי">
        <NavLink to="/" className="brand" aria-label="TicketGuard - דף הבית">
          TicketGuard
        </NavLink>

        <div className="nav-links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-icons">
          <button className="icon-button" type="button" aria-label="התראות">
            <Icon name="notifications" />
          </button>
          <NavLink to="/login" className="icon-button" aria-label="כניסה לחשבון">
            <Icon name="account_circle" />
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
