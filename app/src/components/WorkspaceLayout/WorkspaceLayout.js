import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import LedgrionyxLogo from '../branding/LedgrionyxLogo';
import { hasEquityModule } from '../../utils/workspaceModules';
import './WorkspaceLayout.css';

/* ─────────────────────────────────────────────────────────────────────────────
   WorkspaceLayout — full sidebar layout for workspace-scoped module pages.
   Completely isolated from the Ledgrionyx Console — no console data, no
   console nav, no console permissions cross this boundary.
───────────────────────────────────────────────────────────────────────────── */

const WorkspaceLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { activeWorkspace, entities, setActiveWorkspace, getWorkspacePermissionSummary } = useEnterprise();
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  // ── Sync activeWorkspace with the URL workspaceId ─────────────────────────
  // On every render, if the URL param doesn't match context (e.g. direct link,
  // page refresh, or navigating between workspaces), find the correct entity
  // and activate it so the whole layout/children have the right data.
  const resolvedWs = React.useMemo(() => {
    if (!workspaceId) return activeWorkspace;
    // Already the right workspace
    if (activeWorkspace && String(activeWorkspace.id) === String(workspaceId)) {
      return activeWorkspace;
    }
    // Try entities list first
    const fromList = (entities || []).find(e => String(e.id) === String(workspaceId));
    if (fromList) return fromList;
    // Fall back to localStorage snapshot
    try {
      const saved = localStorage.getItem('ledgrionyx_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (String(parsed.id) === String(workspaceId)) return parsed;
      }
    } catch { /* ignore */ }
    return activeWorkspace;
  }, [workspaceId, activeWorkspace, entities]);

  // Sync context when resolved workspace differs from context
  useEffect(() => {
    if (resolvedWs && String(resolvedWs.id) !== String(activeWorkspace?.id)) {
      setActiveWorkspace(resolvedWs);
    }
  }, [resolvedWs, activeWorkspace, setActiveWorkspace]);

  const wsId   = workspaceId || resolvedWs?.id;
  const wsName = resolvedWs?.name || 'Workspace';
  const equityEnabled = hasEquityModule(resolvedWs);
  const permissionSummary = getWorkspacePermissionSummary(wsId);
  const sectionAccess = permissionSummary?.workspace_sections || {};
  const visibleDepartments = permissionSummary?.visible_departments || [];

  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const base = wsId ? `/app/workspace/${wsId}` : '/app/workspace';

  // ── Workspace sidebar navigation ──────────────────────────────────────────
  const coreModules = [
    { key: 'overview', to: `${base}/overview`, label: 'Overview' },
    { key: 'members', to: `${base}/members`, label: 'Members' },
    { key: 'departments', to: `${base}/departments`, label: 'Departments' },
    { key: 'meetings', to: `${base}/meetings`, label: 'Meetings' },
    { key: 'calendar', to: `${base}/calendar`, label: 'Calendar' },
    { key: 'files', to: `${base}/files`, label: 'Files' },
  ];

  const managementModules = [
    { key: 'permissions', to: `${base}/permissions`, label: 'Permissions' },
    { key: 'settings', to: `${base}/settings`, label: 'Settings' },
  ];

  const optionalModules = [
    { key: 'email', to: `${base}/email`, label: 'Email' },
    { key: 'marketing', to: `${base}/marketing`, label: 'Marketing' },
  ];

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const renderNavItems = (items) =>
    items
      .filter(({ key }) => !permissionSummary || sectionAccess[key])
      .map(({ to, label }) => (
      <li key={to}>
        <NavLink
          to={to}
          className={({ isActive }) => `ws-nav-link${isActive ? ' active' : ''}`}
          title={sidebarMinimized ? label : undefined}
        >
          {!sidebarMinimized && <span className="ws-nav-label">{label}</span>}
          {sidebarMinimized && <span className="ws-nav-abbr">{label.charAt(0)}</span>}
        </NavLink>
      </li>
    ));

  const renderSection = (label, items) => (
    <React.Fragment key={label}>
      {!sidebarMinimized && (
        <li className="ws-nav-section-label">{label}</li>
      )}
      {renderNavItems(items)}
    </React.Fragment>
  );

  return (
    <div className={`ws-layout ws-with-sidebar${sidebarMinimized ? ' ws-sidebar-minimized' : ''}`}>

      {/* ── SIDEBAR ───────────────────────────────────────────────── */}
      <nav className={`ws-sidebar${sidebarMinimized ? ' minimized' : ''}`} aria-label="Workspace navigation">

        {/* Sidebar header */}
        <div className="ws-sidebar-header">
          {!sidebarMinimized && (
            <div className="ws-sidebar-brand">
              <LedgrionyxLogo variant="white" size="small" withText={false} />
              <div className="ws-sidebar-brand-text">
                <span className="ws-sidebar-title">{wsName}</span>
                <span className="ws-sidebar-sub">Workspace</span>
              </div>
            </div>
          )}
          {sidebarMinimized && (
            <div className="ws-sidebar-brand-min">
              <LedgrionyxLogo variant="white" size="small" withText={false} />
            </div>
          )}
          <button
            className="ws-sidebar-toggle"
            onClick={() => setSidebarMinimized(m => !m)}
            title={sidebarMinimized ? 'Expand' : 'Collapse'}
          >
            {sidebarMinimized ? '→' : '←'}
          </button>
        </div>

        {/* Back to console */}
        {!sidebarMinimized && (
          <button
            className="ws-back-to-console"
            onClick={() => navigate('/app/console')}
          >
            ← Back to Console
          </button>
        )}

        {/* Navigation */}
        <ul className="ws-nav-menu">
          {renderSection('Workspace', coreModules)}
          <li className="ws-nav-divider" />
          {renderSection('Management', managementModules)}
          <li className="ws-nav-divider" />
          {renderSection('Optional', optionalModules)}
          {visibleDepartments.length > 0 && !sidebarMinimized && (
            <>
              <li className="ws-nav-divider" />
              <li className="ws-nav-section-label">Departments</li>
              <li className="ws-department-sidebar-list">
                {visibleDepartments.map((department) => (
                  <div key={department.id} className="ws-department-sidebar-item">
                    <span className="ws-department-sidebar-name">{department.name}</span>
                    <span className="ws-department-sidebar-meta">{department.cost_center || 'Scoped access'}</span>
                  </div>
                ))}
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* ── MAIN AREA ─────────────────────────────────────────────── */}
      <div className="ws-main-area">

        {/* Top bar */}
        <header className="ws-topbar">
          <div className="ws-topbar-left">
            <h2 className="ws-topbar-title">{wsName}</h2>
            <span className="ws-env-badge">{equityEnabled ? 'Finance + Equity Ready' : 'Active'}</span>
          </div>

          <div className="ws-topbar-right" ref={profileRef}>
            <button
              className="ws-avatar-btn"
              onClick={() => setProfileOpen(o => !o)}
              aria-label="Profile menu"
            >
              {userInitial}
            </button>
            {profileOpen && (
              <div className="ws-dropdown">
                <div className="ws-dropdown-header">
                  <div className="ws-dropdown-avatar">{userInitial}</div>
                  <div>
                    <div className="ws-dropdown-name">{user?.name || 'User'}</div>
                    <div className="ws-dropdown-email">{user?.email || ''}</div>
                  </div>
                </div>
                <div className="ws-dropdown-divider" />
                <div className="ws-dropdown-ws-row">
                  <span className="ws-dropdown-ws-label">Workspace</span>
                  <span className="ws-dropdown-ws-name">{wsName}</span>
                </div>
                <button
                  className="ws-dropdown-item"
                  onClick={() => { setProfileOpen(false); navigate('/app/console'); }}
                >
                  ← Back to Console
                </button>
                <div className="ws-dropdown-divider" />
                <button
                  className="ws-dropdown-item ws-dropdown-logout"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="ws-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
