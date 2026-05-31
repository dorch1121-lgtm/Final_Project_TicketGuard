import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccessBadge from '../components/AccessBadge';
import UploadBox from '../components/UploadBox';
import { legalDisclaimer } from '../data/mockData';
import { analyzeUploadedReport } from '../services/reportWorkflow';

function UploadReportPage() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0];
    setErrorMessage('');

    if (!nextFile) {
      return;
    }

    if (nextFile.type !== 'application/pdf' && !nextFile.name.toLowerCase().endsWith('.pdf')) {
      setFileName('');
      setSelectedFile(null);
      setErrorMessage('ניתן להעלות קובץ PDF בלבד');
      event.target.value = '';
      return;
    }

    setFileName(nextFile.name);
    setSelectedFile(nextFile);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('יש להעלות קובץ PDF לפני תחילת הבדיקה');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await analyzeUploadedReport(selectedFile);
      setIsLoading(false);
      navigate(result.nextRoute);
    } catch {
      setErrorMessage('לא ניתן היה להשלים את הבדיקה המדומה. נסו שוב.');
      setIsLoading(false);
    }
  };

  return (
    <section className="page upload-page container">
      <div>
        <div className="page-heading centered">
          <AccessBadge label="מסך ציבורי - דוח ראשון חינם" />
        </div>

        <UploadBox
          fileName={fileName}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onFileChange={handleFileChange}
          onAnalyze={handleAnalyze}
        />

        {isLoading ? (
          <div className="analysis-loader card" role="status" aria-live="polite">
            <div className="loader-bar">
              <span />
            </div>
            <p>מנתח את הדוח שלך... אנא המתן בזמן שהמערכת סורקת את הנתונים.</p>
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
