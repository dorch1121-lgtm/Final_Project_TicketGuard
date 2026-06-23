import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Icon from '../components/Icon';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { getCurrentUser } from '../lib/auth';
import { getUserReportCases } from '../lib/reportService';
import { mapReportCaseToCaseItem, reportStatusOptions } from '../lib/statusUtils';

function MyReportsPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadCases() {
      setLoading(true);
      setErrorMessage('');

      const { data: userData, error: userError } = await getCurrentUser();

      if (!isActive) return;

      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserReportCases(userData.user.id);
        if (!isActive) return;
        setCases(data.map(mapReportCaseToCaseItem));
      } catch (error) {
        if (!isActive) return;
        console.error('[MyReportsPage] failed to load report cases:', error);
        setErrorMessage('לא ניתן היה לטעון את הדוחות שלך כרגע.');
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadCases();
    return () => { isActive = false; };
  }, []);

  const filteredCases = cases.filter((caseItem) => {
    const matchesStatus = !statusFilter || caseItem.statusRaw === statusFilter;
    const trimmedQuery = searchQuery.trim();
    const matchesQuery =
      !trimmedQuery ||
      caseItem.authority?.includes(trimmedQuery) ||
      caseItem.type?.includes(trimmedQuery) ||
      String(caseItem.id).includes(trimmedQuery);

    return matchesStatus && matchesQuery;
  });

  const hasResults = filteredCases.length > 0;
  const hasAnyCases = cases.length > 0;
  const isFiltering = Boolean(searchQuery.trim() || statusFilter);

  return (
    <div className="auth-page-content">
      <PageHeader
        title="הדוחות שלי"
        description="כל הדוחות שהעלית, סטטוס הטיפול בהם והפרטים המלאים."
        actions={
          <Link to="/upload" className="button button-primary">
            <Icon name="upload_file" />
            העלאת דוח חדש
          </Link>
        }
      />

      {hasAnyCases && (
        <div className="admin-toolbar card reports-toolbar">
          <div className="search-input-wrap">
            <Icon name="search" />
            <input
              type="search"
              placeholder="חיפוש לפי רשות, סוג דוח או מזהה..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="חיפוש דוחות"
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="סינון לפי סטטוס"
          >
            {reportStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <LoadingSpinner label="טוען דוחות..." />
      ) : errorMessage ? (
        <ErrorState description={errorMessage} />
      ) : hasResults ? (
        <div className="cases-grid">
          {filteredCases.map((caseItem) => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      ) : hasAnyCases && isFiltering ? (
        <EmptyState
          icon={<Icon name="search_off" />}
          title="לא נמצאו דוחות"
          description="נסה לשנות את החיפוש או הסינון."
          action={
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('');
              }}
            >
              איפוס סינון
            </button>
          }
        />
      ) : (
        <EmptyState
          icon={<Icon name="folder_open" />}
          title="לא נמצאו דוחות"
          description="עדיין לא העלית דוחות לבדיקה."
          action={
            <Link to="/upload" className="button button-primary">
              <Icon name="upload_file" />
              העלה דוח ראשון
            </Link>
          }
        />
      )}
    </div>
  );
}

export default MyReportsPage;
