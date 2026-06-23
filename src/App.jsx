import { Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AppLayout from './components/AppLayout';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminActivityPage from './pages/AdminActivityPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminReviewPage from './pages/AdminReviewPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MyReportsPage from './pages/MyReportsPage';
import NotFoundPage from './pages/NotFoundPage';
import PaymentPage from './pages/PaymentPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import UploadReportPage from './pages/UploadReportPage';
import UserDashboardPage from './pages/UserDashboardPage';

function App() {
  return (
    <Routes>
      {/* Landing page — self-contained minimal header/footer, no shared nav menu */}
      <Route path="/" element={<LandingPage />} />

      {/* Public pages — Navbar + Footer shell */}
      <Route element={<Layout />}>
        <Route path="/upload" element={<UploadReportPage />} />
        <Route path="/result" element={<AnalysisResultPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Authenticated user pages — Sidebar + TopBar shell */}
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
          path="/reports"
          element={
            <ProtectedRoute>
              <MyReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute>
              <ReportDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:paymentId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin pages — completely separate shell, no regular-user nav */}
      <Route element={<AdminLayout />}>
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute requireAdmin>
              <AdminPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activity"
          element={
            <ProtectedRoute requireAdmin>
              <AdminActivityPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requireAdmin>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
