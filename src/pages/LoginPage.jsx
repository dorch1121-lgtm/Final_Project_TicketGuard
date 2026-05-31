import AccessBadge from '../components/AccessBadge';

function LoginPage() {
  return (
    <section className="page container auth-page">
      <div className="page-heading centered">
        <AccessBadge label="מסך ציבורי" />
        <h1>כניסה לטיקט גארד</h1>
        <p>מסך דמו שמוכן לחיבור עתידי ל-Supabase Auth.</p>
      </div>

      <form className="card form-card auth-card">
        <label>
          אימייל
          <input type="email" placeholder="שם@דוגמה.co.il" />
        </label>
        <label>
          סיסמה
          <input type="password" placeholder="סיסמה" />
        </label>
        <button className="button button-primary" type="button">
          כניסה מדומה
        </button>
        <p className="form-note">הדוח הראשון חינם. לאחר מכן תידרש הרשמה ותשלום עתידי.</p>
      </form>
    </section>
  );
}

export default LoginPage;
