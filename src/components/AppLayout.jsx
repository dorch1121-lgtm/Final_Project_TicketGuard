import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import useAuthProfile from '../lib/useAuthProfile';
import Icon from './Icon';
import Sidebar from './Sidebar';

const PAGE_TITLES = [
  { match: /^\/dashboard/, title: 'לוח בקרה' },
  { match: /^\/upload/, title: 'העלאת דוח' },
  { match: /^\/payment/, title: 'תשלום' },
  { match: /^\/reports\/[^/]+$/, title: 'פרטי דוח' },
  { match: /^\/reports/, title: 'הדוחות שלי' },
  { match: /^\/admin\/reports/, title: 'ניהול דוחות' },
  { match: /^\/admin\/usage/, title: 'שימוש ותשלומים' },
  { match: /^\/admin/, title: 'אזור מנהל' },
];

function getPageTitle(pathname) {
  return PAGE_TITLES.find((entry) => entry.match.test(pathname))?.title ?? 'TicketGuard';
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile } = useAuthProfile();
  const location = useLocation();

  const displayName = profile?.full_name ?? user?.email ?? '';
  const avatarLetter = displayName[0]?.toUpperCase() ?? '?';
  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="auth-shell">
      {/* Mobile overlay — closes sidebar on tap */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="auth-main">
        {/* Sticky top bar */}
        <header className="auth-topbar">
          <button
            className="topbar-menu-btn icon-button"
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="פתח תפריט ניווט"
          >
            <Icon name="menu" />
          </button>

          <h2 className="topbar-title">{pageTitle}</h2>

          <div className="topbar-end">
            <Link to="/" className="topbar-home-link" aria-label="דף הבית">
              <Icon name="home" />
            </Link>
            <div className="topbar-user">
              <span className="topbar-user-name">{displayName}</span>
              <div className="topbar-avatar" title={displayName}>
                {avatarLetter}
              </div>
            </div>
          </div>
        </header>

        {/* Page content rendered by nested routes */}
        <main className="auth-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
