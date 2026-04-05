import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import PolicyApproval from './pages/admin/PolicyApproval';
import ServiceRequestAdmin from './pages/admin/ServiceRequestAdmin';
import AuditLogs from './pages/admin/AuditLogs';
import AcademicSettings from './pages/admin/AcademicSettings';

// HOD
import HODDashboard from './pages/hod/HODDashboard';
import HODPolicyReview from './pages/hod/HODPolicyReview';
import HODAcademicView from './pages/hod/HODAcademicView';

// Faculty
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import MyPolicies from './pages/faculty/MyPolicies';
import PolicyForm from './pages/faculty/PolicyForm';
import ServiceRequestForm from './pages/faculty/ServiceRequestForm';
import MyRequests from './pages/faculty/MyRequests';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import PolicyList from './pages/student/PolicyList';

// Layout with sidebar
const AppLayout = ({ allowedRoles }) => (
  <ProtectedRoute allowedRoles={allowedRoles}>
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  </ProtectedRoute>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <div className="h-screen overflow-y-auto">
                  <ChangePasswordPage />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route element={<AppLayout allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/policies" element={<PolicyApproval />} />
            <Route path="/admin/requests" element={<ServiceRequestAdmin />} />
            <Route path="/admin/audit" element={<AuditLogs />} />
            <Route path="/admin/academic" element={<AcademicSettings />} />
          </Route>

          {/* HOD routes */}
          <Route element={<AppLayout allowedRoles={['hod']} />}>
            <Route path="/hod/dashboard" element={<HODDashboard />} />
            <Route path="/hod/policies" element={<HODPolicyReview />} />
            <Route path="/hod/academic" element={<HODAcademicView />} />
          </Route>

          {/* Faculty routes */}
          <Route element={<AppLayout allowedRoles={['faculty']} />}>
            <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            <Route path="/faculty/policies" element={<MyPolicies />} />
            <Route path="/faculty/policies/new" element={<PolicyForm />} />
            <Route path="/faculty/policies/edit/:id" element={<PolicyForm />} />
            <Route path="/faculty/requests" element={<MyRequests />} />
            <Route path="/faculty/requests/new" element={<ServiceRequestForm />} />
          </Route>

          {/* Student routes */}
          <Route element={<AppLayout allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/policies" element={<PolicyList />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
