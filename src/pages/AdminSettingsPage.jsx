import Icon from '../components/Icon';
import PageHeader from '../components/PageHeader';
import { legalDisclaimer } from '../data/mockData';
import { FREE_REPORT_CURRENCY, FREE_REPORT_PRICE } from '../lib/reportAccess';
import { supabase } from '../lib/supabase';
import useAuthProfile from '../lib/useAuthProfile';

function SettingsRow({ icon, label, value, helper }) {
  return (
    <div className="settings-row">
      <div className="settings-row-icon">
        <Icon name={icon} />
      </div>
      <div className="settings-row-body">
        <span>{label}</span>
        <strong>{value}</strong>
        {helper && <small>{helper}</small>}
      </div>
    </div>
  );
}

function AdminSettingsPage() {
  const { role } = useAuthProfile();

  return (
    <div className="auth-page-content">
      <PageHeader title="הגדרות" description="תצוגת הגדרות המערכת הנוכחיות. עריכה דורשת שינוי בקוד/בבסיס הנתונים." />

      <section className="card settings-card">
        <h3>מגבלת בדיקות ותשלום</h3>
        <SettingsRow icon="redeem" label="מגבלת בדיקות חינמיות" value="1 לכל משתמש" helper="נספרת רק לאחר השלמת ניתוח בהצלחה" />
        <SettingsRow icon="payments" label="מחיר לבדיקה נוספת" value={`₪${FREE_REPORT_PRICE} ${FREE_REPORT_CURRENCY}`} />
        <SettingsRow
          icon="credit_card"
          label="ספק סליקה"
          value="לא מוגדר (placeholder)"
          helper="אישור תשלום מתבצע כרגע ידנית על ידי מנהל בעמוד התשלומים, עד לחיבור ספק סליקה אמיתי"
        />
      </section>

      <section className="card settings-card">
        <h3>גישת מנהל</h3>
        <SettingsRow icon="shield_person" label="תפקיד נוכחי" value={role === 'super_admin' ? 'מנהל ראשי' : 'מנהל'} />
        <SettingsRow
          icon="admin_panel_settings"
          label="הרשאות רגישות"
          value="מנהל ראשי בלבד"
          helper="שינוי תפקידים, איפוס בדיקה חינמית, הוספת משתמשים והשבתת משתמשים מוגבלים למנהל ראשי"
        />
      </section>

      <section className="card settings-card">
        <h3>סטטוס מערכת</h3>
        <SettingsRow
          icon="cloud_done"
          label="חיבור Supabase"
          value={supabase ? 'מחובר' : 'לא מוגדר'}
        />
        <SettingsRow icon="rule" label="מדיניות גישה (RLS)" value="פעיל" helper="הרשאות משתמש/מנהל נאכפות בבסיס הנתונים" />
      </section>

      <section className="card settings-card">
        <h3>הבהרה משפטית מוצגת למשתמשים</h3>
        <p>{legalDisclaimer}</p>
      </section>
    </div>
  );
}

export default AdminSettingsPage;
