import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { homePathForRole } from '../utils/roleHome';

/**
 * Guards a route behind login, and optionally behind a specific set of
 * roles. Pass `allow={['super_admin']}` etc. to keep the three dashboards
 * from bleeding into each other; omit it for routes any logged-in user can
 * reach.
 */
export default function ProtectedRoute({ children, allow }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allow && !allow.includes(user.role)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return children;
}
