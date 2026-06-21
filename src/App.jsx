import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
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
    <Routes>
      {/* Public pages — Navbar + Footer shell */}
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadReportPage />} />
        <Route path="/missing-details" element={<MissingDetailsPage />} />
        <Route path="/result" element={<AnalysisResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authenticated pages — Sidebar + TopBar shell */}
      <Route element={<AppLayout />}>
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
      </Route>
    </Routes>
  );
}

export default App;
