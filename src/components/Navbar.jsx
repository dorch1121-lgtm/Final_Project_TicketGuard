import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import useAuthProfile from '../lib/useAuthProfile';
import Icon from './Icon';

const publicNavItems = [
  { to: '/', label: 'דף הבית', end: true },
  { to: '/upload', label: 'העלאת דוח' },
];

function Navbar() {
  const navigate = useNavigate();
  const { loading, user, isAdmin } = useAuthProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="ניווט ראשי">
        <NavLink to="/" className="brand" aria-label="TicketGuard - דף הבית">
          TicketGuard
        </NavLink>

        <div className="nav-links">
          {publicNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className="nav-link">
              {item.label}
            </NavLink>
          ))}

          {!loading && !user && (
            <NavLink to="/login" className="nav-link">
              כניסה
            </NavLink>
          )}

          {!loading && user && (
            <>
              <NavLink to="/dashboard" className="nav-link">
                האזור שלי
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className="nav-link">
                  ניהול
                </NavLink>
              )}
              <button
                className="nav-link"
                type="button"
                onClick={handleSignOut}
                style={{ background: 'transparent', cursor: 'pointer' }}
              >
                יציאה
              </button>
            </>
          )}
        </div>

        <div className="nav-icons">
          <button className="icon-button" type="button" aria-label="התראות">
            <Icon name="notifications" />
          </button>
          <NavLink to={user ? '/dashboard' : '/login'} className="icon-button" aria-label="חשבון">
            <Icon name="account_circle" />
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
