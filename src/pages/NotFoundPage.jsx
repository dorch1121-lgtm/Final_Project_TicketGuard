import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="page container not-found">
      <div className="card empty-state">
        <span className="eyebrow">404</span>
        <h1>העמוד לא נמצא</h1>
        <p>ייתכן שהקישור השתנה או שהעמוד עדיין לא נבנה.</p>
        <Link to="/" className="button button-primary">
          חזרה לדף הבית
        </Link>
      </div>
    </section>
  );
}

export default NotFoundPage;
