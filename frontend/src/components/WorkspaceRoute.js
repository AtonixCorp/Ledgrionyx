import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEnterprise } from '../context/EnterpriseContext';

/**
 * WorkspaceRoute — guards workspace-scoped routes.
 * Requires the user to be authenticated AND have an active workspace selected.
 * If no workspace is active, redirects to /app/console so the user can pick one.
 * The original destination is preserved in location state so the console can
 * optionally redirect back after a workspace is selected.
 */
const WorkspaceRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { activeWorkspace } = useEnterprise();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-family)',
        fontSize: 'var(--font-size-base)',
        color: 'var(--color-silver-dark)',
        background: 'var(--color-silver-very-light)',
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!activeWorkspace) {
    return <Navigate to="/app/console" state={{ from: location }} replace />;
  }

  return children;
};

export default WorkspaceRoute;
