# TicketGuard

טיקט גארד היא אפליקציית React בעברית לניתוח ראשוני של דוחות תנועה, דוחות חניה וקנסות רשמיים. המשתמש מעלה דוח PDF, והמערכת מציגה תוצאת דמו עם סיכויי ערעור משוערים, נקודות חוזק, נקודות חולשה, מידע חסר והמלצה כללית.

## Main Features

- ממשק RTL בעברית
- העלאת דוח PDF לבדיקה מדומה
- ולידציה לקובץ PDF בלבד
- מצב טעינה בזמן ניתוח מדומה
- השלמת פרטים חסרים
- תצוגת תוצאת ניתוח עם אחוז סיכוי לערעור
- אזור אישי עם דוחות דמו
- מסך ניהול למקרים חריגים לבדיקה ידנית
- עיצוב Frontend מבוסס Google Stitch

## Tech Stack

- Vite
- React
- React Router
- CSS

## Run Locally

```bash
npm install
npm run dev
```

לאחר ההרצה, פתחו את כתובת הפיתוח שמופיעה בטרמינל.

## Current Status

הפרויקט נמצא בשלב Frontend בלבד:

- משתמש בנתוני דמו בלבד
- אין Backend
- אין חיבור ל-Supabase
- אין אימות משתמשים אמיתי
- אין OCR או AI אמיתי
- אין תשלום אמיתי

## Routes / Pages

- `/` - Landing page
- `/upload` - Upload report
- `/missing-details` - Missing details
- `/result` - Analysis result
- `/dashboard` - User dashboard
- `/admin` - Admin review
- `/login` - Login

## Module 7 - Data Design

The project now includes a complete data design document.

`DATA_DESIGN.md` contains entities, attributes, relationships, CRUD matrix, ERD diagram, and role-based permissions.

This prepares the project for the next backend stage with Supabase.

## Legal Note

המערכת מספקת הערכה בלבד ואינה מהווה ייעוץ משפטי. אין באפליקציה התחייבות לביטול הדוח.
