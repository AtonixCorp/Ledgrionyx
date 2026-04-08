import React, { useMemo, useState } from 'react';
import { useEquity } from '../../../context/EquityContext';
import '../components/EquityModuleScreen.css';
import '../components/EquityCrudModuleScreen.css';

const paymentMethodOptions = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'payroll_deduction', label: 'Payroll Deduction' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'cashless', label: 'Cashless Exercise' },
];

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '—';
const formatNumber = (value) => new Intl.NumberFormat('en-US').format(Number(value || 0));

const MyEquity = () => {
  const {
    loading,
    error,
    saving,
    selfService,
    downloadCertificatePdf,
    downloadDeliveryDocument,
    downloadGrantPackage,
    submitSelfServiceExercise,
  } = useEquity();

  const [formState, setFormState] = useState({
    grant: '',
    requested_units: '',
    payment_method: 'bank_transfer',
    notes: '',
  });

  const accessibleGrants = selfService?.grants || [];
  const upcomingEvents = useMemo(
    () => [...(selfService?.vestingEvents || [])]
      .sort((left, right) => new Date(left.vest_date) - new Date(right.vest_date))
      .slice(0, 8),
    [selfService]
  );

  const metrics = useMemo(() => {
    const grants = selfService?.grants || [];
    const vested = grants.reduce((total, grant) => total + Number(grant.vesting_summary?.vested_units || 0), 0);
    const exercisable = grants.reduce((total, grant) => total + Number(grant.vesting_summary?.available_to_exercise || 0), 0);
    const pendingExercises = (selfService?.exerciseRequests || []).filter((item) => ['requested', 'finance_review', 'legal_review', 'approved'].includes(item.status)).length;
    return [
      { label: 'My Grants', value: formatNumber(grants.length), note: 'Active and historical grant records.' },
      { label: 'Vested Units', value: formatNumber(vested), note: 'Units released into your exercisable balance.' },
      { label: 'Available To Exercise', value: formatNumber(exercisable), note: 'Units currently available for employee self-service exercise.' },
      { label: 'Open Requests', value: formatNumber(pendingExercises), note: 'Exercise requests still in approval or payment workflow.' },
    ];
  }, [selfService]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitSelfServiceExercise({
      grant: formState.grant,
      requested_units: Number(formState.requested_units || 0),
      payment_method: formState.payment_method,
      notes: formState.notes,
    });
    setFormState({
      grant: '',
      requested_units: '',
      payment_method: 'bank_transfer',
      notes: '',
    });
  };

  return (
    <section className="eq-screen">
      <div className="eq-screen-hero">
        <div>
          <h2>My Equity</h2>
          <p>Employee self-service access for grants, vesting calendar milestones, certificates, and direct exercise submission.</p>
        </div>
        <div className="eq-screen-banner">
          Requests submitted here feed the same approval, certificate, ledger, and payroll-tax workflows used by the admin equity workspace.
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

      <div className="eq-crud-layout">
        <aside className="eq-data-card eq-form-card">
          <div className="eq-data-card-head">
            <h3>Submit Exercise</h3>
            {loading && <span className="eq-status-chip">Syncing</span>}
          </div>
          <p className="eq-form-copy">
            Submit an employee exercise request against any vested grant assigned to your staff record or email identity.
          </p>
          <form className="eq-form-grid" onSubmit={handleSubmit}>
            <label className="eq-form-field full">
              <span className="eq-form-label">Grant</span>
              <select
                className="eq-form-select"
                value={formState.grant}
                onChange={(event) => setFormState((current) => ({ ...current, grant: event.target.value }))}
              >
                <option value="">Select grant</option>
                {accessibleGrants.map((grant) => (
                  <option key={grant.id} value={grant.id}>
                    {grant.grant_number} · {grant.share_class_name} · {grant.vesting_summary?.available_to_exercise || 0} exercisable
                  </option>
                ))}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Units</span>
              <input
                className="eq-form-input"
                type="number"
                min="1"
                value={formState.requested_units}
                onChange={(event) => setFormState((current) => ({ ...current, requested_units: event.target.value }))}
              />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Payment Method</span>
              <select
                className="eq-form-select"
                value={formState.payment_method}
                onChange={(event) => setFormState((current) => ({ ...current, payment_method: event.target.value }))}
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Notes</span>
              <textarea
                className="eq-form-textarea"
                rows="4"
                value={formState.notes}
                onChange={(event) => setFormState((current) => ({ ...current, notes: event.target.value }))}
                placeholder="Add context for approvers or payroll."
              />
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving || !formState.grant}>
                {saving ? 'Submitting…' : 'Submit Exercise'}
              </button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Employee Profile</h3>
            {selfService?.employee && <span className="eq-status-chip success">Linked</span>}
          </div>
          {selfService?.employee ? (
            <div className="eq-empty-state" style={{ textAlign: 'left' }}>
              <h4>{selfService.employee.full_name}</h4>
              <p>Employee ID: {selfService.employee.employee_id} · Status: {selfService.employee.status}</p>
              <p>Manager: {selfService.employee.manager_name || 'Unassigned'} · Hire Date: {formatDate(selfService.employee.hire_date)}</p>
            </div>
          ) : (
            <div className="eq-empty-state">
              <h4>No staff profile linked</h4>
              <p>Your grants can still be resolved by shareholder email, but manager approvals and payroll sync work best when your user is linked to an entity staff profile.</p>
            </div>
          )}
        </div>
      </div>

      <div className="eq-data-card">
        <div className="eq-data-card-head">
          <h3>My Grants</h3>
        </div>
        <div className="eq-table-wrap">
          <table className="eq-table">
            <thead>
              <tr>
                <th>Grant</th>
                <th>Type</th>
                <th>Total Units</th>
                <th>Vested</th>
                <th>Exercisable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {accessibleGrants.map((grant) => (
                <tr key={grant.id}>
                  <td>{grant.grant_number}</td>
                  <td>{grant.grant_type}</td>
                  <td>{formatNumber(grant.total_units)}</td>
                  <td>{formatNumber(grant.vesting_summary?.vested_units)}</td>
                  <td>{formatNumber(grant.vesting_summary?.available_to_exercise)}</td>
                  <td>
                    <div className="eq-table-actions">
                      <span>{grant.lifecycle_status}</span>
                      <button type="button" className="eq-inline-btn" onClick={() => downloadGrantPackage(grant.id, `grant-package-${grant.grant_number}.pdf`)}>PDF</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="eq-crud-layout">
        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Vesting Calendar</h3>
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Grant</th>
                  <th>Units</th>
                  <th>Event Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{formatDate(event.vest_date)}</td>
                    <td>{event.grant_number}</td>
                    <td>{formatNumber(event.units)}</td>
                    <td>{event.event_type}</td>
                    <td>{event.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Certificates & Deliveries</h3>
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(selfService?.certificates || []).map((certificate) => (
                  <tr key={`cert-${certificate.id}`}>
                    <td>Certificate</td>
                    <td>{certificate.certificate_number}</td>
                    <td>{formatDate(certificate.issue_date)}</td>
                    <td>
                      <div className="eq-table-actions">
                        <span>{certificate.status}</span>
                        <button type="button" className="eq-inline-btn" onClick={() => downloadCertificatePdf(certificate.id, `certificate-${certificate.certificate_number}.pdf`)}>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(selfService?.deliveryLogs || []).slice(0, 8).map((log) => (
                  <tr key={`log-${log.id}`}>
                    <td>{log.channel}</td>
                    <td>{log.subject || log.event_name}</td>
                    <td>{formatDate(log.delivered_at || log.created_at)}</td>
                    <td>
                      <div className="eq-table-actions">
                        <span>{log.status}</span>
                        {log.document_file && (
                          <button type="button" className="eq-inline-btn" onClick={() => downloadDeliveryDocument(log.id, (log.document_file || '').split('/').pop() || 'equity-document.pdf')}>PDF</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyEquity;
