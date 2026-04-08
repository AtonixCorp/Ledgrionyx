import React, { useEffect, useMemo, useState } from 'react';
import { platformAuditEventsAPI } from '../../services/api';
import { useEnterprise } from '../../context/EnterpriseContext';
import './EnterpriseActionPages.css';
import './EnterpriseAuditExplorer.css';

const normalizeCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const DOMAIN_OPTIONS = ['finance', 'approval', 'compliance', 'document', 'equity', 'automation', 'workspace'];
const SUBJECT_OPTIONS = ['task', 'workspace', 'journal_entry', 'document', 'document_request', 'compliance_deadline', 'equity_scenario_approval'];

const formatDateTime = (value) => {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

const severityForEvent = (event) => {
  if (['approval_rejected', 'workflow_run_failed', 'deadline_deleted', 'document_deleted'].includes(event.action)) return 'critical';
  if (['approval_requested', 'approval_progressed', 'journal_posted', 'workflow_run_started', 'document_review_requested'].includes(event.action)) return 'high';
  return 'medium';
};

const prettyJson = (value) => JSON.stringify(value || {}, null, 2);

const EnterpriseAuditExplorer = () => {
  const { currentOrganization, entities, fetchEntities } = useEnterprise();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    entity: '',
    domain: '',
    action: '',
    subject_type: '',
    correlation_id: '',
    from: '',
    to: '',
    q: '',
  });

  useEffect(() => {
    if (currentOrganization?.id && (!entities || entities.length === 0)) {
      fetchEntities(currentOrganization.id);
    }
  }, [currentOrganization?.id, entities, fetchEntities]);

  useEffect(() => {
    let active = true;

    const loadEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          organization: currentOrganization?.id,
          entity: filters.entity || undefined,
          domain: filters.domain || undefined,
          action: filters.action || undefined,
          subject_type: filters.subject_type || undefined,
          correlation_id: filters.correlation_id || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
          q: filters.q || undefined,
        };
        const response = await platformAuditEventsAPI.getAll(params);
        if (!active) return;
        const rows = normalizeCollection(response.data);
        setEvents(rows);
        if (!rows.some((row) => row.id === selectedEventId)) {
          setSelectedEventId(rows[0]?.id || null);
        }
      } catch (requestError) {
        if (!active) return;
        setError(requestError.response?.data?.detail || 'Failed to load platform audit events.');
        setEvents([]);
        setSelectedEventId(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, [currentOrganization?.id, filters, selectedEventId]);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) || events[0] || null,
    [events, selectedEventId]
  );

  const stats = useMemo(() => {
    const uniqueSubjects = new Set(events.map((event) => `${event.subject_type}:${event.subject_id}`));
    const highSignal = events.filter((event) => severityForEvent(event) !== 'medium').length;
    const domains = new Set(events.map((event) => event.domain).filter(Boolean));
    return {
      total: events.length,
      highSignal,
      uniqueSubjects: uniqueSubjects.size,
      domains: domains.size,
    };
  }, [events]);

  const setFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="enterprise-action-page audit-explorer-page">
      <section className="action-page-hero audit-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Platform Audit Explorer</span>
          <h1 className="action-page-title">Cross-domain event visibility</h1>
          <p className="action-page-subtitle">
            Search platform audit history across finance approvals, equity workflows, compliance changes, document activity, automation runs, and workspace actions.
          </p>
          <div className="action-page-actions">
            <button className="btn-secondary" onClick={() => setFilters({ entity: '', domain: '', action: '', subject_type: '', correlation_id: '', from: '', to: '', q: '' })}>
              Reset Filters
            </button>
          </div>
        </div>
        <div className="action-page-badge">
          {currentOrganization?.name || 'All Accessible Organizations'}
        </div>
      </section>

      <section className="action-page-stats">
        <div className="action-page-stat">
          <span className="action-page-stat-label">Events</span>
          <span className="action-page-stat-value">{stats.total}</span>
          <span className="action-page-stat-caption">Loaded in the current query window</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">High Signal</span>
          <span className="action-page-stat-value">{stats.highSignal}</span>
          <span className="action-page-stat-caption">Critical or high-severity actions</span>
        </div>
        <div className="action-page-stat">
          <span className="action-page-stat-label">Subjects</span>
          <span className="action-page-stat-value">{stats.uniqueSubjects}</span>
          <span className="action-page-stat-caption">Unique audited subjects in view</span>
        </div>
      </section>

      <section className="action-page-surface audit-toolbar">
        <div className="audit-toolbar-grid">
          <label className="audit-filter-field audit-filter-search">
            <span>Search</span>
            <input value={filters.q} onChange={(event) => setFilter('q', event.target.value)} placeholder="Summary, subject, action" />
          </label>
          <label className="audit-filter-field">
            <span>Entity</span>
            <select value={filters.entity} onChange={(event) => setFilter('entity', event.target.value)}>
              <option value="">All entities</option>
              {(entities || []).map((entity) => (
                <option key={entity.id} value={entity.id}>{entity.name}</option>
              ))}
            </select>
          </label>
          <label className="audit-filter-field">
            <span>Domain</span>
            <select value={filters.domain} onChange={(event) => setFilter('domain', event.target.value)}>
              <option value="">All domains</option>
              {DOMAIN_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="audit-filter-field">
            <span>Subject</span>
            <select value={filters.subject_type} onChange={(event) => setFilter('subject_type', event.target.value)}>
              <option value="">All subjects</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option} value={option}>{option.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </label>
          <label className="audit-filter-field">
            <span>Action</span>
            <input value={filters.action} onChange={(event) => setFilter('action', event.target.value)} placeholder="approval_requested" />
          </label>
          <label className="audit-filter-field">
            <span>Correlation ID</span>
            <input value={filters.correlation_id} onChange={(event) => setFilter('correlation_id', event.target.value)} placeholder="corr-123" />
          </label>
          <label className="audit-filter-field">
            <span>From</span>
            <input type="datetime-local" value={filters.from} onChange={(event) => setFilter('from', event.target.value)} />
          </label>
          <label className="audit-filter-field">
            <span>To</span>
            <input type="datetime-local" value={filters.to} onChange={(event) => setFilter('to', event.target.value)} />
          </label>
        </div>
      </section>

      {error && <div className="audit-error-banner">{error}</div>}

      <section className="audit-layout-grid">
        <div className="action-page-surface audit-list-panel">
          <div className="audit-panel-header">
            <div>
              <h2>Audit Events</h2>
              <p>Append-only platform activity from the shared audit pipeline.</p>
            </div>
            {loading && <span className="audit-loading-pill">Refreshing</span>}
          </div>

          {events.length === 0 && !loading ? (
            <div className="audit-empty-state">No audit events match the current filter set.</div>
          ) : (
            <div className="audit-event-list">
              {events.map((event) => (
                <button
                  key={event.id}
                  className={`audit-event-row${selectedEvent?.id === event.id ? ' selected' : ''}`}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <div className="audit-event-row-top">
                    <span className={`audit-severity-badge severity-${severityForEvent(event)}`}>{severityForEvent(event)}</span>
                    <span className="audit-event-time">{formatDateTime(event.occurred_at)}</span>
                  </div>
                  <div className="audit-event-summary">{event.summary}</div>
                  <div className="audit-event-meta">
                    <span>{event.domain}</span>
                    <span>{event.action || event.event_type}</span>
                    <span>{event.subject_type}:{event.subject_id}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="action-page-surface audit-detail-panel">
          <div className="audit-panel-header">
            <div>
              <h2>Event Detail</h2>
              <p>Inspect the canonical event payload, context, and field-level diff.</p>
            </div>
          </div>

          {!selectedEvent ? (
            <div className="audit-empty-state">Select an event to inspect its full audit payload.</div>
          ) : (
            <div className="audit-detail-stack">
              <div className="audit-detail-card">
                <div className="audit-detail-grid">
                  <div><span className="audit-detail-label">Action</span><strong>{selectedEvent.action || selectedEvent.event_type}</strong></div>
                  <div><span className="audit-detail-label">Domain</span><strong>{selectedEvent.domain}</strong></div>
                  <div><span className="audit-detail-label">Actor</span><strong>{selectedEvent.actor_name || selectedEvent.actor_id || 'System'}</strong></div>
                  <div><span className="audit-detail-label">Occurred</span><strong>{formatDateTime(selectedEvent.occurred_at)}</strong></div>
                  <div><span className="audit-detail-label">Subject</span><strong>{selectedEvent.subject_type}:{selectedEvent.subject_id}</strong></div>
                  <div><span className="audit-detail-label">Correlation</span><strong>{selectedEvent.correlation_id || '—'}</strong></div>
                </div>
                <p className="audit-detail-summary">{selectedEvent.summary}</p>
              </div>

              <div className="audit-payload-card">
                <h3>Context</h3>
                <pre>{prettyJson(selectedEvent.context)}</pre>
              </div>

              <div className="audit-payload-card">
                <h3>Diff</h3>
                <pre>{prettyJson(selectedEvent.diff)}</pre>
              </div>

              <div className="audit-payload-card">
                <h3>Metadata</h3>
                <pre>{prettyJson(selectedEvent.metadata)}</pre>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default EnterpriseAuditExplorer;