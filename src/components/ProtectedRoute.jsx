import { Navigate } from 'react-router-dom';
import useAuthProfile from '../lib/useAuthProfile';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, user, isAdmin } = useAuthProfile();

  if (loading) {
    return (
      <section className="page container auth-page">
        <div className="card empty-state">
          <p className="form-note">בודק הרשאות...</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ authMessage: 'יש להתחבר כדי לצפות בעמוד זה' }}
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{ authMessage: 'אין לך הרשאה לצפות בעמוד זה' }}
      />
    );
  }

  return children;
}

export default ProtectedRoute;
