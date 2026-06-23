import { useEffect, useState } from 'react';
import AddUserModal from '../components/AddUserModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import RoleBadge from '../components/RoleBadge';
import UserDetailsModal from '../components/UserDetailsModal';
import { adminChangeUserRole, adminListUsers, adminResetFreeReport } from '../lib/adminService';
import { formatDate } from '../lib/statusUtils';
import useAuthProfile from '../lib/useAuthProfile';

const ROLE_OPTIONS = [
  { value: 'user', label: 'משתמש' },
  { value: 'admin', label: 'מנהל' },
];

function AdminUsersPage() {
  const { isSuperAdmin } = useAuthProfile();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [reloadToken, setReloadToken] = useState(0);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isActive = true;
    async function loadUsers() {
      setLoading(true);
      setErrorMessage('');
      try {
        const data = await adminListUsers();
        if (isActive) setUsers(data);
      } catch (error) {
        console.error('[AdminUsersPage] failed to load profiles:', error);
        if (isActive) setErrorMessage('לא ניתן היה לטעון את רשימת המשתמשים כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }
    loadUsers();
    return () => { isActive = false; };
  }, [reloadToken]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.trim().toLocaleLowerCase('he');
    if (!query) return true;
    return `${user.full_name ?? ''} ${user.email ?? ''} ${user.user_id}`.toLocaleLowerCase('he').includes(query);
  });
  const refresh = () => setReloadToken((token) => token + 1);

  const requestRoleChange = (user, newRole) => {
    setPendingAction({
      title: 'שינוי תפקיד משתמש',
      description: `לשנות את התפקיד של ${user.full_name || user.email}?`,
      run: () => adminChangeUserRole(user.user_id, newRole),
    });
  };

  const runAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    setActionError('');
    try {
      await pendingAction.run();
      setPendingAction(null);
      refresh();
    } catch (error) {
      console.error('[AdminUsersPage] action failed:', error);
      setActionError(error?.message === 'Cannot change your own role'
        ? 'לא ניתן לשנות את התפקיד של עצמך.'
        : 'הפעולה נכשלה. נסה שוב.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="auth-page-content"><LoadingSpinner label="טוען רשימת משתמשים..." /></div>;
  if (errorMessage) return <div className="auth-page-content"><ErrorState description={errorMessage} onRetry={refresh} /></div>;

  return (
    <div className="auth-page-content">
      <PageHeader
        title="משתמשים"
        description="כל המשתמשים הרשומים במערכת לפי טבלת הפרופילים."
        actions={isSuperAdmin && (
          <button className="button button-primary" type="button" onClick={() => setShowAddUser(true)}>
            <Icon name="person_add" />
            הוספת משתמש
          </button>
        )}
      />

      <div className="admin-toolbar card">
        <div className="search-input-wrap">
          <Icon name="search" />
          <input type="search" placeholder="חיפוש לפי שם, אימייל או מזהה..." value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)} aria-label="חיפוש משתמשים" />
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState icon={<Icon name="group" />} title="לא נמצאו משתמשים" />
      ) : (
        <div className="card admin-list">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>שם</th><th>אימייל</th><th>מזהה משתמש</th><th>תפקיד</th>
                <th>דוח חינמי נוצל</th><th>סטטוס תשלום</th><th>נוצר</th><th>עודכן</th><th aria-label="פעולות" />
              </tr></thead>
              <tbody>{filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td data-label="שם"><strong>{user.full_name || 'לא ידוע'}</strong></td>
                  <td data-label="אימייל">{user.email}</td>
                  <td data-label="מזהה משתמש" className="data-table-id">{user.user_id}</td>
                  <td data-label="תפקיד"><RoleBadge role={user.role} /></td>
                  <td data-label="דוח חינמי נוצל">{user.free_report_used ? 'כן' : 'לא'}</td>
                  <td data-label="סטטוס תשלום">{user.payment_status || 'none'}</td>
                  <td data-label="נוצר">{formatDate(user.created_at)}</td>
                  <td data-label="עודכן">{formatDate(user.updated_at)}</td>
                  <td className="data-table-actions" data-label="פעולות">
                    <div className="admin-row-actions">
                      <button className="button button-secondary button-sm" type="button" onClick={() => setViewingUserId(user.user_id)}>
                        <Icon name="visibility" /> פרטים
                      </button>
                      {isSuperAdmin && user.role !== 'super_admin' && (
                        <select className="filter-select" value={user.role}
                          onChange={(event) => requestRoleChange(user, event.target.value)} aria-label="שינוי תפקיד">
                          {ROLE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                      )}
                      {isSuperAdmin && user.free_report_used && (
                        <button className="button button-secondary button-sm" type="button"
                          onClick={() => setPendingAction({
                            title: 'איפוס דוח חינמי',
                            description: `לאפס את ניצול הדוח החינמי של ${user.full_name || user.email}?`,
                            run: () => adminResetFreeReport(user.user_id),
                          })}>
                          <Icon name="restart_alt" /> איפוס חינמי
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {viewingUserId && <UserDetailsModal userId={viewingUserId} onClose={() => setViewingUserId(null)} />}
      {showAddUser && <AddUserModal onClose={() => setShowAddUser(false)} onCreated={refresh} />}
      <ConfirmDialog open={Boolean(pendingAction)} title={pendingAction?.title} description={pendingAction?.description}
        isLoading={actionLoading} errorMessage={actionError} onConfirm={runAction}
        onCancel={() => { setPendingAction(null); setActionError(''); }} />
    </div>
  );
}

export default AdminUsersPage;
