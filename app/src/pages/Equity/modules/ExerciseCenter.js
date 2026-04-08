import React, { useMemo, useState } from 'react';
import { useEquity } from '../../../context/EquityContext';
import '../components/EquityModuleScreen.css';
import '../components/EquityCrudModuleScreen.css';

const EMPTY_FORM = {
  grant: '',
  requested_units: '0',
  payment_method: 'bank_transfer',
  notes: '',
};

const ExerciseCenter = () => {
  const {
    grants,
    exerciseRequests,
    certificates,
    payrollTaxEvents,
    summary,
    loading,
    error,
    saving,
    createExerciseRequest,
    deleteExerciseRequest,
    approveExerciseRequest,
    rejectExerciseRequest,
    markExerciseRequestPaid,
    completeExerciseRequest,
    downloadCertificatePdf,
    regenerateCertificatePdf,
  } = useEquity();
  const [form, setForm] = useState(EMPTY_FORM);

  const metrics = useMemo(() => ([
    { label: 'Active requests', value: summary.activeExercises, note: 'Open exercise requests moving through approvals' },
    { label: 'Certificates issued', value: summary.certificatesIssued, note: 'Executed exercises with ownership documents issued' },
    { label: 'Payroll tax events', value: payrollTaxEvents.length, note: 'Exercise-linked payroll and withholding sync records' },
  ]), [payrollTaxEvents.length, summary.activeExercises, summary.certificatesIssued]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await createExerciseRequest({
      grant: form.grant,
      requested_units: Number(form.requested_units || 0),
      payment_method: form.payment_method,
      notes: form.notes,
    });
    setForm(EMPTY_FORM);
  };

  return (
    <section className="eq-screen">
      <div className="eq-screen-hero">
        <div>
          <h2>Exercise Workflow</h2>
          <p>Route vested option exercises through payment, withholding, approvals, certificates, ledger posting, and cap table updates from one surface.</p>
        </div>
        <div className="eq-screen-banner">
          Each approved exercise can generate tax calculations, payroll sync records, journal entries, certificates, and executed ownership transactions.
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

      <div className="eq-crud-layout">
        <aside className="eq-data-card eq-form-card">
          <div className="eq-data-card-head">
            <h3>Create exercise request</h3>
          </div>
          <p className="eq-form-copy">Employees or administrators can submit vested exercise requests here. The workflow validates availability and moves requests through finance and legal approval.</p>
          <form className="eq-form-grid" onSubmit={handleSubmit}>
            <label className="eq-form-field full">
              <span className="eq-form-label">Grant</span>
              <select className="eq-form-select" name="grant" value={form.grant} onChange={handleChange}>
                <option value="">Select grant</option>
                {grants.map((grant) => (
                  <option key={grant.id} value={grant.id}>
                    {grant.grant_number} · {grant.shareholder_name} · {grant.vesting_summary?.available_to_exercise || 0} exercisable
                  </option>
                ))}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Requested units</span>
              <input className="eq-form-input" type="number" min="0" step="1" name="requested_units" value={form.requested_units} onChange={handleChange} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Payment method</span>
              <select className="eq-form-select" name="payment_method" value={form.payment_method} onChange={handleChange}>
                <option value="bank_transfer">Bank transfer</option>
                <option value="payroll_deduction">Payroll deduction</option>
                <option value="wallet">Wallet</option>
                <option value="cashless">Cashless exercise</option>
              </select>
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Notes</span>
              <textarea className="eq-form-textarea" rows="4" name="notes" value={form.notes} onChange={handleChange} placeholder="Exercise rationale, legal references, or payment notes" />
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving}>
                {saving ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Exercise Requests</h3>
            {!loading && !error && <span className="eq-status-chip success">Live</span>}
            {loading && <span className="eq-status-chip">Syncing</span>}
            {error && <span className="eq-status-chip danger">Attention</span>}
          </div>
          {error && <div className="eq-error-banner">{error}</div>}
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Grant</th>
                  <th>Holder</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Withholding</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exerciseRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.grant_number || '—'}</td>
                    <td>{request.shareholder_name || '—'}</td>
                    <td>{request.requested_units}</td>
                    <td>{request.status}</td>
                    <td>{request.payment_status}</td>
                    <td>{request.tax_withholding_amount}</td>
                    <td>
                      <div className="eq-table-actions">
                        <button type="button" className="eq-inline-btn" onClick={() => approveExerciseRequest(request.id, { comments: 'Approved in workflow center' })}>Approve</button>
                        <button type="button" className="eq-inline-btn" onClick={() => markExerciseRequestPaid(request.id, { payment_status: 'paid' })}>Mark paid</button>
                        <button type="button" className="eq-inline-btn" onClick={() => completeExerciseRequest(request.id)}>Complete</button>
                        <button type="button" className="eq-inline-btn danger" onClick={() => rejectExerciseRequest(request.id, { comments: 'Rejected in workflow center' })}>Reject</button>
                        <button type="button" className="eq-inline-btn danger" onClick={() => deleteExerciseRequest(request.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && exerciseRequests.length === 0 && (
                  <tr>
                    <td colSpan="7">No exercise requests yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="eq-data-card" style={{ marginTop: 18, padding: 0, boxShadow: 'none', border: '0', background: 'transparent' }}>
            <div className="eq-data-card-head" style={{ marginBottom: 10 }}>
              <h3>Issued Certificates</h3>
            </div>
            <div className="eq-table-wrap">
              <table className="eq-table">
                <thead>
                  <tr>
                    <th>Certificate</th>
                    <th>Grant</th>
                    <th>Issued To</th>
                    <th>Units</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.slice(0, 8).map((certificate) => (
                    <tr key={certificate.id}>
                      <td>{certificate.certificate_number}</td>
                      <td>{certificate.grant_number || '—'}</td>
                      <td>{certificate.issued_to_name || '—'}</td>
                      <td>{certificate.issued_units}</td>
                        <td>
                          <div className="eq-table-actions">
                            <span>{certificate.status}</span>
                            <button type="button" className="eq-inline-btn" onClick={() => downloadCertificatePdf(certificate.id, `certificate-${certificate.certificate_number}.pdf`)}>PDF</button>
                            <button type="button" className="eq-inline-btn" onClick={() => regenerateCertificatePdf(certificate.id)}>Regen PDF</button>
                          </div>
                        </td>
                    </tr>
                  ))}
                  {!loading && certificates.length === 0 && (
                    <tr>
                      <td colSpan="5">No certificates issued yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="eq-data-card" style={{ marginTop: 18, padding: 0, boxShadow: 'none', border: '0', background: 'transparent' }}>
            <div className="eq-data-card-head" style={{ marginBottom: 10 }}>
              <h3>Payroll & Tax Sync</h3>
            </div>
            <div className="eq-table-wrap">
              <table className="eq-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Type</th>
                    <th>Gross</th>
                    <th>Withholding</th>
                    <th>Sync Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payrollTaxEvents.slice(0, 8).map((event) => (
                    <tr key={event.id}>
                      <td>{event.reference_number || '—'}</td>
                      <td>{event.event_type}</td>
                      <td>{event.gross_amount}</td>
                      <td>{event.withholding_amount}</td>
                      <td>{event.payroll_sync_status}</td>
                    </tr>
                  ))}
                  {!loading && payrollTaxEvents.length === 0 && (
                    <tr>
                      <td colSpan="5">No payroll-tax sync events created yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExerciseCenter;
