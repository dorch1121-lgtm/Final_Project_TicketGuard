import { useState } from 'react';
import Icon from './Icon';
import { adminCreateUser } from '../lib/adminService';

function AddUserModal({ onClose, onCreated }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await adminCreateUser({ fullName, email, role });
      setCreatedUser(result);
      onCreated?.();
    } catch (error) {
      setErrorMessage(error?.message || 'לא ניתן היה ליצור משתמש כרגע.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card add-user-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn icon-button" type="button" onClick={onClose} aria-label="סגור">
          <Icon name="close" />
        </button>

        <h2>הוספת משתמש חדש</h2>

        {createdUser ? (
          <div className="add-user-success">
            <Icon name="check_circle" />
            <p>המשתמש <strong>{createdUser.email}</strong> נוצר בהצלחה.</p>
            <div className="temp-password-box">
              <span>סיסמה זמנית (העבירו אותה למשתמש — לא תוצג שוב)</span>
              <code>{createdUser.tempPassword}</code>
            </div>
            <button className="button button-primary" type="button" onClick={onClose}>
              סגירה
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }} noValidate>
            <label>
              שם מלא
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ישראל ישראלי"
                autoComplete="name"
              />
            </label>

            <label>
              כתובת אימייל
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.co.il"
                autoComplete="email"
                required
              />
            </label>

            <label>
              תפקיד
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="user">משתמש רגיל</option>
                <option value="admin">מנהל</option>
              </select>
            </label>

            {errorMessage && (
              <p className="form-error" role="alert">
                <Icon name="error" />
                {errorMessage}
              </p>
            )}

            <div className="button-row">
              <button className="button button-primary" type="submit" disabled={isLoading}>
                {isLoading ? 'יוצר משתמש...' : 'יצירת משתמש'}
              </button>
              <button className="button button-secondary" type="button" onClick={onClose} disabled={isLoading}>
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AddUserModal;
