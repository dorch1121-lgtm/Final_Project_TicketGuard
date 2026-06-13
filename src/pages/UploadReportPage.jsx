import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import UploadBox from '../components/UploadBox';
import { legalDisclaimer } from '../data/mockData';
import { getCurrentUser } from '../lib/auth';
import {
  createFullMockReportAnalysis,
  latestReportStorageKeys,
  reportUploadErrors,
} from '../lib/reportService';

function UploadReportPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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

    return () => {
      isActive = false;
    };
  }, []);

  const validateFile = (nextFile) => {
    if (!nextFile) {
      return reportUploadErrors.noFile;
    }

    if (nextFile.type !== 'application/pdf') {
      return reportUploadErrors.invalidType;
    }

    if (nextFile.size > 10 * 1024 * 1024) {
      return reportUploadErrors.fileTooLarge;
    }

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
      setErrorMessage('כדי להעלות דוח אמיתי יש להתחבר למערכת');
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

  return (
    <section className="page upload-page container">
      <div>
        <div className="page-heading centered">
          <AccessBadge label="מסך ציבורי - דוח ראשון חינם" />
        </div>

        {!isCheckingAuth && !user ? (
          <section className="upload-panel card">
            <div className="upload-panel-header">
              <h1>העלאת דוח לבדיקה</h1>
              <p>כדי להעלות דוח אמיתי יש להתחבר למערכת</p>
            </div>
            <button className="button button-primary upload-analyze-button" type="button" onClick={() => navigate('/login')}>
              מעבר להתחברות
            </button>
          </section>
        ) : (
          <UploadBox
            fileName={fileName}
            isLoading={isLoading || isCheckingAuth}
            errorMessage={errorMessage}
            onFileChange={handleFileChange}
            onAnalyze={handleAnalyze}
          />
        )}

        {isLoading ? (
          <div className="analysis-loader card" role="status" aria-live="polite">
            <div className="loader-bar">
              <span />
            </div>
            <p>מעלה את הקובץ ויוצר ניתוח דמו. לא מתבצע OCR או AI אמיתי בשלב זה.</p>
          </div>
        ) : null}

        <section className="disclaimer-band upload-disclaimer">
          <strong>הבהרה</strong>
          <p>{legalDisclaimer}</p>
        </section>
      </div>
    </section>
  );
}

export default UploadReportPage;
