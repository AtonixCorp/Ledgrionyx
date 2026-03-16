import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';
import './WorkspaceModules.css';
import './WorkspaceOverview.css';

/* ── Label maps ─────────────────────────────────────────────────────────── */
const ENTITY_TYPE_LABELS = {
  sole_proprietor:   'Sole Proprietor',
  llc:               'LLC',
  partnership:       'Partnership',
  corporation:       'Corporation',
  nonprofit:         'Non-Profit',
  subsidiary:        'Subsidiary',
  branch:            'Branch',
  other:             'Other',
  holding_company:   'Holding Company',
  non_profit:        'Non-Profit',
  sole_proprietorship: 'Sole Proprietorship',
  trust:             'Trust',
};

const STATUS_CONFIG = {
  active:    { label: 'Active',       cls: 'wso-badge-active'    },
  dormant:   { label: 'Dormant',      cls: 'wso-badge-dormant'   },
  wind_down: { label: 'Wind-Down',    cls: 'wso-badge-winddown'  },
  suspended: { label: 'Suspended',    cls: 'wso-badge-dormant'   },
  archived:  { label: 'Archived',     cls: 'wso-badge-winddown'  },
  draft:     { label: 'Draft',        cls: 'wso-badge-dormant'   },
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const fmtDate = (val) => {
  if (!val) return null;
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return val; }
};

const fmtShortDate = (val) => {
  if (!val) return null;
  try {
    return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return val; }
};

/* ── Sub-components ─────────────────────────────────────────────────────── */
const DetailRow = ({ label, value, capitalize }) =>
  value ? (
    <tr className="wso-detail-row">
      <td className="wso-detail-label">{label}</td>
      <td className="wso-detail-value" style={capitalize ? { textTransform: 'capitalize' } : {}}>
        {value}
      </td>
    </tr>
  ) : null;

/* ── Entity quick-access cards ─────────────────────────────────────────── */
const ENTITY_LINKS = [
  { label: 'Entity Dashboard', path: (id) => `/app/enterprise/entities/${id}/dashboard`        },
  { label: 'Bookkeeping',      path: (id) => `/enterprise/entity/${id}/bookkeeping`            },
  { label: 'Transactions',     path: (id) => `/enterprise/entity/${id}/bookkeeping/transactions` },
  { label: 'Accounts',         path: (id) => `/enterprise/entity/${id}/bookkeeping/accounts`   },
  { label: 'Reports',          path: (id) => `/enterprise/entity/${id}/bookkeeping/reports`    },
  { label: 'Staff & HR',       path: (id) => `/enterprise/entity/${id}/bookkeeping/staff-hr`   },
];

/* ═══════════════════════════════════════════════════════════════════════════
   WorkspaceOverview
══════════════════════════════════════════════════════════════════════════ */
const WorkspaceOverview = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspace, entities } = useEnterprise();

  /* Resolve workspace from URL param → entities list → localStorage → context */
  const ws = React.useMemo(() => {
    if (workspaceId) {
      const fromList = (entities || []).find(e => String(e.id) === String(workspaceId));
      if (fromList) return fromList;
      if (activeWorkspace && String(activeWorkspace.id) === String(workspaceId)) return activeWorkspace;
      try {
        const saved = localStorage.getItem('atc_active_workspace');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (String(parsed.id) === String(workspaceId)) return parsed;
        }
      } catch { /* ignore */ }
    }
    return activeWorkspace || {};
  }, [workspaceId, activeWorkspace, entities]);

  const statusCfg   = STATUS_CONFIG[ws.status] || { label: ws.status || 'Active', cls: 'wso-badge-active' };
  const entityLabel = ENTITY_TYPE_LABELS[ws.entity_type] || ws.entity_type || '—';
  const initials    = (ws.name || 'W').slice(0, 2).toUpperCase();

  return (
    <div className="wsm-page wso-root">

      {/* ══ PAGE HEADER ════════════════════════════════════════════════════ */}
      <div className="wsm-page-header">
        <div>
          <h1 className="wsm-page-title">{ws.name || 'Workspace Overview'}</h1>
          <p className="wsm-page-sub">Entity profile and workspace activity summary.</p>
        </div>
      </div>

      {/* ══ ENTITY PROFILE CARD ════════════════════════════════════════════ */}
      <div className="wso-entity-card">

        {/* Left: avatar + name + badges */}
        <div className="wso-entity-hero">
          <div className="wso-entity-avatar">{initials}</div>
          <div className="wso-entity-identity">
            <h2 className="wso-entity-name">{ws.name || '—'}</h2>
            <div className="wso-entity-badges">
              <span className={`wso-badge ${statusCfg.cls}`}>{statusCfg.label}</span>
              {ws.entity_type && (
                <span className="wso-badge wso-badge-type">{entityLabel}</span>
              )}
              {ws.local_currency && (
                <span className="wso-badge wso-badge-currency">{ws.local_currency}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: two-column details grid */}
        <div className="wso-entity-details">

          <div className="wso-detail-col">
            <div className="wso-detail-col-title">Registration</div>
            <table className="wso-detail-table">
              <tbody>
                <DetailRow label="Legal Name"        value={ws.name} />
                <DetailRow label="Entity Type"       value={entityLabel} />
                <DetailRow label="Registration No."  value={ws.registration_number} />
                <DetailRow label="Country"           value={ws.country} />
                <DetailRow label="Status"            value={statusCfg.label} />
              </tbody>
            </table>
          </div>

          <div className="wso-detail-col">
            <div className="wso-detail-col-title">Finance &amp; Compliance</div>
            <table className="wso-detail-table">
              <tbody>
                <DetailRow label="Functional Currency" value={ws.local_currency} />
                <DetailRow label="Fiscal Year End"     value={fmtDate(ws.fiscal_year_end)} />
                <DetailRow label="Next Filing Date"    value={fmtShortDate(ws.next_filing_date)} />
                <DetailRow label="Main Bank"           value={ws.main_bank} />
                <DetailRow label="Tax Authority"
                  value={ws.tax_authority_url
                    ? <a href={ws.tax_authority_url} target="_blank" rel="noreferrer" className="wso-link">
                        {ws.tax_authority_url}
                      </a>
                    : null}
                />
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer row */}
        <div className="wso-entity-footer">
          {(ws.parent_entity_name || ws.parent_entity) && (
            <span className="wso-footer-item">
              <span className="wso-footer-label">Parent Entity</span>
              {ws.parent_entity_name || `#${ws.parent_entity}`}
            </span>
          )}
          {ws.created_at && (
            <span className="wso-footer-item">
              <span className="wso-footer-label">Created</span>
              {fmtDate(ws.created_at)}
            </span>
          )}
          {/* Primary CTA — always visible */}
          <button
            className="wso-btn-primary"
            onClick={() => navigate(`/app/enterprise/entities/${ws.id}/dashboard`)}
          >
            Open Entity Dashboard →
          </button>
        </div>
      </div>

      {/* ══ ENTITY QUICK ACCESS ════════════════════════════════════════════ */}
      {ws.id && (
        <div className="wso-quicklinks">
          <div className="wso-quicklinks-title">Entity Access</div>
          <div className="wso-quicklinks-grid">
            {ENTITY_LINKS.map(({ label, path }) => (
              <button
                key={label}
                className="wso-quicklink-card"
                onClick={() => navigate(path(ws.id))}
              >
                <span className="wso-ql-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══ STAT CHIPS ═════════════════════════════════════════════════════ */}
      <div className="wsm-stats-row">
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Status</span>
          <span className="wsm-stat-value" style={{ textTransform: 'capitalize' }}>
            {statusCfg.label}
          </span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Country</span>
          <span className="wsm-stat-value">{ws.country || '—'}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Currency</span>
          <span className="wsm-stat-value">{ws.local_currency || '—'}</span>
        </div>
        <div className="wsm-stat-card">
          <span className="wsm-stat-label">Entity Type</span>
          <span className="wsm-stat-value">{entityLabel}</span>
        </div>
        {ws.fiscal_year_end && (
          <div className="wsm-stat-card">
            <span className="wsm-stat-label">Fiscal Year End</span>
            <span className="wsm-stat-value">{fmtDate(ws.fiscal_year_end)}</span>
          </div>
        )}
      </div>

      {/* ══ ACTIVITY GRID ══════════════════════════════════════════════════ */}
      <div className="wsm-sections-grid">
        <section className="wsm-section">
          <h2 className="wsm-section-title">Recent Activity</h2>
          <div className="wsm-empty">No recent activity yet.</div>
        </section>
        <section className="wsm-section">
          <h2 className="wsm-section-title">Upcoming Meetings</h2>
          <div className="wsm-empty">No upcoming meetings.</div>
        </section>
        <section className="wsm-section">
          <h2 className="wsm-section-title">File Activity</h2>
          <div className="wsm-empty">No recent file activity.</div>
        </section>
        <section className="wsm-section">
          <h2 className="wsm-section-title">Calendar Highlights</h2>
          <div className="wsm-empty">No upcoming events.</div>
        </section>
      </div>
    </div>
  );
};

export default WorkspaceOverview;
