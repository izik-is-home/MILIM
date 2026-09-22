# מילים לפסיכומטרי - משחק זיכרון

אתר Web מודרני, רספונסיבי ובעברית (RTL) ללימוד אוצר מילים לקראת הבחינה הפסיכומטרית באמצעות משחק זיכרון. האתר נבנה ללא Frameworks, בטכנולוגיות HTML5, CSS3, Vanilla JS (ES Modules) מול מסד נתונים Supabase.

## דרישות מוקדמות
1. דפדפן מודרני מבוסס Chromium, Safari או Firefox.
2. חשבון ב-[Supabase](https://supabase.com).
3. חשבון ב-[GitHub](https://github.com) (לצורך אירוח ב-GitHub Pages).

## התקנה והרצה מקומית

1. שכפלו את המאגר (או הורידו את הקבצים):
   ```bash
   git clone <repo-url>
   cd psychometric-vocabulary
   ```
2. שרת פיתוח מקומי (חובה להריץ כשרת בגלל ES Modules):
   תוכלו להשתמש בתוסף Live Server ב-VS Code או להריץ דרך הטרמינל (אם יש לכם Node.js):
   ```bash
   npx serve
   ```
3. העתיקו את `js/config.example.js` לקובץ חדש בשם `js/config.js` (הקובץ הזה מוחרג מ-Git) והזינו שם את המפתחות שקיבלתם מ-Supabase:
   ```javascript
   export const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   export const SUPABASE_PUBLISHABLE_KEY = 'YOUR_PUBLIC_ANON_KEY';
   ```

## הגדרת Supabase

1. פתחו פרויקט חדש ב-Supabase.
2. היכנסו ל-SQL Editor בפרויקט והריצו את הקבצים הבאים לפי הסדר:
   - `supabase/migrations/001_initial_schema.sql` (מבנה טבלאות)
   - `supabase/migrations/002_rls_policies.sql` (חוקי הרשאות ואבטחה)
   - `supabase/migrations/003_functions.sql` (פונקציות שמירת שיאים)
   - `supabase/migrations/004_fix_admin_rls.sql` (תיקון הרשאות מנהל)
   - `supabase/migrations/005_add_vocabulary_numbers.sql` (מספר ייחודי לכל מילה)
   - `supabase/seed.sql` (מילים לדוגמה - אופציונלי)
3. ב-Supabase Authentication, ודאו ש-Email login מופעל. תחת "Redirect URLs" יש להוסיף את הכתובת של האתר שלכם ב-GitHub Pages.
4. כעת צרו דרך ממשק ה-Auth ב-Supabase משתמש חדש עם אימייל וסיסמה שיהיה מנהל המערכת.
5. העתיקו את ה-UUID של המשתמש שנוצר.
6. גשו ל-Table Editor, בחרו בטבלת `admin_users` והכניסו שורה חדשה: ב-`user_id` הדביקו את ה-UUID שהעתקתם. כעת למשתמש זה יש הרשאות מנהל!

בממשק ניהול המילים ניתן לייבא קובץ טקסט שבו כל שורה מופרדת באמצעות `|`, והעמודות בכל שורה מופרדות באמצעות `;`:

```text
מילה;פירוש;משפט דוגמה;קטגוריה;פעיל|מילה נוספת;פירוש נוסף;;;כן
```

העמודה החמישית היא אופציונלית ומקבלת `true`/`false` או `כן`/`לא`. מספר המילה נוצר אוטומטית בבסיס הנתונים ואין להוסיף אותו לקובץ.

## פריסה ב-GitHub Pages

1. צרו Repository חדש ב-GitHub.
2. דחפו אליו את כל הקבצים (למעט `config.js` - עליו להישאר אצלכם). **שימו לב**: אין להעלות את ה-Service Role Key לאף מקום. חשפו רק את ה-Anon / Publishable key.
3. ב-Repository שלכם ב-GitHub, גשו ל-`Settings` > `Pages`.
4. תחת `Source` בחרו ב-`Deploy from a branch`.
5. בחרו בענף `main` ותיקיית `/(root)` ולחצו Save.
6. GitHub יבנה ויפרסם את האתר תוך דקות ספורות.
7. זכרו לעדכן את קובץ `config.js` בשרת לאחר ההעלאה, לחילופין אם מדובר ב-Github Pages אין שרת NodeJS ולכן ה-`config.js` שמכיל רק את ה-Anon Key צריך להיות חשוף בפרודקשן - זה בטוח ב-Supabase אם הוגדר RLS! לכן תוכלו להעלות אותו במקרה הזה או לשנות את הקוד ב-`supabase-client.js` שיקרא משתני סביבה מתהליך בניה אם תעברו למערכת בניה בעתיד.

## אבטחה ומניעת רמאות ב-Leaderboard
האתר מודד זמנים בצד לקוח (באמצעות `performance.now()`). הוא אינו חסין ב-100% ממשתמשים המנסים לזייף תוצאות דרך DevTools (למרות שהכנסת הנתונים ל-DB מוגבלת ל-RPC Function בלבד המאמתת את טווח הנתונים).
לטובת איסוף שיאים אותנטי יותר בעתיד - ניתן לייצר Serverless function שתשמור Session של התחלה וסיום מול השרת.

---
נבנה בהתאם למפרט MVB פסיכומטרי, ללא ספריות חיצוניות ובעיצוב רספונסיבי ונגיש.
