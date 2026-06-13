import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminReviewPage from './pages/AdminReviewPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MissingDetailsPage from './pages/MissingDetailsPage';
import NotFoundPage from './pages/NotFoundPage';
import UploadReportPage from './pages/UploadReportPage';
import UserDashboardPage from './pages/UserDashboardPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadReportPage />} />
        <Route path="/missing-details" element={<MissingDetailsPage />} />
        <Route path="/result" element={<AnalysisResultPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminReviewPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
