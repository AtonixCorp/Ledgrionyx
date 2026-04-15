import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEnterprise } from '../context/EnterpriseContext';

const GlobalConsoleRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isRoleResolved, loading: enterpriseLoading } = useEnterprise();
  const location = useLocation();

  if (loading || enterpriseLoading || !isRoleResolved) {
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

  return children;
};

export default GlobalConsoleRoute;