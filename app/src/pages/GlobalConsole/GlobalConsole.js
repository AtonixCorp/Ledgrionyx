import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEnterprise } from '../../context/EnterpriseContext';
import ATCLogo from '../../components/branding/ATCLogo';
import { platformAuditEventsAPI, platformTasksAPI } from '../../services/api';
import { getWorkspaceLandingPath, WORKSPACE_MODE_LABELS } from '../../utils/workspaceModules';
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

// ─── derive simple workspace cards from entities ─────────────────────────────
// Workspace roles are workspace-scoped; never inherit org/platform role here.
function buildWorkspaceCards(entities) {
  return entities.map((e) => ({
    id: e.id,
    name: e.name,
    country: e.country || '—',
    currency: e.local_currency || 'USD',
    entityType: e.entity_type || 'corporation',
    industry: INDUSTRY_LABELS[e.industry] || e.industry || '—',
    status: e.status || 'active',
    role: 'Member',
    registrationNumber: e.registration_number || null,
    fiscalYearEnd: e.fiscal_year_end || null,
    workspaceMode: e.workspace_mode || 'accounting',
    workspaceModeLabel: WORKSPACE_MODE_LABELS[e.workspace_mode || 'accounting'] || 'Accounting',
  }));
}

// ─── helper: colour class for workspace card accent ──────────────────────────
const PALETTE = ['ws-indigo', 'ws-teal', 'ws-violet', 'ws-rose', 'ws-amber', 'ws-sky'];
const palette = (idx) => PALETTE[idx % PALETTE.length];

const openStandalonePath = (path) => {
  window.open(`${process.env.PUBLIC_URL || ''}${path}`, '_blank', 'noopener,noreferrer');
};

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const toTaskPriority = (task) => {
  if (task.state === 'blocked') return 'overdue';
  if (task.priority === 'high' || task.priority === 'urgent') return 'high';
  return 'medium';
};

const formatRelativeTime = (value) => {
  if (!value) return 'Just now';
  const deltaMs = new Date(value).getTime() - Date.now();
  const deltaDays = Math.round(deltaMs / 86400000);
  if (deltaDays === 0) return 'Today';
  if (deltaDays > 0) return `In ${deltaDays}d`;
  return `${Math.abs(deltaDays)}d ago`;
};

const auditSeverity = (event) => {
  if (['approval_rejected', 'workflow_run_failed', 'deadline_deleted'].includes(event.action)) return 'critical';
  if (['approval_requested', 'approval_progressed', 'workflow_run_started'].includes(event.action)) return 'high';
  return 'medium';
};

const EMPTY_WORKSPACE_VALUE_CARDS = [
  {
    eyebrow: 'Operations',
    title: 'Operational Hub',
    description: 'Manage projects, teams, files, and tools in one unified environment.',
  },
  {
    eyebrow: 'Equity',
    title: 'Equity Management',
    description: 'Launch ATC Equity Management for registry, cap table, vesting, valuation, transactions, and governance workflows.',
  },
  {
    eyebrow: 'Infrastructure',
    title: 'Secure & Scalable',
    description: 'Enterprise-grade infrastructure with global compliance and multi-region support.',
  },
];

const EMPTY_WORKSPACE_PLATFORM_CAPABILITIES = [
  {
    title: 'Run the organization from one operating layer',
    description: 'Each workspace gives one entity a structured home for people, approvals, documents, tasks, and operating data.',
  },
  {
    title: 'Open the right dashboard for the job',
    description: 'New workspaces can launch into accounting, ATC Equity Management, or a combined operating setup depending on the package you choose.',
  },
  {
    title: 'Scale without rebuilding process',
    description: 'The platform keeps shared governance, audit history, permissions, and organization visibility consistent across finance workspaces and ATC Equity Management environments.',
  },
];

const EMPTY_WORKSPACE_JOURNEY = [
  {
    step: '01',
    title: 'Name the workspace',
    description: 'Create one workspace for one company, entity, or operating environment.',
  },
  {
    step: '02',
    title: 'Choose how it should launch',
    description: 'Select accounting, ATC Equity Management, combined, or standalone so the correct dashboard opens first.',
  },
  {
    step: '03',
    title: 'Activate the operating areas',
    description: 'Enable the modules that define the collaboration, finance, and Equity Management workflows for that workspace.',
  },
  {
    step: '04',
    title: 'Enter the workspace dashboard',
    description: 'After creation, you are redirected into the new workspace with the selected launch path already configured.',
  },
];

const emitAnalyticsEvent = (eventName, payload = {}) => {
  if (typeof window === 'undefined') return;

  const eventPayload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(eventPayload);
  }

  window.__ATC_ANALYTICS_QUEUE__ = window.__ATC_ANALYTICS_QUEUE__ || [];
  window.__ATC_ANALYTICS_QUEUE__.push(eventPayload);
  window.dispatchEvent(new CustomEvent('atc:analytics', { detail: eventPayload }));
};

const EmptyWorkspaceIllustration = () => (
  <div className="gc-empty-illustration" aria-hidden="true">
    <div className="gc-empty-illustration-frame">
      <div className="gc-empty-illustration-dot" />
      <div className="gc-empty-illustration-line gc-empty-illustration-line-short" />
      <div className="gc-empty-illustration-grid">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  </div>
);

const EmptyWorkspaceValueCard = ({ eyebrow, title, description }) => (
  <article className="gc-empty-value-card">
    <span className="gc-empty-value-eyebrow">{eyebrow}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </article>
);

const EmptyWorkspaceCapabilityCard = ({ title, description }) => (
  <article className="gc-empty-capability-card">
    <h3>{title}</h3>
    <p>{description}</p>
  </article>
);

const EmptyWorkspaceJourneyStep = ({ step, title, description }) => (
  <article className="gc-empty-journey-step">
    <span className="gc-empty-journey-step-number">{step}</span>
    <div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </article>
);

const GlobalConsole = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    currentOrganization,
    entities,
    activeWorkspace,
    setActiveWorkspace,
    globalNotifications,
    fetchGlobalNotifications,
    loading,
    complianceDeadlines,
  } = useEnterprise();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [profileOpen, setProfileOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState('open');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [costCenterFilter, setCostCenterFilter] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [auditEvents, setAuditEvents] = useState([]);
  const [taskActionPendingId, setTaskActionPendingId] = useState(null);
  const profileRef = useRef(null);
  const onboardingEnteredAtRef = useRef(null);
  const onboardingCtaClickedRef = useRef(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (fetchGlobalNotifications) fetchGlobalNotifications();
  }, [fetchGlobalNotifications]);

  useEffect(() => {
    let active = true;

    const loadPlatformData = async () => {
      try {
        const [taskResponse, auditResponse] = await Promise.all([
          platformTasksAPI.getAll({
            assignee_id: user?.id,
            state: taskFilter === 'all' ? undefined : taskFilter,
            department_name: departmentFilter === 'all' ? undefined : departmentFilter,
            cost_center: costCenterFilter === 'all' ? undefined : costCenterFilter,
          }),
          platformAuditEventsAPI.getAll({ actor_id: user?.id }),
        ]);
        if (!active) return;
        setTasks(normalizeCollection(taskResponse.data).slice(0, 8));
        setAuditEvents(normalizeCollection(auditResponse.data).slice(0, 8));
      } catch (error) {
        if (!active) return;
        setTasks([]);
        setAuditEvents([]);
      }
    };

    if (user?.id) {
      loadPlatformData();
    }

    return () => {
      active = false;
    };
  }, [costCenterFilter, departmentFilter, taskFilter, user?.id]);

  // Filtered workspaces
  const workspaceCards = buildWorkspaceCards(entities);
  const workspaceCount = workspaceCards.length;
  const showWorkspaceOnboarding = !loading && workspaceCount === 0;
  const filtered = workspaceCards.filter((w) => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.country.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleOpenWorkspace = (workspace) => {
    const entity = entities.find((e) => e.id === workspace.id);
    if (entity) {
      setActiveWorkspace(entity);
      navigate(getWorkspaceLandingPath(entity));
    }
  };

  const handleOpenLastWorkspace = () => {
    // Only open if a workspace has been explicitly selected — never auto-pick.
    if (activeWorkspace) {
      navigate(getWorkspaceLandingPath(activeWorkspace));
    }
    // No workspace selected → stay on console. The button is disabled in this case anyway.
  };

  const notifs = auditEvents.length > 0
    ? auditEvents.slice(0, 4).map((event) => ({
        id: event.id,
        message: event.summary,
        severity: auditSeverity(event),
        daysLeft: null,
      }))
    : globalNotifications && globalNotifications.length > 0
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

  const handleTaskAction = async (task, action) => {
    setTaskActionPendingId(task.id);
    try {
      if (action === 'start') {
        await platformTasksAPI.start(task.id);
      } else if (action === 'complete') {
        await platformTasksAPI.complete(task.id, {});
      } else if (action === 'assign') {
        await platformTasksAPI.update(task.id, { assignee_type: 'user', assignee_id: user.id });
      }

      const [taskResponse, auditResponse] = await Promise.all([
        platformTasksAPI.getAll({
          assignee_id: user?.id,
          state: taskFilter === 'all' ? undefined : taskFilter,
          department_name: departmentFilter === 'all' ? undefined : departmentFilter,
          cost_center: costCenterFilter === 'all' ? undefined : costCenterFilter,
        }),
        platformAuditEventsAPI.getAll({ actor_id: user?.id }),
      ]);
      setTasks(normalizeCollection(taskResponse.data).slice(0, 8));
      setAuditEvents(normalizeCollection(auditResponse.data).slice(0, 8));
    } finally {
      setTaskActionPendingId(null);
    }
  };

  const firstName = (user?.name || user?.email || 'User').split(' ')[0];
  const userInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const departmentOptions = Array.from(new Set(tasks.map((task) => task.department_name).filter(Boolean))).sort();
  const costCenterOptions = Array.from(new Set(tasks.map((task) => task.cost_center).filter(Boolean))).sort();

  const trackWorkspaceLandingEvent = useCallback((eventName, payload = {}) => {
    emitAnalyticsEvent(eventName, {
      organizationId: currentOrganization?.id || null,
      organizationName: currentOrganization?.name || null,
      userId: user?.id || null,
      workspaceCount,
      ...payload,
    });
  }, [currentOrganization?.id, currentOrganization?.name, user?.id, workspaceCount]);

  useEffect(() => {
    if (!showWorkspaceOnboarding) {
      onboardingEnteredAtRef.current = null;
      onboardingCtaClickedRef.current = false;
      return undefined;
    }

    onboardingEnteredAtRef.current = Date.now();
    onboardingCtaClickedRef.current = false;
    trackWorkspaceLandingEvent('workspace_empty_state_load');

    return () => {
      if (!onboardingEnteredAtRef.current) return;
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - onboardingEnteredAtRef.current) / 1000));
      trackWorkspaceLandingEvent('workspace_empty_state_time_on_page', { elapsedSeconds });
      if (!onboardingCtaClickedRef.current) {
        trackWorkspaceLandingEvent('workspace_empty_state_dropoff', { elapsedSeconds });
      }
    };
  }, [showWorkspaceOnboarding, trackWorkspaceLandingEvent]);

  const handleCreateWorkspace = useCallback((source = 'console') => {
    if (source === 'empty_state') {
      onboardingCtaClickedRef.current = true;
    }
    trackWorkspaceLandingEvent('workspace_create_cta_click', { source });
    navigate('/app/workspaces/create');
  }, [navigate, trackWorkspaceLandingEvent]);

  const handleNotificationsClick = useCallback(() => {
    trackWorkspaceLandingEvent('workspace_landing_notifications_click', { notificationCount: notifs.length });
    if (showWorkspaceOnboarding) return;
    const target = document.querySelector('.gc-notif-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [notifs.length, showWorkspaceOnboarding, trackWorkspaceLandingEvent]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="global-console-page">

      {/* ── TOP NAVBAR ──────────────────────────────────────────────── */}
      <header className="gc-topnav">
        <div className="gc-topnav-left">
          <div className="gc-topnav-brand">
            <ATCLogo variant="dark" size="small" withText text="ATC Capital" />
          </div>
          <div className="gc-topnav-org-block">
            <span className="gc-topnav-org-label">Organization</span>
            <strong className="gc-topnav-org-name">{currentOrganization?.name || 'ATC Capital Organization'}</strong>
          </div>
        </div>
        <div className="gc-topnav-right" ref={profileRef}>
          <button className="gc-topnav-notifications" onClick={handleNotificationsClick} aria-label="Notifications">
            <span className="gc-topnav-notifications-label">Notifications</span>
            <span className="gc-topnav-notifications-count">{notifs.length}</span>
          </button>
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
              <button className="gc-topnav-dd-item" onClick={() => { setProfileOpen(false); openStandalonePath('/security-center'); }}>
                Security
              </button>
              <button className="gc-topnav-dd-item" onClick={() => { setProfileOpen(false); openStandalonePath('/support-center'); }}>
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

      {showWorkspaceOnboarding ? (
        <div className="gc-empty-workspace-shell">
          <section className="gc-empty-workspace-hero">
            <span className="gc-empty-workspace-kicker">Workspace Setup</span>
            <h1>Welcome to your Organization Dashboard</h1>
            <p>Create your first workspace to begin managing your operations.</p>
            <button className="gc-empty-workspace-cta" onClick={() => handleCreateWorkspace('empty_state')}>
              Create Workspace
            </button>
          </section>

          <section className="gc-empty-workspace-panel">
            <EmptyWorkspaceIllustration />
            <div className="gc-empty-workspace-copy">
              <h2>You don’t have any workspaces yet.</h2>
              <p>Create one to get started.</p>
            </div>
          </section>

          <section className="gc-empty-workspace-values" aria-label="Workspace value proposition">
            {EMPTY_WORKSPACE_VALUE_CARDS.map((card) => (
              <EmptyWorkspaceValueCard
                key={card.title}
                eyebrow={card.eyebrow}
                title={card.title}
                description={card.description}
              />
            ))}
          </section>

          <section className="gc-empty-platform-section" aria-label="How the platform works">
            <div className="gc-empty-section-head">
              <span className="gc-empty-section-kicker">Platform Overview</span>
              <h2>Understand what a workspace unlocks before you create one</h2>
              <p>
                ATC Capital is organized around workspaces. Each workspace becomes the operational home for one entity and opens the right dashboard structure for the way that entity is managed.
              </p>
            </div>
            <div className="gc-empty-capability-grid">
              {EMPTY_WORKSPACE_PLATFORM_CAPABILITIES.map((item) => (
                <EmptyWorkspaceCapabilityCard
                  key={item.title}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </section>

          <section className="gc-empty-platform-section" aria-label="Workspace creation journey">
            <div className="gc-empty-section-head">
              <span className="gc-empty-section-kicker">Creation Journey</span>
              <h2>How the platform walks you into your first dashboard</h2>
              <p>
                The creation flow sets the workspace identity, package, modules, and launch target so the first dashboard already matches the operating model you selected.
              </p>
            </div>
            <div className="gc-empty-journey-grid">
              {EMPTY_WORKSPACE_JOURNEY.map((item) => (
                <EmptyWorkspaceJourneyStep
                  key={item.step}
                  step={item.step}
                  title={item.title}
                  description={item.description}
                />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="gc-hero">
        <div className="gc-hero-copy">
          <span className="gc-kicker">ATC Capital — Global Console</span>
          <h1 className="gc-title">Good morning, {firstName}</h1>
          <p className="gc-subtitle">
            Select a workspace to continue, or manage your organization from here.
          </p>
          <span className="gc-platform-badge">ATC Capital Console</span>
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
        <button className="gc-action-btn gc-action-primary" onClick={() => handleCreateWorkspace('quick_actions')}>
          <span className="gc-action-icon">+</span>
          Create Workspace
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={handleOpenLastWorkspace} disabled={!activeWorkspace}>
          <span className="gc-action-icon">▶</span>
          Open Last Workspace
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={() => navigate('/app/settings/team')}>
          <span className="gc-action-icon">+</span>
          Invite User
        </button>
        <button className="gc-action-btn gc-action-secondary" onClick={() => navigate('/app/enterprise/entities')}>
          <span className="gc-action-icon">#</span>
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
              <div className="gc-empty-icon"></div>
              <h3>No workspaces match these filters</h3>
              <p>Adjust your filters or create another workspace.</p>
              <button className="gc-action-btn gc-action-primary" onClick={() => handleCreateWorkspace('workspace_grid_empty')}>
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
                    <span className="gc-ws-tag">{ws.workspaceModeLabel}</span>
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
                <span>All compliance obligations are current</span>
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
              <h2>My Tasks</h2>
              <span className="gc-section-count">{tasks.length}</span>
            </div>
            <div className="gc-filter-chips">
              {['open', 'in_progress', 'completed', 'all'].map((state) => (
                <button
                  key={state}
                  className={`gc-chip${taskFilter === state ? ' active' : ''}`}
                  onClick={() => setTaskFilter(state)}
                >
                  {state === 'in_progress' ? 'In Progress' : state === 'all' ? 'All' : state.charAt(0).toUpperCase() + state.slice(1)}
                </button>
              ))}
            </div>
            <div className="gc-task-filter-row">
              <select className="gc-task-select" value={departmentFilter} onChange={(event) => { setDepartmentFilter(event.target.value); setCostCenterFilter('all'); }}>
                <option value="all">All Departments</option>
                {departmentOptions.map((departmentName) => (
                  <option key={departmentName} value={departmentName}>{departmentName}</option>
                ))}
              </select>
              <select className="gc-task-select" value={costCenterFilter} onChange={(event) => setCostCenterFilter(event.target.value)}>
                <option value="all">All Cost Centers</option>
                {costCenterOptions.map((costCenter) => (
                  <option key={costCenter} value={costCenter}>{costCenter}</option>
                ))}
              </select>
            </div>
            {tasks.length === 0 ? (
              <div className="gc-task-empty">
                <span>No pending tasks</span>
              </div>
            ) : (
              <ul className="gc-task-list">
                {tasks.map((t, i) => (
                  <li key={t.id || i} className={`gc-task-item priority-${t.priority}`}>
                    <div className={`gc-task-priority-bar pbar-${toTaskPriority(t)}`} />
                    <div className="gc-task-body">
                      <p className="gc-task-title">{t.title}</p>
                      <span className="gc-task-type">{(t.type || t.task_type || 'task').replaceAll('_', ' ')}</span>
                      {(t.department_name || t.cost_center) && (
                        <div className="gc-task-meta-row">
                          {t.department_name && <span className="gc-task-meta-chip">{t.department_name}</span>}
                          {t.cost_center && <span className="gc-task-meta-chip gc-task-meta-chip-muted">{t.cost_center}</span>}
                        </div>
                      )}
                    </div>
                    <span className="gc-task-due">{t.due_at ? formatRelativeTime(t.due_at) : (t.state || t.status || 'open').replaceAll('_', ' ')}</span>
                    <div className="gc-task-actions">
                      {(t.state || t.status) === 'open' && (
                        <button className="gc-task-action" disabled={taskActionPendingId === t.id} onClick={() => handleTaskAction(t, 'start')}>
                          Start
                        </button>
                      )}
                      {(t.state || t.status) === 'in_progress' && (
                        <button className="gc-task-action" disabled={taskActionPendingId === t.id} onClick={() => handleTaskAction(t, 'complete')}>
                          Complete
                        </button>
                      )}
                      {!t.assignee_id && (
                        <button className="gc-task-action gc-task-action-secondary" disabled={taskActionPendingId === t.id} onClick={() => handleTaskAction(t, 'assign')}>
                          Assign to Me
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="gc-section gc-notif-section">
            <div className="gc-section-header">
              <h2>Audit Activity</h2>
              <div className="gc-section-header-actions">
                <span className="gc-section-count">{auditEvents.length}</span>
                <button className="gc-section-link" onClick={() => navigate('/app/enterprise/audit-explorer')}>
                  Open Explorer
                </button>
              </div>
            </div>
            {auditEvents.length === 0 ? (
              <div className="gc-notif-empty">
                <span>No recent audit activity</span>
              </div>
            ) : (
              <ul className="gc-notif-list">
                {auditEvents.slice(0, 6).map((event) => (
                  <li key={event.id} className={`gc-notif-item sev-${auditSeverity(event)}`}>
                    <div className="gc-notif-dot" />
                    <div className="gc-notif-content">
                      <p className="gc-notif-msg">{event.summary}</p>
                      <span className="gc-notif-time">{formatRelativeTime(event.occurred_at)}</span>
                    </div>
                    <span className={`gc-notif-sev gc-sev-${auditSeverity(event)}`}>
                      {event.action?.replaceAll('_', ' ') || 'event'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

        </aside>

      </div>{/* /.gc-main-grid */}
      </>
      )}
      </div>{/* /.global-console */}
      </div>{/* /.gc-body */}
    </div>
  );
};

export default GlobalConsole;
