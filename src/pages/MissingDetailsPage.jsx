import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import { getCurrentReportDetails, saveMissingReportDetails } from '../services/reportWorkflow';

function MissingDetailsPage() {
  const navigate = useNavigate();
  const reportDetails = getCurrentReportDetails();
  const [formData, setFormData] = useState({
    reportNumber: '',
    violationTime: '',
    driverNotes: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await saveMissingReportDetails(formData);
    navigate(result.nextRoute);
  };

  return (
    <section className="page container">
      <div className="page-heading">
        <AccessBadge label="מסך ציבורי - המשך בדיקה" />
        <h1>השלמת פרטים חסרים</h1>
        <p>כדי לשפר את איכות ההערכה, ניתן להשלים מידע שלא זוהה מתוך המסמך.</p>
      </div>

      <div className="two-column">
        <form className="card form-card" onSubmit={handleSubmit}>
          <label>
            מספר דוח מלא
            <input
              name="reportNumber"
              value={formData.reportNumber}
              onChange={handleChange}
              placeholder="לדוגמה: 2026-44821"
            />
          </label>
          <label>
            שעת ביצוע העבירה
            <input
              name="violationTime"
              value={formData.violationTime}
              onChange={handleChange}
              placeholder="לדוגמה: 08:42"
            />
          </label>
          <label>
            נסיבות או הערות הנהג
            <textarea
              name="driverNotes"
              value={formData.driverNotes}
              onChange={handleChange}
              placeholder="כתבו בקצרה מה קרה בפועל"
              rows="5"
            />
          </label>
          <button className="button button-primary" type="submit">
            המשך לתוצאה
          </button>
        </form>

        <aside className="card side-panel">
          <h2>זוהה במסמך</h2>
          <dl className="details-list">
            <div>
              <dt>שם קובץ</dt>
              <dd>{reportDetails.fileName}</dd>
            </div>
            <div>
              <dt>תאריך עבירה</dt>
              <dd>{reportDetails.violationDate}</dd>
            </div>
            <div>
              <dt>מיקום</dt>
              <dd>{reportDetails.location}</dd>
            </div>
          </dl>
          <h3>חסרים כרגע</h3>
          <ul className="check-list">
            {reportDetails.missingFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

export default MissingDetailsPage;
