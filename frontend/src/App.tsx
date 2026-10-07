import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerificationPage } from './pages/VerificationPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentCredentialsPage } from './pages/StudentCredentialsPage';
import { StudentSkillsPage } from './pages/StudentSkillsPage';
import { StudentResumePage } from './pages/StudentResumePage';
import { StudentRecommendationsPage } from './pages/StudentRecommendationsPage';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { IssueCredentialPage } from './pages/IssueCredentialPage';
import { InstitutionCredentialsPage } from './pages/InstitutionCredentialsPage';
import { InstitutionStudentsPage } from './pages/InstitutionStudentsPage';
import { AdminDashboard } from './pages/AdminDashboard';

const ProtectedRoute: React.FC<{ allowedRoles: string[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerificationPage />} />
          <Route path="/verify/:credentialId" element={<VerificationPage />} />

          {/* Student Sub-routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <DashboardLayout role="STUDENT" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="credentials" element={<StudentCredentialsPage />} />
            <Route path="skills" element={<StudentSkillsPage />} />
            <Route path="resume" element={<StudentResumePage />} />
            <Route path="recommendations" element={<StudentRecommendationsPage />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Institution Sub-routes */}
          <Route
            path="/institution"
            element={
              <ProtectedRoute allowedRoles={['INSTITUTION', 'ADMIN']}>
                <DashboardLayout role="INSTITUTION" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<InstitutionDashboard />} />
            <Route path="issue" element={<IssueCredentialPage />} />
            <Route path="credentials" element={<InstitutionCredentialsPage />} />
            <Route path="students" element={<InstitutionStudentsPage />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Admin Sub-routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout role="ADMIN" />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="institutions" element={<AdminDashboard />} />
            <Route path="activity" element={<AdminDashboard />} />
            <Route path="" element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
