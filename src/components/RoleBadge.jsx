import Icon from './Icon';

const ROLE_META = {
  user:        { label: 'משתמש רגיל', className: 'access-user',        icon: 'person' },
  admin:       { label: 'מנהל',        className: 'access-admin',       icon: 'admin_panel_settings' },
  super_admin: { label: 'מנהל ראשי',   className: 'access-super-admin', icon: 'shield_person' },
};

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || { label: 'לא מוגדר', className: '', icon: 'help' };

  return (
    <span className={`access-badge ${meta.className}`}>
      <Icon name={meta.icon} />
      {meta.label}
    </span>
  );
}

export default RoleBadge;
