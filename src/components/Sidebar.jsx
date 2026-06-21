import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import useAuthProfile from '../lib/useAuthProfile';
import Icon from './Icon';

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuthProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name ?? '';
  const displayEmail = user?.email ?? '';
  const avatarLetter = (displayName[0] ?? displayEmail[0] ?? '?').toUpperCase();

  const userNavItems = [
    { to: '/dashboard', icon: 'dashboard', label: 'לוח בקרה', end: true },
    { to: '/upload', icon: 'upload_file', label: 'העלאת דוח' },
  ];

  const adminNavItems = isAdmin
    ? [{ to: '/admin', icon: 'admin_panel_settings', label: 'ניהול דוחות' }]
    : [];

  return (
    <aside className={`app-sidebar${isOpen ? ' sidebar-open' : ''}`} aria-label="תפריט ניווט">
      {/* Header */}
      <div className="sidebar-header">
        <Link to="/" className="sidebar-brand" onClick={onClose} aria-label="TicketGuard - דף הבית">
          <Icon name="security" />
          TicketGuard
        </Link>
        <button
          className="sidebar-close-btn icon-button"
          type="button"
          onClick={onClose}
          aria-label="סגור תפריט"
        >
          <Icon name="close" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="ניווט ראשי">
        <span className="sidebar-nav-section">ניווט</span>

        {userNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Icon name={item.icon} />
            {item.label}
          </NavLink>
        ))}

        {adminNavItems.length > 0 && (
          <>
            <span className="sidebar-nav-section">ניהול</span>
            {adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <Icon name={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer: user info + logout */}
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{avatarLetter}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName || 'משתמש'}</span>
              <span className="sidebar-user-email">{displayEmail}</span>
            </div>
          </div>
        )}

        <button className="sidebar-logout-btn" type="button" onClick={handleSignOut}>
          <Icon name="logout" />
          יציאה מהמערכת
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
