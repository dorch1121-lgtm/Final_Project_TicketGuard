import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import {
  ensureUserProfile,
  signInWithEmail,
  signUpWithEmail,
} from '../lib/auth';

const GENERAL_REGISTER_ERROR = 'אירעה שגיאה ביצירת החשבון. נסה שוב.';
const GENERAL_SIGN_IN_ERROR = 'אירעה שגיאה בהתחברות. נסה שוב.';
const PASSWORD_TOO_WEAK_ERROR = 'הסיסמה חייבת להכיל לפחות 6 תווים.';

function getRegistrationErrorMessage(error) {
  const message = error?.message?.toLowerCase() ?? '';

  if (message.includes('already') || message.includes('registered')) {
    return 'כתובת האימייל כבר קיימת במערכת.';
  }

  if (
    message.includes('password') &&
    (message.includes('weak') || message.includes('short') || message.includes('6'))
  ) {
    return PASSWORD_TOO_WEAK_ERROR;
  }

  return GENERAL_REGISTER_ERROR;
}

const benefitItems = [
  { icon: 'upload_file',        text: 'העלאת דוחות PDF לבדיקה מהירה' },
  { icon: 'analytics',          text: 'ניתוח סיכויים חכם ומנומק' },
  { icon: 'track_changes',      text: 'מעקב אחר סטטוס הטיפול בדוח' },
  { icon: 'lock',               text: 'אחסון מאובטח עם Supabase' },
];

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

  const navigateAfterAuth = (role) => {
    const nextRoute = role === 'admin' || role === 'super_admin' ? '/admin' : '/dashboard';
    window.setTimeout(() => navigate(nextRoute), 600);
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
        if (password.length < 6) {
          setErrorMessage(PASSWORD_TOO_WEAK_ERROR);
          return;
        }

        const { data, error } = await signUpWithEmail(trimmedEmail, password, trimmedFullName);

        if (error) {
          setErrorMessage(getRegistrationErrorMessage(error));
          return;
        }

        setSuccessMessage('החשבון נוצר בהצלחה!');
        if (data?.emailConfirmationRequired) {
          setSuccessMessage('נשלח אליך אימייל אימות. אנא אשר את כתובת האימייל שלך.');
          return;
        }

        navigateAfterAuth(data?.profile?.role ?? 'user');
        return;
      }

      const { data, error } = await signInWithEmail(trimmedEmail, password);

      if (error || !data?.user) {
        setErrorMessage(GENERAL_SIGN_IN_ERROR);
        return;
      }

      const { data: profile, error: profileError } = await ensureUserProfile(data.user);

      if (profileError) {
        setErrorMessage(GENERAL_SIGN_IN_ERROR);
        return;
      }

      setSuccessMessage('התחברת בהצלחה!');
      navigateAfterAuth(profile?.role);
    } catch {
      setErrorMessage(isRegisterMode ? GENERAL_REGISTER_ERROR : GENERAL_SIGN_IN_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setErrorMessage('');
    setSuccessMessage('');
  };

  return (
    <div className="auth-page-wrap">
      {/* Left — brand panel */}
      <div className="auth-brand-panel">
        <div>
          <div className="auth-brand-logo">
            <Icon name="security" />
            TicketGuard
          </div>
          <h1>ניהול דוחות תנועה בצורה חכמה ומאובטחת</h1>
          <p>הירשמו לחינם וקבלו גישה לכלי ניתוח הדוחות המתקדם ביותר בישראל.</p>
        </div>

        <div className="auth-benefit-list">
          {benefitItems.map((b) => (
            <div className="auth-benefit-item" key={b.text}>
              <Icon name={b.icon} />
              {b.text}
            </div>
          ))}
        </div>

        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 0 }}>
          הדוח הראשון חינם, ללא צורך בתשלום.
        </p>
      </div>

      {/* Right — form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <Icon name="arrow_forward" />
              חזרה לדף הבית
            </Link>
            <h2>{pageTitle}</h2>
            <p>
              {isRegisterMode
                ? 'צרו חשבון חינמי ותתחילו לנהל את הדוחות שלכם.'
                : 'כניסה לאזור האישי שלכם ב-TicketGuard.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }} noValidate>
            {isRegisterMode && (
              <label>
                שם מלא
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  autoComplete="name"
                  required
                />
              </label>
            )}

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
              סיסמה
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegisterMode ? 'לפחות 6 תווים' : '••••••••'}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                required
              />
            </label>

            {errorMessage && (
              <div className="form-error" role="alert">
                <Icon name="error" />
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="form-success" role="status">
                <Icon name="check_circle" />
                {successMessage}
              </div>
            )}

            <button className="button button-primary" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>מבצע פעולה...</>
              ) : isRegisterMode ? (
                <>
                  <Icon name="person_add" />
                  הרשמה
                </>
              ) : (
                <>
                  <Icon name="login" />
                  כניסה
                </>
              )}
            </button>

            <button
              className="button button-ghost"
              type="button"
              onClick={toggleMode}
              disabled={isLoading}
            >
              {isRegisterMode ? 'כבר יש לי חשבון — כניסה' : 'אין לי חשבון — הרשמה חינם'}
            </button>

            <p className="form-note" style={{ textAlign: 'center' }}>
              הדוח הראשון חינם. ניתן להשתמש גם ללא הרשמה.{' '}
              <Link to="/upload" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                נסו עכשיו
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
