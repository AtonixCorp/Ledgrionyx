import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useEquity } from '../../../context/EquityContext';
import '../components/EquityModuleScreen.css';
import '../components/EquityCrudModuleScreen.css';

const formatDateTime = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
};

const ApprovalInbox = () => {
  const { user } = useAuth();
  const {
    saving,
    error,
    scenarioApprovalPolicy,
    reviewerCandidates,
    scenarioApprovalInbox,
    boardApproveScenario,
    legalApproveScenario,
    rejectScenarioApproval,
    commitScenario,
    updateScenarioApprovalPolicy,
    runScenarioApprovalSlaSweep,
  } = useEquity();

  const [policyForm, setPolicyForm] = useState({
    board_reviewers: [],
    legal_reviewers: [],
    board_escalation_reviewers: [],
    legal_escalation_reviewers: [],
    board_sla_hours: 72,
    legal_sla_hours: 72,
    escalation_enabled: true,
    escalation_grace_hours: 24,
    reminder_frequency_hours: 24,
  });
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedApprovalId, setSelectedApprovalId] = useState('');

  useEffect(() => {
    if (!scenarioApprovalPolicy) {
      return;
    }
    setPolicyForm({
      board_reviewers: scenarioApprovalPolicy.board_reviewers || [],
      legal_reviewers: scenarioApprovalPolicy.legal_reviewers || [],
      board_escalation_reviewers: scenarioApprovalPolicy.board_escalation_reviewers || [],
      legal_escalation_reviewers: scenarioApprovalPolicy.legal_escalation_reviewers || [],
      require_explicit_reviewers: Boolean(scenarioApprovalPolicy.require_explicit_reviewers),
      require_designated_backups: Boolean(scenarioApprovalPolicy.require_designated_backups),
      board_sla_hours: scenarioApprovalPolicy.board_sla_hours || 72,
      legal_sla_hours: scenarioApprovalPolicy.legal_sla_hours || 72,
      escalation_enabled: Boolean(scenarioApprovalPolicy.escalation_enabled),
      escalation_grace_hours: scenarioApprovalPolicy.escalation_grace_hours || 24,
      reminder_frequency_hours: scenarioApprovalPolicy.reminder_frequency_hours || 24,
    });
  }, [scenarioApprovalPolicy]);

  const metrics = useMemo(() => ([
    {
      label: 'Pending Reviews',
      value: scenarioApprovalInbox.summary?.pending_count || 0,
      note: 'Approvals waiting on current reviewer scope.',
    },
    {
      label: 'Overdue Reviews',
      value: scenarioApprovalInbox.summary?.overdue_count || 0,
      note: 'Approvals that crossed SLA deadlines.',
    },
    {
      label: 'Board Reviewer Access',
      value: scenarioApprovalInbox.summary?.board_reviewer ? 'Yes' : 'No',
      note: 'Current user can take board-review actions.',
    },
    {
      label: 'Legal Reviewer Access',
      value: scenarioApprovalInbox.summary?.legal_reviewer ? 'Yes' : 'No',
      note: 'Current user can take legal-review actions.',
    },
  ]), [scenarioApprovalInbox]);

  const filteredApprovals = useMemo(() => {
    const rows = scenarioApprovalInbox.pending || [];
    switch (activeFilter) {
      case 'mine':
        return rows.filter((approval) => (
          String(approval.requested_by || '') === String(user?.id || '')
          || String(approval.board_approved_by || '') === String(user?.id || '')
          || String(approval.legal_approved_by || '') === String(user?.id || '')
          || approval.can_board_approve
          || approval.can_legal_approve
        ));
      case 'overdue':
        return rows.filter((approval) => (approval.overdue_reviews || []).length > 0);
      case 'awaiting_board':
        return rows.filter((approval) => approval.board_status === 'pending');
      case 'awaiting_legal':
        return rows.filter((approval) => approval.legal_status === 'pending');
      case 'committable':
        return rows.filter((approval) => approval.status === 'approved');
      default:
        return rows;
    }
  }, [activeFilter, scenarioApprovalInbox.pending, user?.id]);

  const selectedApproval = useMemo(() => {
    return filteredApprovals.find((approval) => approval.id === selectedApprovalId) || filteredApprovals[0] || null;
  }, [filteredApprovals, selectedApprovalId]);

  useEffect(() => {
    if (!filteredApprovals.find((approval) => approval.id === selectedApprovalId)) {
      setSelectedApprovalId(filteredApprovals[0]?.id || '');
    }
  }, [filteredApprovals, selectedApprovalId]);

  const handleMultiSelectChange = (key, event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setPolicyForm((current) => ({ ...current, [key]: values }));
  };

  const handlePolicySave = async (event) => {
    event.preventDefault();
    if (!scenarioApprovalPolicy?.id) {
      return;
    }
    await updateScenarioApprovalPolicy(scenarioApprovalPolicy.id, {
      ...policyForm,
      require_explicit_reviewers: Boolean(policyForm.require_explicit_reviewers),
      require_designated_backups: Boolean(policyForm.require_designated_backups),
      board_sla_hours: Number(policyForm.board_sla_hours || 72),
      legal_sla_hours: Number(policyForm.legal_sla_hours || 72),
      escalation_grace_hours: Number(policyForm.escalation_grace_hours || 24),
      reminder_frequency_hours: Number(policyForm.reminder_frequency_hours || 24),
    });
    setMessage('Approval policy updated.');
  };

  const handleSweep = async () => {
    const result = await runScenarioApprovalSlaSweep();
    setMessage(`SLA sweep finished: ${result.reminders_sent} reminders and ${result.escalations_sent} escalations.`);
  };

  const handleCommit = async (approvalId) => {
    const result = await commitScenario({ approval_id: approvalId });
    setMessage(`Committed ${result.funding_round_name} from the approval inbox.`);
  };

  return (
    <section className="eq-screen">
      <div className="eq-screen-hero">
        <div>
          <h2>Approval Inbox</h2>
          <p>Manage explicit board and legal reviewer assignments, monitor SLA deadlines, and process pending scenario approvals from a dedicated governance workspace.</p>
        </div>
        <div className="eq-screen-banner">
          Reviewer access is driven by workspace assignments, not role-name heuristics, and overdue approvals can be nudged or escalated from the same surface.
        </div>
      </div>

      <div className="eq-metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="eq-metric-card">
            <span className="eq-metric-label">{metric.label}</span>
            <strong className="eq-metric-value">{metric.value}</strong>
            <span className="eq-metric-note">{metric.note}</span>
          </article>
        ))}
      </div>

      {error && <div className="eq-error-banner">{error}</div>}
      {message && <div className="eq-status-chip success" style={{ marginBottom: '1rem' }}>{message}</div>}

      <div className="eq-crud-layout">
        <aside className="eq-data-card eq-form-card">
          <div className="eq-data-card-head">
            <h3>Reviewer Settings & SLA Policy</h3>
            <button type="button" className="eq-inline-btn" onClick={handleSweep} disabled={saving}>Run SLA sweep</button>
          </div>
          <form className="eq-form-grid" onSubmit={handlePolicySave}>
            <label className="eq-form-field full">
              <span className="eq-form-label">Board reviewers</span>
              <select className="eq-form-select" multiple value={policyForm.board_reviewers} onChange={(event) => handleMultiSelectChange('board_reviewers', event)}>
                {reviewerCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.full_name} · {candidate.role_name || 'No role'}</option>)}
              </select>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Legal reviewers</span>
              <select className="eq-form-select" multiple value={policyForm.legal_reviewers} onChange={(event) => handleMultiSelectChange('legal_reviewers', event)}>
                {reviewerCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.full_name} · {candidate.role_name || 'No role'}</option>)}
              </select>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Board escalation reviewers</span>
              <select className="eq-form-select" multiple value={policyForm.board_escalation_reviewers} onChange={(event) => handleMultiSelectChange('board_escalation_reviewers', event)}>
                {reviewerCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.full_name} · {candidate.role_name || 'No role'}</option>)}
              </select>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Legal escalation reviewers</span>
              <select className="eq-form-select" multiple value={policyForm.legal_escalation_reviewers} onChange={(event) => handleMultiSelectChange('legal_escalation_reviewers', event)}>
                {reviewerCandidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.full_name} · {candidate.role_name || 'No role'}</option>)}
              </select>
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={Boolean(policyForm.require_explicit_reviewers)} onChange={(event) => setPolicyForm((current) => ({ ...current, require_explicit_reviewers: event.target.checked }))} />
              <span>Require explicit board and legal reviewers before a scenario can be submitted</span>
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={Boolean(policyForm.require_designated_backups)} onChange={(event) => setPolicyForm((current) => ({ ...current, require_designated_backups: event.target.checked }))} />
              <span>Require designated backup reviewers before a scenario can be submitted</span>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Board SLA hours</span>
              <input className="eq-form-input" type="number" min="1" value={policyForm.board_sla_hours} onChange={(event) => setPolicyForm((current) => ({ ...current, board_sla_hours: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Legal SLA hours</span>
              <input className="eq-form-input" type="number" min="1" value={policyForm.legal_sla_hours} onChange={(event) => setPolicyForm((current) => ({ ...current, legal_sla_hours: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Escalation grace hours</span>
              <input className="eq-form-input" type="number" min="1" value={policyForm.escalation_grace_hours} onChange={(event) => setPolicyForm((current) => ({ ...current, escalation_grace_hours: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Reminder frequency hours</span>
              <input className="eq-form-input" type="number" min="1" value={policyForm.reminder_frequency_hours} onChange={(event) => setPolicyForm((current) => ({ ...current, reminder_frequency_hours: event.target.value }))} />
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={policyForm.escalation_enabled} onChange={(event) => setPolicyForm((current) => ({ ...current, escalation_enabled: event.target.checked }))} />
              <span>Enable automatic escalation reminders for overdue reviews</span>
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving}>Save policy</button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Overdue Approvals</h3>
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Board Due</th>
                  <th>Legal Due</th>
                  <th>Overdue</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scenarioApprovalInbox.overdue.map((approval) => (
                  <tr key={approval.id}>
                    <td>{approval.title}</td>
                    <td>{formatDateTime(approval.board_due_at)}</td>
                    <td>{formatDateTime(approval.legal_due_at)}</td>
                    <td>{(approval.overdue_reviews || []).join(', ') || '—'}</td>
                    <td>{approval.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="eq-data-card">
        <div className="eq-data-card-head">
          <h3>Approval Queue</h3>
        </div>
        <div className="eq-form-actions" style={{ marginBottom: '1rem' }}>
          <button type="button" className={`eq-inline-btn${activeFilter === 'all' ? ' primary' : ''}`} onClick={() => setActiveFilter('all')}>All</button>
          <button type="button" className={`eq-inline-btn${activeFilter === 'mine' ? ' primary' : ''}`} onClick={() => setActiveFilter('mine')}>Mine</button>
          <button type="button" className={`eq-inline-btn${activeFilter === 'overdue' ? ' primary' : ''}`} onClick={() => setActiveFilter('overdue')}>Overdue</button>
          <button type="button" className={`eq-inline-btn${activeFilter === 'awaiting_board' ? ' primary' : ''}`} onClick={() => setActiveFilter('awaiting_board')}>Awaiting Board</button>
          <button type="button" className={`eq-inline-btn${activeFilter === 'awaiting_legal' ? ' primary' : ''}`} onClick={() => setActiveFilter('awaiting_legal')}>Awaiting Legal</button>
          <button type="button" className={`eq-inline-btn${activeFilter === 'committable' ? ' primary' : ''}`} onClick={() => setActiveFilter('committable')}>Committable</button>
        </div>
        <div className="eq-table-wrap">
          <table className="eq-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Requested By</th>
                <th>Board</th>
                <th>Legal</th>
                <th>Board Due</th>
                <th>Legal Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} onClick={() => setSelectedApprovalId(approval.id)} style={{ cursor: 'pointer', background: selectedApprovalId === approval.id ? 'rgba(12, 64, 52, 0.08)' : undefined }}>
                  <td>{approval.title}</td>
                  <td>{approval.requested_by_name || '—'}</td>
                  <td>{approval.board_status}</td>
                  <td>{approval.legal_status}</td>
                  <td>{formatDateTime(approval.board_due_at)}</td>
                  <td>{formatDateTime(approval.legal_due_at)}</td>
                  <td>
                    <div className="eq-table-actions">
                      <button type="button" className="eq-inline-btn" disabled={!approval.can_board_approve} onClick={() => boardApproveScenario(approval.id, {})}>Board approve</button>
                      <button type="button" className="eq-inline-btn" disabled={!approval.can_legal_approve} onClick={() => legalApproveScenario(approval.id, {})}>Legal approve</button>
                      {approval.status === 'approved' && <button type="button" className="eq-inline-btn" onClick={() => handleCommit(approval.id)}>Commit</button>}
                      <button type="button" className="eq-inline-btn danger" disabled={!approval.can_board_approve && !approval.can_legal_approve} onClick={() => rejectScenarioApproval(approval.id, { reviewer_type: approval.can_legal_approve ? 'legal' : 'board', comments: 'Rejected from approval inbox.' })}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApproval && (
        <div className="eq-data-card" style={{ marginTop: '1.5rem' }}>
          <div className="eq-data-card-head">
            <h3>Approval Timeline</h3>
            <span className="eq-status-chip">{selectedApproval.title}</span>
          </div>
          <div className="eq-metric-grid">
            {(selectedApproval.timeline_events || []).map((event) => (
              <article key={event.id} className="eq-metric-card" style={{ alignItems: 'stretch' }}>
                <span className="eq-metric-label">{event.title}</span>
                <strong className="eq-metric-value" style={{ fontSize: '1rem' }}>{formatDateTime(event.created_at)}</strong>
                <span className="eq-metric-note">{event.actor_name || 'System'}</span>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--eq-muted-ink, #4c5a52)' }}>{event.message || 'No additional notes.'}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ApprovalInbox;