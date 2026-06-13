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

## Module 8 - Supabase Preparation

Module 8 preparation includes a Supabase schema file:

`SUPABASE_SCHEMA.sql`

The schema defines the planned TicketGuard backend tables, including profiles, report cases, analysis data, payments, admin invitations, and role audit logs. RLS policies are not enabled yet.

## Module 8 - Supabase Setup

The Supabase client setup was added in `src/lib/supabase.js`.

Environment variables are required before connecting the app to your Supabase project. Create a local `.env` file from `.env.example` and fill in your Supabase project URL and publishable/anon key.

Never commit `.env` to GitHub.

## Module 8 - RLS Security

Row Level Security policies were added in `RLS_POLICIES.sql`.

The policies limit regular users to their own data, allow admins to access only exceptional cases that require manual review, and reserve admin invitations and role permission changes for the `super_admin` role.

## Module 8 - Storage

A private Supabase Storage bucket named `report-pdfs` was created for uploaded report PDFs.

`STORAGE_POLICIES.sql` contains the bucket access policies. Uploaded PDF files should use the path format `user_id/report_case_id/file_name.pdf`.

The bucket is intended for PDF reports only.

## Module 8 - Real Upload Flow

`UploadReportPage` now uploads PDF files to Supabase Storage and creates report records in Supabase tables.

AI/OCR is still mocked for now; the app stores realistic mock analysis data when permitted by RLS and falls back to existing mock display data when needed.

RLS and Storage policies protect user report data.

## Legal Note

המערכת מספקת הערכה בלבד ואינה מהווה ייעוץ משפטי. אין באפליקציה התחייבות לביטול הדוח.
