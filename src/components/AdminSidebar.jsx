import { Link, NavLink, useNavigate } from 'react-router-dom';
import { signOut } from '../lib/auth';
import useAuthProfile from '../lib/useAuthProfile';
import Icon from './Icon';
import RoleBadge from './RoleBadge';

const adminNavItems = [
  { to: '/admin', icon: 'dashboard', label: 'לוח בקרה', end: true },
  { to: '/admin/users', icon: 'group', label: 'משתמשים' },
  { to: '/admin/reports', icon: 'table_rows', label: 'ניהול דוחות' },
  { to: '/admin/payments', icon: 'payments', label: 'תשלומים' },
  { to: '/admin/activity', icon: 'history', label: 'פעילות מערכת' },
  { to: '/admin/settings', icon: 'settings', label: 'הגדרות' },
];

function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, profile, role } = useAuthProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name ?? '';
  const displayEmail = user?.email ?? '';
  const avatarLetter = (displayName[0] ?? displayEmail[0] ?? '?').toUpperCase();

  return (
    <aside className={`app-sidebar admin-sidebar${isOpen ? ' sidebar-open' : ''}`} aria-label="ניווט ניהול">
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-brand" onClick={onClose} aria-label="TicketGuard - אזור ניהול">
          <Icon name="shield_person" />
          TicketGuard
          <span className="admin-sidebar-tag">Admin</span>
        </Link>
        <button className="sidebar-close-btn icon-button" type="button" onClick={onClose} aria-label="סגור תפריט">
          <Icon name="close" />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="ניווט ניהול ראשי">
        <span className="sidebar-nav-section">ניהול</span>
        {adminNavItems.map((item) => (
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
      </nav>

      <div className="sidebar-footer">
        <Link to="/dashboard" className="admin-switch-view-link" onClick={onClose}>
          <Icon name="swap_horiz" />
          מעבר לאזור משתמש
        </Link>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{avatarLetter}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{displayName || 'מנהל'}</span>
              <span className="sidebar-user-email">{displayEmail}</span>
            </div>
            <RoleBadge role={role} />
          </div>
        )}

        <button className="sidebar-logout-btn" type="button" onClick={handleSignOut}>
          <Icon name="logout" />
          יציאה
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
