import Icon from './Icon';

function UploadBox({ fileName, isLoading, errorMessage, onFileChange, onAnalyze }) {
  return (
    <section className="upload-panel card">
      <div className="upload-panel-header">
        <h1>העלאת דוח לבדיקה</h1>
        <p>העלה את דוח התנועה שלך בפורמט PDF לקבלת הערכת סיכויים מיידית.</p>
        <span>(בדיקה ראשונה בחינם)</span>
      </div>

      <label className={`upload-dropzone ${fileName ? 'file-active' : ''}`}>
        <input type="file" accept="application/pdf,.pdf" onChange={onFileChange} />
        <Icon name={fileName ? 'picture_as_pdf' : 'upload_file'} className="upload-main-icon" />
        <strong>{fileName ? fileName : 'גרור ושחרר את הקובץ כאן'}</strong>
        <small>{fileName ? 'קובץ מוכן לבדיקה' : 'או לחץ לבחירת קובץ מהמחשב'}</small>
      </label>

      {errorMessage ? (
        <p className="form-error" role="alert">
          <Icon name="error" />
          {errorMessage}
        </p>
      ) : null}

      <button className="button button-primary upload-analyze-button" onClick={onAnalyze} disabled={isLoading}>
        {isLoading ? 'מנתח את הדוח...' : 'התחלת ניתוח דוח'}
      </button>
    </section>
  );
}

export default UploadBox;
