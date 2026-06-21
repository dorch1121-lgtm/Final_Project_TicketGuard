import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import useAuthProfile from '../lib/useAuthProfile';
import Icon from './Icon';

function Navbar() {
  const navigate = useNavigate();
  const { loading, user, isAdmin } = useAuthProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="navbar container" aria-label="ניווט ראשי">
        {/* Brand */}
        <NavLink to="/" className="brand" aria-label="TicketGuard - דף הבית">
          <span className="brand-shield material-symbols-outlined">security</span>
          TicketGuard
        </NavLink>

        {/* Navigation links */}
        <div className="nav-links">
          <NavLink to="/" end className="nav-link">
            דף הבית
          </NavLink>
          <NavLink to="/upload" className="nav-link">
            בדיקת דוח
          </NavLink>

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
            </>
          )}
        </div>

        {/* Right-side icons */}
        <div className="nav-icons">
          {!loading && user ? (
            <button
              className="button button-secondary button-sm"
              type="button"
              onClick={handleSignOut}
            >
              <Icon name="logout" />
              יציאה
            </button>
          ) : (
            !loading && (
              <NavLink to="/login" className="button button-primary button-sm">
                <Icon name="login" />
                כניסה
              </NavLink>
            )
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
