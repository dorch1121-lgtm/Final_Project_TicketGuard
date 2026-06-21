import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import UploadBox from '../components/UploadBox';
import { legalDisclaimer } from '../data/mockData';
import { getCurrentUser } from '../lib/auth';
import {
  createFullMockReportAnalysis,
  latestReportStorageKeys,
  reportUploadErrors,
} from '../lib/reportService';

const processSteps = [
  { label: 'העלאת קובץ' },
  { label: 'בדיקה ראשונית' },
  { label: 'מעקב באזור האישי' },
];

function UploadReportPage() {
  const navigate = useNavigate();
  const [user, setUser]                     = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [fileName, setFileName]             = useState('');
  const [selectedFile, setSelectedFile]     = useState(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [errorMessage, setErrorMessage]     = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadUser() {
      const { data } = await getCurrentUser();
      if (isActive) {
        setUser(data?.user ?? null);
        setIsCheckingAuth(false);
      }
    }

    loadUser();
    return () => { isActive = false; };
  }, []);

  const validateFile = (nextFile) => {
    if (!nextFile) return reportUploadErrors.noFile;
    if (nextFile.type !== 'application/pdf') return reportUploadErrors.invalidType;
    if (nextFile.size > 10 * 1024 * 1024) return reportUploadErrors.fileTooLarge;
    return '';
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    setErrorMessage('');

    const validationError = validateFile(nextFile);

    if (validationError) {
      setFileName('');
      setSelectedFile(null);
      setErrorMessage(validationError);
      event.target.value = '';
      return;
    }

    setFileName(nextFile.name);
    setSelectedFile(nextFile);
  };

  const handleAnalyze = async () => {
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!user) {
      setErrorMessage('כדי להעלות דוח יש להתחבר למערכת');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await createFullMockReportAnalysis({
        userId: user.id,
        file: selectedFile,
      });

      localStorage.setItem(latestReportStorageKeys.reportCaseId, result.reportCase.id);

      if (result.analysisResult?.id) {
        localStorage.setItem(latestReportStorageKeys.analysisResultId, result.analysisResult.id);
      } else {
        localStorage.removeItem(latestReportStorageKeys.analysisResultId);
      }

      navigate('/result');
    } catch (error) {
      setErrorMessage(error?.message || reportUploadErrors.uploadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = isLoading ? 1 : fileName ? 0 : 0;

  return (
    <section className="upload-page container">
      <div className="upload-page-inner">
        {/* Header */}
        <div className="page-heading centered">
          <span className="eyebrow">
            <Icon name="upload_file" />
            העלאת דוח לבדיקה
          </span>
          <h1>בדיקת דוח תנועה</h1>
          <p>העלו קובץ PDF של הדוח לקבלת הערכת סיכויים מהירה.</p>
        </div>

        {/* Process steps */}
        <div className="upload-steps">
          {processSteps.map((step, i) => (
            <div key={step.label} className={`upload-step${i === currentStep ? ' active' : ''}`}>
              <div className="upload-step-num">{i + 1}</div>
              <span>{step.label}</span>
            </div>
          ))}
        </div>

        {/* Upload card */}
        {!isCheckingAuth && !user ? (
          <div className="card upload-panel">
            <div className="upload-panel-header">
              <h2 style={{ marginBottom: '0.5rem' }}>נדרשת התחברות</h2>
              <p>כדי להעלות דוח ולשמור את הניתוח באזור האישי שלך, יש להתחבר תחילה.</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="button button-primary"
                type="button"
                onClick={() => navigate('/login')}
              >
                <Icon name="login" />
                כניסה לחשבון
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => navigate('/login')}
              >
                <Icon name="person_add" />
                הרשמה חינם
              </button>
            </div>
          </div>
        ) : (
          <div className="card upload-panel">
            <UploadBox
              fileName={fileName}
              isLoading={isLoading || isCheckingAuth}
              errorMessage={errorMessage}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
            />
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="card analysis-loader" role="status" aria-live="polite">
            <div className="loader-dots">
              <span /><span /><span />
            </div>
            <p>
              <strong>מעבד את הקובץ...</strong>
            </p>
            <div className="loader-bar">
              <span />
            </div>
            <p style={{ fontSize: '0.8125rem' }}>
              מעלה קובץ ויוצר ניתוח דמו. לא מתבצע OCR או AI אמיתי בשלב זה.
            </p>
          </div>
        )}

        {/* Legal */}
        <div className="disclaimer-band">
          <strong>הבהרה</strong>
          <p style={{ marginBottom: 0, fontSize: '0.875rem' }}>{legalDisclaimer}</p>
        </div>
      </div>
    </section>
  );
}

export default UploadReportPage;
