import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuthProfile from '../lib/useAuthProfile';
import AdminSidebar from './AdminSidebar';
import Icon from './Icon';

const PAGE_TITLES = [
  { match: /^\/admin\/users/, title: 'משתמשים' },
  { match: /^\/admin\/reports/, title: 'ניהול דוחות' },
  { match: /^\/admin\/payments/, title: 'תשלומים' },
  { match: /^\/admin\/activity/, title: 'פעילות מערכת' },
  { match: /^\/admin\/settings/, title: 'הגדרות' },
  { match: /^\/admin/, title: 'לוח בקרה' },
];

function getPageTitle(pathname) {
  return PAGE_TITLES.find((entry) => entry.match.test(pathname))?.title ?? 'אזור ניהול';
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile } = useAuthProfile();
  const location = useLocation();

  const displayName = profile?.full_name ?? user?.email ?? '';
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="auth-shell admin-shell">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="auth-main">
        <header className="auth-topbar admin-topbar">
          <button
            className="topbar-menu-btn icon-button"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="פתח תפריט ניהול"
          >
            <Icon name="menu" />
          </button>

          <h2 className="topbar-title">{pageTitle}</h2>

          <div className="topbar-end">
            <Link to="/dashboard" className="topbar-home-link" aria-label="מעבר לאזור משתמש" title="מעבר לאזור משתמש">
              <Icon name="swap_horiz" />
            </Link>
            <div className="topbar-avatar" title={displayName}>
              {avatarLetter}
            </div>
          </div>
        </header>

        <main className="auth-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
