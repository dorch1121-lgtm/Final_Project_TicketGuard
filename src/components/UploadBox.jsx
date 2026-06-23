import Icon from './Icon';

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadBox({ fileName, fileSize, isLoading, errorMessage, onFileChange, onAnalyze }) {
  const hasFile = Boolean(fileName);

  return (
    <section className="upload-panel card">
      <div className="upload-panel-header">
        <h1>העלאת דוח לבדיקה</h1>
        <p>העלה את דוח התנועה שלך בפורמט PDF לקבלת הערכת סיכויים מיידית.</p>
        <span>(בדיקה ראשונה בחינם · PDF בלבד · עד 10MB)</span>
      </div>

      <label className={`upload-dropzone ${hasFile ? 'file-active' : ''}`}>
        <input
          type="file"
          accept="application/pdf,.pdf"
          onChange={onFileChange}
          disabled={isLoading}
          aria-label="בחירת קובץ PDF להעלאה"
        />
        <Icon name={hasFile ? 'picture_as_pdf' : 'upload_file'} className="upload-main-icon" />
        <strong>{hasFile ? fileName : 'גרור ושחרר את הקובץ כאן'}</strong>
        <small>
          {hasFile
            ? `קובץ PDF מוכן לבדיקה${fileSize ? ` · ${formatFileSize(fileSize)}` : ''}`
            : 'או לחץ לבחירת קובץ PDF מהמחשב'}
        </small>
      </label>

      {errorMessage ? (
        <p className="form-error" role="alert">
          <Icon name="error" />
          {errorMessage}
        </p>
      ) : null}

      <button
        className="button button-primary upload-analyze-button"
        type="button"
        onClick={onAnalyze}
        disabled={isLoading || !hasFile}
      >
        {isLoading ? (
          'מעלה ובודק את הדוח...'
        ) : (
          <>
            <Icon name="fact_check" />
            התחלת ניתוח דוח
          </>
        )}
      </button>
    </section>
  );
}

export default UploadBox;
