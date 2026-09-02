import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import theme from './theme/theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import HomeRedirect from './routes/HomeRedirect';
import AppLayout from './components/Layout/AppLayout';
import MinimalLayout from './components/Layout/MinimalLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddChallan from './pages/AddChallan';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Operational Admin routes (challan creation, reports, etc.) */}
              <Route
                element={
                  <ProtectedRoute allow={['admin']}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-challan" element={<AddChallan />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/audit-logs" element={<AuditLogs />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* Super Admin: add/delete Sub Admins only */}
              <Route
                element={
                  <ProtectedRoute allow={['super_admin']}>
                    <MinimalLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
              </Route>

              {/* Sub Admin: manage Admins + performance overview */}
              <Route
                element={
                  <ProtectedRoute allow={['sub_admin']}>
                    <MinimalLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/sub-admin-dashboard" element={<SubAdminDashboard />} />
              </Route>

              <Route path="/" element={<HomeRedirect />} />
              <Route path="*" element={<HomeRedirect />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
