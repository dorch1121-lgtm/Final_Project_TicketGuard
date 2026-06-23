import { useState } from 'react';
import Icon from './Icon';

const OFFICIAL_DRIVER_INQUIRIES_URL = 'https://www.gov.il/he/service/drivers_inquiries_forms';

function openInNewTab(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function AppealSubmissionHelper() {
  const [address, setAddress] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const handleFindPostOffice = (event) => {
    event?.preventDefault();

    const trimmedAddress = address.trim();
    if (!trimmedAddress) {
      setValidationMessage('הכנס כתובת או עיר כדי למצוא נקודת דואר קרובה.');
      return;
    }

    setValidationMessage('');
    const query = `סניף דואר קרוב ל ${trimmedAddress}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    openInNewTab(mapsUrl);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
    if (validationMessage) {
      setValidationMessage('');
    }
  };

  return (
    <section id="appeal-submission-helper" className="card appeal-submission-helper" aria-labelledby="appeal-submission-helper-title">
      <div className="appeal-submission-header">
        <span className="appeal-submission-icon">
          <Icon name="local_post_office" />
        </span>
        <div>
          <h2 id="appeal-submission-helper-title">אפשרויות הגשה ושליחה לפי כתובת</h2>
          <p>
            הדרך הרשמית והמומלצת היא הגשה מקוונת. אם תרצה לשלוח מסמכים בדואר רשום,
            נוכל לעזור לך למצוא נקודת דואר קרובה לשליחת מסמכים.
          </p>
        </div>
      </div>

      <form className="appeal-submission-search" onSubmit={handleFindPostOffice} noValidate>
        <label htmlFor="postal-service-address" className="visually-hidden">
          הכנס כתובת או עיר
        </label>
        <input
          id="postal-service-address"
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="הכנס כתובת או עיר"
          aria-invalid={Boolean(validationMessage)}
          aria-describedby="postal-service-address-note postal-service-address-error"
        />
        <button type="submit" className="button button-primary">
          <Icon name="search" />
          מצא נקודת דואר קרובה
        </button>
        <a
          className="button button-secondary"
          href={OFFICIAL_DRIVER_INQUIRIES_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="open_in_new" />
          פתח הגשה מקוונת רשמית
        </a>
      </form>

      {validationMessage && (
        <p id="postal-service-address-error" className="appeal-submission-error" role="alert">
          {validationMessage}
        </p>
      )}

      <div className="appeal-submission-options" aria-label="אפשרויות הגשה רשמיות">
        <article className="appeal-submission-option">
          <div className="appeal-submission-option-title">
            <Icon name="language" />
            <h3>הגשה מקוונת למרכז פניות נהגים</h3>
          </div>
          <p>
            מומלץ להגיש את הבקשה דרך השירות הרשמי של משטרת ישראל. בדוק את ההנחיות
            המדויקות בדוח ובאתר הרשמי לפני השליחה.
          </p>
          <a
            className="button button-secondary button-sm"
            href={OFFICIAL_DRIVER_INQUIRIES_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            פתח שירות רשמי
            <Icon name="open_in_new" />
          </a>
        </article>

        <article className="appeal-submission-option">
          <div className="appeal-submission-option-title">
            <Icon name="mark_email_read" />
            <h3>שליחה בדואר רשום</h3>
          </div>
          <p>
            ניתן לשלוח מסמכים לכתובת: מרכז פניות נהגים ארצי, ת.ד. 120,
            פתח תקווה, מיקוד 4910002.
          </p>
          <small>משלוח בדואר רשום יכול לשמש כאישור משלוח.</small>
          <button type="button" className="button button-secondary button-sm" onClick={handleFindPostOffice}>
            פתח ניווט/חיפוש במפות
            <Icon name="map" />
          </button>
        </article>
      </div>

      <div className="appeal-submission-footer">
        <span>
          <Icon name="privacy_tip" />
          הכתובת משמשת רק לחיפוש נקודות שירות ואינה נשמרת במערכת.
        </span>
        <span>
          <Icon name="info" />
          המידע הוא הכוונה כללית בלבד ואינו מהווה ייעוץ משפטי.
        </span>
      </div>

      <p id="postal-service-address-note" className="visually-hidden">
        החיפוש נפתח בלשונית חדשה של Google Maps ואינו נשמר במערכת TicketGuard.
      </p>
    </section>
  );
}

export default AppealSubmissionHelper;
