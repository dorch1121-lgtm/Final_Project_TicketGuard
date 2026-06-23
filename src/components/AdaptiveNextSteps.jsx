import Icon from './Icon';
import { formatRiskLevel, isHighRiskLevel, selectNextStepsVariant } from '../lib/adaptiveNextSteps';

const HIGH_APPEAL_STEPS = [
  {
    title: 'בדוק את פרטי הדוח',
    description: 'ודא שמספר הדוח, התאריך, סוג העבירה, הרכב והסכום נכונים.',
  },
  {
    title: 'השלם מסמכים חסרים',
    description: 'צרף צילום דוח, צילום תעודת זהות וכל ראיה שתומכת בטענה שלך.',
  },
  {
    title: 'נסח בקשה ברורה',
    description: 'כתוב בקצרה מדוע לדעתך יש מקום לבטל את הדוח או להפחית את חומרתו.',
  },
  {
    title: 'הגש בקשה לביטול',
    description: 'בדרך כלל בקשה לביטול דוח תנועה מוגשת בתוך 30 ימים ממועד קבלת הדוח. בדוק את המועד המדויק שמופיע בדוח.',
  },
  {
    title: 'שמור אישור הגשה',
    description: 'שמור מספר פנייה, אישור שליחה, צילום מסך וכל מסמך ששלחת.',
  },
  {
    title: 'עקוב אחרי תשובה',
    description: 'אם הבקשה נדחית, בדוק האם עדיין ניתן להגיש בקשה להישפט או לנקוט פעולה אחרת לפי המועד שנמסר לך.',
  },
];

const MEDIUM_APPEAL_STEPS = [
  {
    title: 'השלם את המידע החסר',
    description: 'בדוק אם חסרים פרטים כמו מיקום מדויק, שעה, צילום הדוח, נסיבות האירוע או מסמכים תומכים.',
  },
  {
    title: 'בדוק את נקודות החולשה',
    description: 'קרא את הסעיף “נקודות חולשה” ונסה להבין אם ניתן לחזק כל נקודה באמצעות ראיה.',
  },
  {
    title: 'השווה בין האפשרויות',
    description: 'שקול אם מתאים להגיש בקשה לביטול, בקשה להישפט, בקשה להמרה באזהרה או תשלום הקנס.',
  },
  {
    title: 'בדוק מועדים',
    description: 'בקשה לביטול מוגשת בדרך כלל בתוך 30 ימים, ובקשה להישפט בדרך כלל בתוך 90 ימים ממועד קבלת הדוח. בדוק את המועד המדויק בדוח.',
  },
  {
    title: 'שקול ייעוץ מקצועי',
    description: 'אם הסכום גבוה, יש נקודות, או שקיימת השפעה על רישיון הנהיגה, כדאי לשקול ייעוץ מקצועי.',
  },
  {
    title: 'קבל החלטה',
    description: 'לאחר השלמת המידע, בחר האם להגיש בקשה או לשלם את הקנס.',
  },
];

const LOW_APPEAL_STEPS = [
  {
    title: 'בדוק שאין טעות בסיסית בדוח',
    description: 'ודא שמספר הרכב, התאריך, המקום, סוג העבירה והסכום נכונים.',
  },
  {
    title: 'בדוק אם חסר מידע חשוב',
    description: 'אם יש ראיה שלא הוזנה למערכת, ייתכן שהיא תשנה את ההערכה.',
  },
  {
    title: 'שקול אם יש סיבה אמיתית לבקשה',
    description: 'אם אין טעות, ראיה תומכת או נסיבה מיוחדת, ייתכן שלא כדאי להגיש בקשה.',
  },
  {
    title: 'בדוק את משמעות התשלום',
    description: 'לפני תשלום, ודא שאתה מבין אם התשלום נחשב כהודאה ומה ההשלכות האפשריות של הדוח.',
  },
  {
    title: 'שמור תיעוד',
    description: 'שמור את הדוח, אישור התשלום וכל מסמך קשור.',
  },
  {
    title: 'אל תפספס מועדים',
    description: 'אם בכל זאת תרצה להגיש בקשה, בדוק את המועד האחרון שמופיע בדוח ופעל בזמן.',
  },
];

const NEXT_STEP_VARIANTS = {
  high: {
    badge: 'נראה שכדאי לשקול בקשה לביטול',
    badgeTone: 'positive',
    intro:
      'על בסיס הנתונים שהוזנו, נמצאו נקודות שעשויות לתמוך בבקשה לביטול הדוח. מומלץ להשלים את המסמכים החסרים ולפעול לפי המועדים שמופיעים בדוח.',
    steps: HIGH_APPEAL_STEPS,
  },
  medium: {
    badge: 'דרושה בדיקה נוספת לפני החלטה',
    badgeTone: 'warning',
    intro:
      'נמצאו גם נקודות שעשויות לעזור וגם נקודות שעלולות להחליש את הבקשה. לפני הגשה, מומלץ להשלים מידע חסר ולבדוק אם קיימות ראיות נוספות.',
    steps: MEDIUM_APPEAL_STEPS,
  },
  low: {
    badge: 'לא נמצאו כרגע נימוקים חזקים לביטול',
    badgeTone: 'neutral',
    intro:
      'על בסיס הנתונים שהוזנו, לא נמצאו כרגע נימוקים חזקים שמעלים סיכוי משמעותי לביטול הדוח. לפני תשלום, עדיין מומלץ לבדוק שהפרטים בדוח נכונים ולהבין את המשמעות.',
    steps: LOW_APPEAL_STEPS,
  },
};

function AdaptiveNextSteps({
  appealChance,
  riskLevel,
  isExceptional = false,
  recommendation = '',
  strongPoints = [],
  weakPoints = [],
  missingDetails = [],
  status = '',
}) {
  const variantKey = selectNextStepsVariant({ appealChance, recommendation });
  const variant = NEXT_STEP_VARIANTS[variantKey];
  const showProfessionalWarning = Boolean(isExceptional) || isHighRiskLevel(riskLevel);
  const scoreText = Number.isFinite(Number(appealChance)) ? `${Math.round(Number(appealChance))}%` : 'לא זמין';

  const contextItems = [
    { label: 'סיכוי מוערך', value: scoreText },
    { label: 'רמת סיכון', value: formatRiskLevel(riskLevel) },
    { label: 'נקודות חוזק', value: strongPoints.length ? `${strongPoints.length}` : 'לא צוינו' },
    { label: 'נקודות חולשה', value: weakPoints.length ? `${weakPoints.length}` : 'לא צוינו' },
    { label: 'מידע חסר', value: missingDetails.length ? `${missingDetails.length}` : 'לא צויין' },
  ];

  return (
    <section className="card adaptive-next-steps" aria-labelledby="adaptive-next-steps-title">
      <div className="adaptive-next-steps-header">
        <span className="eyebrow">
          <Icon name="route" />
          המשך התהליך
        </span>
        <h2 id="adaptive-next-steps-title">מה כדאי לעשות הלאה?</h2>
        <span className={`adaptive-next-steps-badge adaptive-next-steps-badge-${variant.badgeTone}`}>
          {variant.badge}
        </span>
      </div>

      <p className="adaptive-next-steps-intro">{variant.intro}</p>

      {showProfessionalWarning && (
        <div className="adaptive-next-steps-warning" role="note">
          <Icon name="warning" />
          <p>
            נמצאו נקודות חריגות או סיכון גבוה יחסית. לפני הגשה, תשלום או בקשה להישפט,
            מומלץ לשקול ייעוץ מקצועי.
          </p>
        </div>
      )}

      <div className="adaptive-next-steps-context" aria-label="נתונים ששימשו לבחירת ההנחיה">
        {contextItems.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
        {status && (
          <div>
            <span>סטטוס</span>
            <strong>{status}</strong>
          </div>
        )}
      </div>

      <ol className="adaptive-next-steps-list">
        {variant.steps.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>

      <div className="adaptive-next-steps-actions">
        <a className="appeal-guidance-mini-cta" href="#appeal-submission-helper">
          <Icon name="local_post_office" />
          צריך לשלוח מסמכים? מצא נקודת דואר קרובה
        </a>
      </div>

      <div className="adaptive-next-steps-disclaimer">
        <Icon name="info" />
        <p>
          המידע הוא הכוונה כללית בלבד ואינו מהווה ייעוץ משפטי. יש לבדוק את ההנחיות
          והמועדים המדויקים שמופיעים על גבי הדוח ובאתר הרשמי.
        </p>
      </div>
    </section>
  );
}

export default AdaptiveNextSteps;
