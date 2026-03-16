import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import ATCLogo from '../../components/branding/ATCLogo';
import './GlobalConsole.css';

/* ─────────────────────────────────────────────────────────────────────────────
   ATC Capital — Global Console
   The cross-company control center a user sees immediately after login.
   Shows: My Workspaces · Global Notifications · Global Tasks · Quick Actions
───────────────────────────────────────────────────────────────────────────── */

const INDUSTRY_LABELS = {
  technology: 'Technology',
  finance: 'Finance',
  healthcare: 'Healthcare',
  retail: 'Retail',
  manufacturing: 'Manufacturing',
  real_estate: 'Real Estate',
  consulting: 'Consulting',
  other: 'Other',
};

const STATUS_META = {
  active:   { label: 'Active',   cls: 'status-active' },
  inactive: { label: 'Inactive', cls: 'status-inactive' },
  pending:  { label: 'Pending',  cls: 'status-pending' },
};

const ROLE_LABELS = {
  ORG_OWNER:        'Owner',
  CFO:              'CFO',
  FINANCE_ANALYST:  'Analyst',
  VIEWER:           'Viewer',
  EXTERNAL_ADVISOR: 'Advisor',
};

// ─── derive simple workspace cards from entities ─────────────────────────────
function buildWorkspaceCards(entities, currentUserRole) {
  return entities.map((e) => ({
    id: e.id,
    name: e.name,
    country: e.country || '—',
    currency: e.local_currency || 'USD',
    entityType: e.entity_type || 'corporation',
    industry: INDUSTRY_LABELS[e.industry] || e.industry || '—',
    status: e.status || 'active',
    role: ROLE_LABELS[currentUserRole] || 'Member',
    registrationNumber: e.registration_number || null,
    fiscalYearEnd: e.fiscal_year_end || null,
  }));
}

// ─── helper: colour class for workspace card accent ──────────────────────────
const PALETTE = ['ws-indigo', 'ws-teal', 'ws-violet', 'ws-rose', 'ws-amber', 'ws-sky'];
const palette = (idx) => PALETTE[idx % PALETTE.length];

const GlobalConsole = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    entities,
    currentOrganization,
    organizations,
    activeWorkspace,
    setActiveWorkspace,
    globalNotifications,
    fetchGlobalNotifications,
    currentUserRole,
    loading,
    complianceDeadlines,
  } = useEnterprise();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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

  // Derive global tasks from compliance deadlines
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (fetchGlobalNotifications) fetchGlobalNotifications();
  }, [fetchGlobalNotifications]);

  useEffect(() => {
    // Build global tasks from overdue/upcoming deadlines
    const now = new Date();
    const derived = (complianceDeadlines || [])
      .filter((d) => {
        const dl = d.deadline_date ? new Date(d.deadline_date) : null;
        return dl && Math.ceil((dl - now) / 86400000) <= 30;
      })
      .slice(0, 6)
      .map((d, i) => {
        const dl = new Date(d.deadline_date);
        const days = Math.ceil((dl - now) / 86400000);
        return {
          id: d.id || i,
          title: d.title,
          type: d.deadline_type || 'compliance',
          due: d.deadline_date,
          daysLeft: days,
          priority: days <= 0 ? 'overdue' : days <= 7 ? 'high' : 'medium',
        };
      });
    setTasks(derived);
  }, [complianceDeadlines]);

  // Filtered workspaces
  const workspaceCards = buildWorkspaceCards(entities, currentUserRole);
  const filtered = workspaceCards.filter((w) => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenWorkspace = (workspace) => {
    const entity = entities.find((e) => e.id === workspace.id);
    if (entity) {
      setActiveWorkspace(entity);
      navigate('/app/overview/dashboard');
    }
  };

  const handleOpenLastWorkspace = () => {
    if (activeWorkspace) {
      navigate('/app/overview/dashboard');
    } else if (entities.length > 0) {
      setActiveWorkspace(entities[0]);
      navigate('/app/overview/dashboard');
    }
  };

  const notifs = globalNotifications && globalNotifications.length > 0
    ? globalNotifications
    : (complianceDeadlines || []).slice(0, 4).map((d, i) => {
        const dl = d.deadline_date ? new Date(d.deadline_date) : null;
        const days = dl ? Math.ceil((dl - new Date()) / 86400000) : null;
        return {
          id: d.id || i,
          type: 'tax_deadline',
          message: `${d.title} — due ${d.deadline_date || '—'}`,
          severity: days !== null && days <= 0 ? 'critical' : days !== null && days <= 7 ? 'high' : 'medium',
          daysLeft: days,
        };
      });

  const firstName = (user?.name || user?.email || 'User').split(' ')[0];
  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="global-console-page">

      {/* ── TOP NAVBAR ──────────────────────────────────────────────── */}
      <header className="gc-topnav">
        <div className="gc-topnav-brand">
          <ATCLogo variant="dark" size="small" withText text="ATC Capital" />
        </div>
        <div className="gc-topnav-right" ref={profileRef}>
          <button
            className="gc-topnav-avatar"
            onClick={() => setProfileOpen((o) => !o)}
            aria-label="Profile menu"
          >
            {userInitial}
          </button>
          {profileOpen && (
            <div className="gc-topnav-dropdown">
              <div className="gc-topnav-dd-header">
                <div className="gc-topnav-dd-avatar">{userInitial}</div>
                <div>
                  <div className="gc-topnav-dd-name">{user?.name || 'User'}</div>
                  <div className="gc-topnav-dd-email">{user?.email || ''}</div>
                </div>
              </div>
              <div className="gc-topnav-dd-divider" />
              <button className="gc-topnav-dd-item" onClick={() => { setProfileOpen(false); navigate('/app/settings/security'); }}>
                Security
              </button>
              <button className="gc-topnav-dd-item" onClick={() => { setProfileOpen(false); navigate('/app/support/help'); }}>
                Help Center
              </button>
              <div className="gc-topnav-dd-divider" />
              <button className="gc-topnav-dd-item gc-topnav-dd-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="gc-body">
        <div className="global-console">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="gc-hero">
        <div className="gc-hero-copy">
          <span className="gc-kicker">ATC Capital — Global Console</span>
          <h1 className="gc-title">Good morning, {firstName}</h1>
          <p className="gc-subtitle">
            Select a workspace to continue, or manage your organization from here.
          </p>
          {currentOrganization && (
            <span className="gc-org-badge">{currentOrganization.name}</span>
          )}
        </div>
        <div className="gc-hero-stats">
          <div className="gc-hero-stat">
            <span className="gc-hero-stat-value">{entities.length}</span>
            <span className="gc-hero-stat-label">Workspaces</span>
          </div>
          <div className="gc-hero-stat">
            <span className="gc-hero-stat-value">{notifs.filter(n => n.severity === 'critical' || n.severity === 'high').length}</span>
            <span className="gc-hero-stat-label">Urgent Alerts</span>
          </div>
          <div className="gc-hero-stat">
            <span className="gc-hero-stat-value">{tasks.length}</span>
            <span className="gc-hero-stat-label">Pending Tasks</span>
          </div>
        </div>
      </section>

      {/* ── QUICK ACTIONS ────────────────────────────────────────────────── */}
      <section className="gc-quick-actions">
        <button className="gc-action-btn gc-action-primary" onClick={() => navigate('/app/workspaces/create')}>
          <span className="gc-action-icon">+</span>
          Create Workspace
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={handleOpenLastWorkspace} disabled={!activeWorkspace && entities.length === 0}>
          <span className="gc-action-icon">▶</span>
          {activeWorkspace ? `Open "${activeWorkspace.name}"` : 'Open Last Workspace'}
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={() => navigate('/app/settings/team')}>
          <span className="gc-action-icon">+</span>
          Invite User
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={() => navigate('/app/enterprise/entities')}>
          <span className="gc-action-icon">⚙</span>
          Manage Entities
        </button>
      </section>

      {/* ── MAIN GRID ────────────────────────────────────────────────────── */}
      <div className="gc-main-grid">

        {/* LEFT — My Workspaces ───────────────────────────────────────────── */}
        <section className="gc-section gc-workspaces-section">
          <div className="gc-section-header">
            <h2>My Workspaces</h2>
            <span className="gc-section-count">{filtered.length} of {workspaceCards.length}</span>
          </div>

          {/* Filters */}
          <div className="gc-workspace-filters">
            <input
              className="gc-search"
              type="text"
              placeholder="Search by name or country…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="gc-filter-chips">
              {['all', 'active', 'inactive', 'pending'].map((s) => (
                <button
                  key={s}
                  className={`gc-chip${filterStatus === s ? ' active' : ''}`}
                  onClick={() => setFilterStatus(s)}
                >
                  {s === 'all' ? 'All' : STATUS_META[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Workspace cards */}
          {loading && <div className="gc-loading">Loading workspaces…</div>}

          {!loading && filtered.length === 0 && (
            <div className="gc-empty-state">
              <div className="gc-empty-icon">🏢</div>
              <h3>No workspaces yet</h3>
              <p>Create your first workspace to start managing a company's finances.</p>
              <button className="gc-action-btn gc-action-primary" onClick={() => navigate('/app/workspaces/create')}>
                Create Workspace
              </button>
            </div>
          )}

          <div className="gc-workspaces-grid">
            {filtered.map((ws, idx) => {
              const isActive = activeWorkspace?.id === ws.id;
              const statusMeta = STATUS_META[ws.status] || STATUS_META.active;
              return (
                <div key={ws.id} className={`gc-workspace-card ${palette(idx)}${isActive ? ' gc-ws-active' : ''}`}>
                  {isActive && <span className="gc-ws-active-badge">Current</span>}
                  <div className="gc-ws-header">
                    <div className="gc-ws-avatar">{ws.name.charAt(0).toUpperCase()}</div>
                    <div className="gc-ws-meta">
                      <h3 className="gc-ws-name">{ws.name}</h3>
                      <span className="gc-ws-country">{ws.country} · {ws.currency}</span>
                    </div>
                    <span className={`gc-ws-status ${statusMeta.cls}`}>{statusMeta.label}</span>
                  </div>

                  <div className="gc-ws-details">
                    {ws.industry && ws.industry !== '—' && (
                      <span className="gc-ws-tag">{ws.industry}</span>
                    )}
                    <span className="gc-ws-tag gc-ws-tag-role">{ws.role}</span>
                    <span className="gc-ws-tag">{ws.entityType.replace('_', ' ')}</span>
                  </div>

                  {ws.fiscalYearEnd && (
                    <p className="gc-ws-fiscal">Fiscal year end: {ws.fiscalYearEnd}</p>
                  )}

                  <div className="gc-ws-actions">
                    <button
                      className="gc-ws-open-btn"
                      onClick={() => handleOpenWorkspace(ws)}
                    >
                      Open Workspace →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT — Notifications + Tasks ───────────────────────────────────── */}
        <aside className="gc-side-stack">

          {/* Global Notifications */}
          <section className="gc-section gc-notif-section">
            <div className="gc-section-header">
              <h2>Global Notifications</h2>
              {notifs.length > 0 && (
                <span className="gc-notif-badge">{notifs.filter(n => n.severity !== 'medium').length}</span>
              )}
            </div>
            {notifs.length === 0 ? (
              <div className="gc-notif-empty">
                <span>✓ All compliance obligations are current</span>
              </div>
            ) : (
              <ul className="gc-notif-list">
                {notifs.slice(0, 6).map((n, i) => (
                  <li key={n.id || i} className={`gc-notif-item sev-${n.severity}`}>
                    <div className="gc-notif-dot" />
                    <div className="gc-notif-content">
                      <p className="gc-notif-msg">{n.message}</p>
                      {n.daysLeft !== null && (
                        <span className="gc-notif-time">
                          {n.daysLeft <= 0 ? `Overdue by ${Math.abs(n.daysLeft)}d` : `Due in ${n.daysLeft} days`}
                        </span>
                      )}
                    </div>
                    <span className={`gc-notif-sev gc-sev-${n.severity}`}>
                      {n.severity === 'critical' ? 'Critical' : n.severity === 'high' ? 'High' : 'Medium'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Global Tasks */}
          <section className="gc-section gc-tasks-section">
            <div className="gc-section-header">
              <h2>Global Tasks</h2>
              <span className="gc-section-count">{tasks.length}</span>
            </div>
            {tasks.length === 0 ? (
              <div className="gc-task-empty">
                <span>✓ No pending tasks</span>
              </div>
            ) : (
              <ul className="gc-task-list">
                {tasks.map((t, i) => (
                  <li key={t.id || i} className={`gc-task-item priority-${t.priority}`}>
                    <div className={`gc-task-priority-bar pbar-${t.priority}`} />
                    <div className="gc-task-body">
                      <p className="gc-task-title">{t.title}</p>
                      <span className="gc-task-type">{t.type.replace('_', ' ')}</span>
                    </div>
                    <span className="gc-task-due">
                      {t.daysLeft <= 0 ? 'Overdue' : `${t.daysLeft}d left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Organizations summary */}
          {organizations && organizations.length > 0 && (
            <section className="gc-section gc-orgs-section">
              <div className="gc-section-header">
                <h2>Organizations</h2>
              </div>
              <ul className="gc-org-list">
                {organizations.map((org) => (
                  <li key={org.id} className="gc-org-item">
                    <div className="gc-org-avatar">{org.name.charAt(0)}</div>
                    <div className="gc-org-info">
                      <span className="gc-org-name">{org.name}</span>
                      <span className="gc-org-industry">{INDUSTRY_LABELS[org.industry] || org.industry || '—'}</span>
                    </div>
                    <span className="gc-org-currency">{org.primary_currency || 'USD'}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>

      </div>{/* /.gc-main-grid */}
      </div>{/* /.global-console */}
      </div>{/* /.gc-body */}
    </div>
  );
};

export default GlobalConsole;
