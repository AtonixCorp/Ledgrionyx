import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEnterprise } from '../context/EnterpriseContext';

/**
 * WorkspaceRoute — guards workspace-scoped routes.
 * Requires authentication AND a resolvable workspace for the URL :workspaceId.
 * Also syncs activeWorkspace from the entities list if context is stale/null.
 */
const WorkspaceRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { activeWorkspace, entities, fetchWorkspacePermissionSummary, getWorkspacePermissionSummary } = useEnterprise();
  const location = useLocation();
  const { workspaceId } = useParams();
  const [permissionLoading, setPermissionLoading] = React.useState(true);
  const [permissionDenied, setPermissionDenied] = React.useState(false);

  let resolvedWorkspace = null;

  if (workspaceId) {
    // 1. Active context matches URL
    if (activeWorkspace && String(activeWorkspace.id) === String(workspaceId)) {
      resolvedWorkspace = activeWorkspace;
    }
    // 2. Find it in the already-loaded entities list
    if (!resolvedWorkspace) {
      resolvedWorkspace = (entities || []).find(e => String(e.id) === String(workspaceId)) || null;
    }
    // 3. Fall back to localStorage snapshot
    if (!resolvedWorkspace) {
      try {
        const saved = localStorage.getItem('atc_active_workspace');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (String(parsed.id) === String(workspaceId)) resolvedWorkspace = parsed;
        }
      } catch { /* ignore */ }
    }
  } else {
    // No workspaceId in URL — accept whatever is active
    resolvedWorkspace = activeWorkspace || (() => {
      try {
        const saved = localStorage.getItem('atc_active_workspace');
        return saved ? JSON.parse(saved) : null;
      } catch { return null; }
    })();
  }

  const resolvedWorkspaceId = resolvedWorkspace?.id || workspaceId || null;
  const permissionSummary = getWorkspacePermissionSummary(resolvedWorkspaceId);

  React.useEffect(() => {
    let active = true;
    setPermissionLoading(true);
    setPermissionDenied(false);

    if (!resolvedWorkspaceId || !isAuthenticated) {
      setPermissionLoading(false);
      return () => {
        active = false;
      };
    }

    fetchWorkspacePermissionSummary(resolvedWorkspaceId)
      .then((summary) => {
        if (!active) return;
        const pathParts = location.pathname.split('/').filter(Boolean);
        const workspaceIndex = pathParts.indexOf('workspace');
        const equityIndex = pathParts.indexOf('equity');

        if (workspaceIndex >= 0) {
          const section = pathParts[workspaceIndex + 2] || 'overview';
          setPermissionDenied(!summary?.workspace_sections?.[section]);
        } else if (equityIndex >= 0) {
          const section = pathParts[equityIndex + 2] || 'registry';
          setPermissionDenied(!summary?.equity_sections?.[section]);
        } else {
          setPermissionDenied(false);
        }
      })
      .catch(() => {
        if (!active) return;
        setPermissionDenied(true);
      })
      .finally(() => {
        if (active) {
          setPermissionLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [fetchWorkspacePermissionSummary, isAuthenticated, location.pathname, resolvedWorkspaceId]);

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

  if (!resolvedWorkspace) {
    return <Navigate to="/app/console" state={{ from: location }} replace />;
  }

  if (permissionLoading && !permissionSummary) {
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

  if (permissionDenied) {
    return <Navigate to="/app/console" state={{ from: location }} replace />;
  }

  return children;
};

export default WorkspaceRoute;
