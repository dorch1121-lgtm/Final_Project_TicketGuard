import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FreeReportNotice from '../components/FreeReportNotice';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PaymentRequiredCard from '../components/PaymentRequiredCard';
import UploadBox from '../components/UploadBox';
import { legalDisclaimer } from '../data/mockData';
import { getCurrentUser } from '../lib/auth';
import {
  completeReportAnalysis,
  createPaymentIntent,
  getMyAccessStatus,
  getReportCase,
  verifyPaidAccess,
} from '../lib/reportAccess';
import {
  createReportCase,
  latestReportStorageKeys,
  reportUploadErrors,
  runMockAnalysisPipeline,
} from '../lib/reportService';

const processSteps = [
  { label: 'העלאת קובץ' },
  { label: 'בדיקה ראשונית' },
  { label: 'מעקב באזור האישי' },
];

const userFacingAnalysisErrors = {
  missingProfile: 'לא נמצא פרופיל משתמש. נסה להתנתק ולהתחבר מחדש.',
  permission: 'אין הרשאה לבצע את הפעולה הזו.',
  upload: 'העלאת הקובץ נכשלה. נסה שוב.',
  analysis: 'לא הצלחנו להתחיל את ניתוח הדוח. נסה שוב בעוד רגע.',
};

function getUserFacingAnalysisError(error) {
  const message = String(error?.message ?? '');
  const code = String(error?.code ?? '');
  const status = String(error?.status ?? '');

  if (/profile not found/i.test(message)) {
    return userFacingAnalysisErrors.missingProfile;
  }

  if (
    code === '42501'
    || status === '403'
    || /row-level security|permission denied|forbidden|403/i.test(message)
  ) {
    return userFacingAnalysisErrors.permission;
  }

  if (
    message === reportUploadErrors.uploadFailed
    || message === reportUploadErrors.storageUploadFailed
    || /bucket|storage|upload/i.test(message)
  ) {
    return userFacingAnalysisErrors.upload;
  }

  return userFacingAnalysisErrors.analysis;
}

function UploadReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeReportCaseId = searchParams.get('reportCaseId');

  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [freeReportUsed, setFreeReportUsed] = useState(false);
  const [paidReportCase, setPaidReportCase] = useState(null);
  const [blockedReason, setBlockedReason] = useState('');

  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isStartingPayment, setIsStartingPayment] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadUserAndAccess() {
      const { data } = await getCurrentUser();
      const currentUser = data?.user ?? null;
      if (!isActive) return;
      setUser(currentUser);
      setIsCheckingAuth(false);

      if (!currentUser) {
        setIsCheckingAccess(false);
        return;
      }

      try {
        const access = await getMyAccessStatus();
        if (!isActive) return;
        setFreeReportUsed(access.freeReportUsed);

        if (resumeReportCaseId) {
          const isPaid = await verifyPaidAccess(resumeReportCaseId);
          if (!isActive) return;
          if (isPaid) {
            const reportCase = await getReportCase(resumeReportCaseId);
            if (!isActive) return;
            setPaidReportCase(reportCase);
          } else {
            setBlockedReason('payment_required');
          }
        } else if (access.freeReportUsed) {
          setBlockedReason('payment_required');
        }
      } catch (error) {
        if (!isActive) return;
        console.error('[loadUserAndAccess] failed to check account access status:', error);
        setErrorMessage('לא ניתן היה לבדוק את מצב החשבון שלך כרגע.');
      } finally {
        if (isActive) setIsCheckingAccess(false);
      }
    }

    loadUserAndAccess();
    return () => { isActive = false; };
  }, [resumeReportCaseId]);

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

  const goToPayment = async () => {
    setIsStartingPayment(true);
    setErrorMessage('');

    try {
      let reportCaseId = resumeReportCaseId;

      if (!reportCaseId) {
        const reportCase = await createReportCase({ userId: user.id });
        reportCaseId = reportCase.id;
      }

      const paymentId = await createPaymentIntent(reportCaseId);
      navigate(`/payment/${paymentId}?reportCaseId=${reportCaseId}`);
    } catch (error) {
      console.error('[goToPayment] failed to create payment intent:', error);
      setErrorMessage('משהו השתבש בזמן יצירת בקשת התשלום. נסה שוב בעוד רגע.');
    } finally {
      setIsStartingPayment(false);
    }
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

    let reportCase = paidReportCase;
    try {
      const access = await getMyAccessStatus();
      setFreeReportUsed(access.freeReportUsed);

      if (access.freeReportUsed && !paidReportCase) {
        setBlockedReason('payment_required');
        return;
      }

      if (!reportCase) {
        reportCase = await createReportCase({ userId: user.id });
      }

      const result = await runMockAnalysisPipeline({
        reportCase,
        userId: user.id,
        file: selectedFile,
      });

      const completion = await completeReportAnalysis(reportCase.id);
      if (completion?.free_report_used) {
        setFreeReportUsed(true);
      }

      localStorage.setItem(latestReportStorageKeys.reportCaseId, result.reportCase.id);

      if (result.analysisResult?.id) {
        localStorage.setItem(latestReportStorageKeys.analysisResultId, result.analysisResult.id);
      } else {
        localStorage.removeItem(latestReportStorageKeys.analysisResultId);
      }

      navigate('/result');
    } catch (error) {
      console.error('[handleAnalyze] report analysis failed:', error);
      if (error?.message?.includes('Payment required')) {
        setBlockedReason('payment_required');
      } else {
        setErrorMessage(getUserFacingAnalysisError(error));
      }

      // A failed upload/analysis deliberately leaves free_report_used unchanged.
      // The completion RPC is the only operation that consumes the free report.
    } finally {
      setIsLoading(false);
    }
  };

  const currentStep = isLoading ? 1 : 0;
  const isChecking = isCheckingAuth || isCheckingAccess;

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

        {isChecking ? (
          <div className="card">
            <LoadingSpinner label="בודק את מצב החשבון שלך..." />
          </div>
        ) : !user ? (
          <div className="card upload-panel">
            <div className="upload-panel-header">
              <h2>נדרשת התחברות</h2>
              <p>כדי להעלות דוח ולשמור את הניתוח באזור האישי שלך, יש להתחבר תחילה.</p>
            </div>
            <div className="button-row">
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
        ) : blockedReason === 'payment_required' ? (
          <PaymentRequiredCard
            price={30}
            isLoading={isStartingPayment}
            errorMessage={errorMessage}
            onContinue={goToPayment}
            onBack={() => navigate('/dashboard')}
          />
        ) : (
          <>
            <FreeReportNotice freeReportUsed={freeReportUsed && !paidReportCase} />
            <UploadBox
              fileName={fileName}
              fileSize={selectedFile?.size}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onFileChange={handleFileChange}
              onAnalyze={handleAnalyze}
            />
          </>
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
