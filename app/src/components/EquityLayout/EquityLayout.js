import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import ATCLogo from '../branding/ATCLogo';
import { getWorkspaceLandingPath } from '../../utils/workspaceModules';
import './EquityLayout.css';

const EquityLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { activeWorkspace, entities, setActiveWorkspace, getWorkspacePermissionSummary } = useEnterprise();
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const [sidebarMinimized, setSidebarMinimized] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const resolvedWorkspace = useMemo(() => {
    if (!workspaceId) return activeWorkspace;
    if (activeWorkspace && String(activeWorkspace.id) === String(workspaceId)) {
      return activeWorkspace;
    }
    const fromList = (entities || []).find((entity) => String(entity.id) === String(workspaceId));
    if (fromList) return fromList;
    try {
      const saved = localStorage.getItem('atc_active_workspace');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (String(parsed.id) === String(workspaceId)) return parsed;
      }
    } catch {
      return activeWorkspace;
    }
    return activeWorkspace;
  }, [activeWorkspace, entities, workspaceId]);

  useEffect(() => {
    if (resolvedWorkspace && String(resolvedWorkspace.id) !== String(activeWorkspace?.id)) {
      setActiveWorkspace(resolvedWorkspace);
    }
  }, [activeWorkspace, resolvedWorkspace, setActiveWorkspace]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
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

  const base = workspaceId ? `/app/equity/${workspaceId}` : '/app/equity';
  const permissionSummary = getWorkspacePermissionSummary(workspaceId || resolvedWorkspace?.id);
  const navItems = [
    { key: 'me', to: `${base}/me`, label: 'My Equity' },
    { key: 'registry', to: `${base}/registry`, label: 'Ownership Registry' },
    { key: 'cap-table', to: `${base}/cap-table`, label: 'Cap Table' },
    { key: 'grants', to: `${base}/grants`, label: 'Vesting & Grants' },
    { key: 'exercises', to: `${base}/exercises`, label: 'Exercise Center' },
    { key: 'automation', to: `${base}/automation`, label: 'Automation Center' },
    { key: 'valuation', to: `${base}/valuation`, label: 'Valuation' },
    { key: 'approvals', to: `${base}/approvals`, label: 'Approval Inbox' },
    { key: 'scenarios', to: `${base}/scenarios`, label: 'Scenario Modeling' },
    { key: 'transactions', to: `${base}/transactions`, label: 'Equity Transactions' },
    { key: 'governance', to: `${base}/governance`, label: 'Governance & Reporting' },
  ];

  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <div className={`eq-layout${sidebarMinimized ? ' eq-sidebar-minimized' : ''}`}>
      <nav className={`eq-sidebar${sidebarMinimized ? ' minimized' : ''}`} aria-label="Equity navigation">
        <div className="eq-sidebar-header">
          <div className="eq-brand-block">
            <ATCLogo variant="white" size="small" withText={false} />
            {!sidebarMinimized && (
              <div>
                <div className="eq-brand-title">ATC Equity</div>
                <div className="eq-brand-sub">{resolvedWorkspace?.name || 'Workspace'}</div>
              </div>
            )}
          </div>
          <button className="eq-sidebar-toggle" onClick={() => setSidebarMinimized((value) => !value)}>
            {sidebarMinimized ? '→' : '←'}
          </button>
        </div>

        {!sidebarMinimized && (
          <div className="eq-sidebar-copy">
            Equity management runs independently from the accounting workspace sidebar while staying bound to the same entity.
          </div>
        )}

        <ul className="eq-nav-list">
          {navItems.filter((item) => !permissionSummary || permissionSummary.equity_sections?.[item.key]).map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `eq-nav-link${isActive ? ' active' : ''}`}
                title={sidebarMinimized ? item.label : undefined}
              >
                <span>{sidebarMinimized ? item.label.charAt(0) : item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="eq-sidebar-footer">
          <button className="eq-sidebar-btn" onClick={() => navigate(getWorkspaceLandingPath(resolvedWorkspace || {}))}>
            {sidebarMinimized ? 'F' : 'Finance Workspace'}
          </button>
          <button className="eq-sidebar-btn secondary" onClick={() => navigate('/app/console')}>
            {sidebarMinimized ? 'C' : 'Console'}
          </button>
        </div>
      </nav>

      <div className="eq-main-shell">
        <header className="eq-topbar">
          <div>
            <div className="eq-topbar-kicker">ATC Equity Management</div>
            <h1 className="eq-topbar-title">{resolvedWorkspace?.name || 'Equity Workspace'}</h1>
          </div>
          <div className="eq-topbar-right" ref={profileRef}>
            <span className="eq-topbar-badge">Institutional Governance</span>
            <button className="eq-avatar-btn" onClick={() => setProfileOpen((value) => !value)}>
              {userInitial}
            </button>
            {profileOpen && (
              <div className="eq-profile-menu">
                <div className="eq-profile-name">{user?.name || 'User'}</div>
                <div className="eq-profile-email">{user?.email || ''}</div>
                <button className="eq-profile-item" onClick={() => navigate('/app/console')}>
                  Back to Console
                </button>
                <button className="eq-profile-item" onClick={() => navigate(getWorkspaceLandingPath(resolvedWorkspace || {}))}>
                  Open Finance Workspace
                </button>
                <button className="eq-profile-item danger" onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="eq-main-content">{children}</main>
      </div>
    </div>
  );
};

export default EquityLayout;
