import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Layout from './components/CeaserLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import TenantAdminRoute from './components/TenantAdminRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardPage from './pages/DashboardPage';
import CampaignsPage from './pages/CampaignsPage';
import CreativesPage from './pages/CreativesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import TeamManagementPage from './pages/TeamManagementPage';

// Admin Pages
import {
  AdminDashboardPage,
  TenantsManagementPage,
  BillingManagementPage,
  SupportTicketsPage,
  SystemSettingsPage,
} from './pages/admin';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>
          <Router>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/campaigns" element={
              <ProtectedRoute>
                <Layout>
                  <CampaignsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/creatives" element={
              <ProtectedRoute>
                <Layout>
                  <CreativesPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/billing" element={
              <ProtectedRoute>
                <Layout>
                  <BillingPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Team Management - Tenant Admin Only */}
            <Route path="/team" element={
              <ProtectedRoute>
                <TenantAdminRoute>
                  <Layout>
                    <TeamManagementPage />
                  </Layout>
                </TenantAdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Admin routes - Super Admin Only */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <Layout>
                    <AdminDashboardPage />
                  </Layout>
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/tenants" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <Layout>
                    <TenantsManagementPage />
                  </Layout>
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/billing" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <Layout>
                    <BillingManagementPage />
                  </Layout>
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/support" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <Layout>
                    <SupportTicketsPage />
                  </Layout>
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <SuperAdminRoute>
                  <Layout>
                    <SystemSettingsPage />
                  </Layout>
                </SuperAdminRoute>
              </ProtectedRoute>
            } />
            
            {/* Redirect to dashboard for any unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
