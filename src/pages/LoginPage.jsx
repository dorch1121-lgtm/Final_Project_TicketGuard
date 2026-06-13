import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import {
  getUserProfile,
  signInWithEmail,
  signUpWithEmail,
} from '../lib/auth';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.authMessage ?? '');

  const pageTitle = isRegisterMode ? 'יצירת חשבון' : 'כניסה לחשבון';
  const submitLabel = isRegisterMode ? 'הרשמה' : 'כניסה';

  const navigateAfterAuth = (role) => {
    const nextRoute = role === 'admin' || role === 'super_admin' ? '/admin' : '/dashboard';

    window.setTimeout(() => {
      navigate(nextRoute);
    }, 600);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    try {
      if (isRegisterMode) {
        const { data, error } = await signUpWithEmail(trimmedEmail, password, trimmedFullName);

        if (error) {
          setErrorMessage('אירעה שגיאה, נסה שוב');
          return;
        }

        setSuccessMessage('החשבון נוצר בהצלחה');
        navigateAfterAuth(data?.profile?.role ?? 'user');
        return;
      }

      const { data, error } = await signInWithEmail(trimmedEmail, password);

      if (error || !data?.user) {
        setErrorMessage('אירעה שגיאה, נסה שוב');
        return;
      }

      const { data: profile, error: profileError } = await getUserProfile(data.user.id);

      if (profileError) {
        setErrorMessage('אירעה שגיאה, נסה שוב');
        return;
      }

      setSuccessMessage('התחברת בהצלחה');
      navigateAfterAuth(profile?.role);
    } catch {
      setErrorMessage('אירעה שגיאה, נסה שוב');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((currentMode) => !currentMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <section className="page container auth-page">
      <div className="page-heading centered">
        <AccessBadge label="מסך ציבורי" />
        <h1>{pageTitle}</h1>
        <p>מסך שמוכן לחיבור עתידי ל-Supabase Auth.</p>
      </div>

      <form className="card form-card auth-card" onSubmit={handleSubmit}>
        {isRegisterMode && (
          <label>
            שם מלא
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="שם מלא"
              autoComplete="name"
              required
            />
          </label>
        )}

        <label>
          אימייל
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.co.il"
            autoComplete="email"
            required
          />
        </label>

        <label>
          סיסמה
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="סיסמה"
            autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {errorMessage && <p className="form-error">{errorMessage}</p>}
        {successMessage && <p className="form-note">{successMessage}</p>}

        <button className="button button-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'מבצע פעולה...' : submitLabel}
        </button>

        <button className="button button-ghost" type="button" onClick={toggleMode} disabled={isLoading}>
          {isRegisterMode ? 'כבר יש לך חשבון? כניסה' : 'אין לך חשבון? הרשמה'}
        </button>

        <p className="form-note">הדוח הראשון חינם. לאחר מכן תידרש הרשמה ותשלום עתידי.</p>
      </form>
    </section>
  );
}

export default LoginPage;
