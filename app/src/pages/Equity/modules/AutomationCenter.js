import React, { useMemo, useState } from 'react';
import { useEquity } from '../../../context/EquityContext';
import '../components/EquityModuleScreen.css';
import '../components/EquityCrudModuleScreen.css';

const adapterTypeOptions = [
  { value: 'payroll', label: 'Payroll' },
  { value: 'payment', label: 'Payment' },
];

const formatDateTime = (value) => value ? new Date(value).toLocaleString() : '—';

const defaultFormState = {
  adapter_type: 'payroll',
  provider_name: '',
  base_url: '',
  endpoint_path: '',
  auth_scheme: 'Bearer',
  api_key: '',
  is_active: true,
};

const AutomationCenter = () => {
  const {
    loading,
    error,
    saving,
    adapterConfigs,
    adapterPresets,
    deliveryLogs,
    exerciseRequests,
    payrollTaxEvents,
    createAdapterConfig,
    updateAdapterConfig,
    deleteAdapterConfig,
    downloadDeliveryDocument,
    testAdapterConnection,
    syncExercisePayment,
    syncPayrollTaxEvent,
    runVestingSweep,
  } = useEquity();

  const [formState, setFormState] = useState(defaultFormState);
  const [editingId, setEditingId] = useState(null);
  const [selectedPresetKey, setSelectedPresetKey] = useState('');

  const metrics = useMemo(() => ([
    { label: 'Active Adapters', value: adapterConfigs.filter((item) => item.is_active).length, note: 'Outbound payroll and payment provider connections.' },
    { label: 'Delivery Logs', value: deliveryLogs.length, note: 'In-app, email, document, and webhook activity.' },
    { label: 'Queued Payroll Events', value: payrollTaxEvents.filter((item) => item.payroll_sync_status === 'queued').length, note: 'Tax events awaiting payroll adapter sync.' },
    { label: 'Sync-Eligible Payments', value: exerciseRequests.filter((item) => ['approved', 'completed'].includes(item.status)).length, note: 'Exercise requests that can be pushed to payment providers.' },
  ]), [adapterConfigs, deliveryLogs, exerciseRequests, payrollTaxEvents]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await updateAdapterConfig(editingId, formState);
    } else {
      await createAdapterConfig(formState);
    }
    setEditingId(null);
    setFormState(defaultFormState);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormState({
      adapter_type: record.adapter_type,
      provider_name: record.provider_name,
      base_url: record.base_url,
      endpoint_path: record.endpoint_path || '',
      auth_scheme: record.auth_scheme || 'Bearer',
      api_key: '',
      is_active: Boolean(record.is_active),
    });
  };

  const recentLogs = useMemo(() => deliveryLogs.slice(0, 12), [deliveryLogs]);
  const presetOptions = adapterPresets?.[formState.adapter_type] || [];

  const applyPreset = (presetKey) => {
    const preset = presetOptions.find((item) => item.key === presetKey);
    if (!preset) {
      return;
    }
    setSelectedPresetKey(presetKey);
    setFormState((current) => ({
      ...current,
      adapter_type: formState.adapter_type,
      provider_name: preset.provider_name,
      base_url: preset.base_url,
      endpoint_path: preset.endpoint_path,
      auth_scheme: preset.auth_scheme,
      is_active: true,
    }));
  };

  return (
    <section className="eq-screen">
      <div className="eq-screen-hero">
        <div>
          <h2>Automation Center</h2>
          <p>Configure live payroll and payment adapters, test outbound connectivity, and inspect delivery and sync activity.</p>
        </div>
        <div className="eq-screen-banner">
          Adapter calls are executed as real HTTP POST requests using the configured provider base URL, auth scheme, headers, and endpoint path.
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
            <h3>{editingId ? 'Edit Adapter' : 'New Adapter'}</h3>
            {editingId && (
              <button type="button" className="eq-inline-btn secondary" onClick={() => { setEditingId(null); setFormState(defaultFormState); }}>
                Cancel edit
              </button>
            )}
          </div>
          <p className="eq-form-copy">Use adapter configs to push payroll-tax events and exercise payment workflows into external systems.</p>
          <form className="eq-form-grid" onSubmit={handleSubmit}>
            <label className="eq-form-field">
              <span className="eq-form-label">Adapter Type</span>
              <select className="eq-form-select" value={formState.adapter_type} onChange={(event) => { setSelectedPresetKey(''); setFormState((current) => ({ ...current, adapter_type: event.target.value })); }}>
                {adapterTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Preset</span>
              <select className="eq-form-select" value={selectedPresetKey} onChange={(event) => applyPreset(event.target.value)}>
                <option value="">Select preset</option>
                {presetOptions.map((preset) => <option key={preset.key} value={preset.key}>{preset.provider_name}</option>)}
              </select>
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Provider Name</span>
              <input className="eq-form-input" value={formState.provider_name} onChange={(event) => setFormState((current) => ({ ...current, provider_name: event.target.value }))} />
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">Base URL</span>
              <input className="eq-form-input" type="url" value={formState.base_url} onChange={(event) => setFormState((current) => ({ ...current, base_url: event.target.value }))} />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Endpoint Path</span>
              <input className="eq-form-input" value={formState.endpoint_path} onChange={(event) => setFormState((current) => ({ ...current, endpoint_path: event.target.value }))} placeholder="api/v1/equity/events" />
            </label>
            <label className="eq-form-field">
              <span className="eq-form-label">Auth Scheme</span>
              <input className="eq-form-input" value={formState.auth_scheme} onChange={(event) => setFormState((current) => ({ ...current, auth_scheme: event.target.value }))} />
            </label>
            <label className="eq-form-field full">
              <span className="eq-form-label">API Key</span>
              <input className="eq-form-input" type="password" value={formState.api_key} onChange={(event) => setFormState((current) => ({ ...current, api_key: event.target.value }))} placeholder={editingId ? 'Leave blank to keep existing key' : ''} />
            </label>
            <label className="eq-form-checkbox full">
              <input type="checkbox" checked={formState.is_active} onChange={(event) => setFormState((current) => ({ ...current, is_active: event.target.checked }))} />
              <span>Adapter is active</span>
            </label>
            <div className="eq-form-actions">
              <button type="submit" className="eq-inline-btn primary" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save adapter' : 'Create adapter'}</button>
              <button type="button" className="eq-inline-btn" onClick={() => runVestingSweep()}>Run vesting sweep</button>
            </div>
          </form>
        </aside>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Configured Adapters</h3>
            {loading && <span className="eq-status-chip">Syncing</span>}
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Provider</th>
                  <th>Endpoint</th>
                  <th>State</th>
                  <th>Last Sync</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adapterConfigs.map((record) => (
                  <tr key={record.id}>
                    <td>{record.adapter_type}</td>
                    <td>{record.provider_name}</td>
                    <td>{record.base_url}{record.endpoint_path ? `/${record.endpoint_path.replace(/^\/+/, '')}` : ''}</td>
                    <td>{record.is_active ? 'active' : 'inactive'}</td>
                    <td>{formatDateTime(record.last_synced_at)}</td>
                    <td>
                      <div className="eq-table-actions">
                        <button type="button" className="eq-inline-btn" onClick={() => handleEdit(record)}>Edit</button>
                        <button type="button" className="eq-inline-btn" onClick={() => testAdapterConnection(record.id)}>Test</button>
                        <button type="button" className="eq-inline-btn danger" onClick={() => deleteAdapterConfig(record.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="eq-crud-layout">
        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Payment Sync Queue</h3>
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Grant</th>
                  <th>Requester</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exerciseRequests.slice(0, 8).map((record) => (
                  <tr key={record.id}>
                    <td>{record.grant_number}</td>
                    <td>{record.shareholder_name}</td>
                    <td>{record.status}</td>
                    <td>{record.payment_status}</td>
                    <td>
                      <button type="button" className="eq-inline-btn" onClick={() => syncExercisePayment(record.id)}>Sync payment</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="eq-data-card">
          <div className="eq-data-card-head">
            <h3>Payroll Tax Sync Queue</h3>
          </div>
          <div className="eq-table-wrap">
            <table className="eq-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Employee</th>
                  <th>Withholding</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrollTaxEvents.slice(0, 8).map((record) => (
                  <tr key={record.id}>
                    <td>{record.reference_number || '—'}</td>
                    <td>{record.employee_name || '—'}</td>
                    <td>{record.withholding_amount}</td>
                    <td>{record.payroll_sync_status}</td>
                    <td>
                      <button type="button" className="eq-inline-btn" onClick={() => syncPayrollTaxEvent(record.id)}>Sync payroll</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="eq-data-card">
        <div className="eq-data-card-head">
          <h3>Recent Delivery Activity</h3>
        </div>
        <div className="eq-table-wrap">
          <table className="eq-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Channel</th>
                <th>Event</th>
                <th>Recipient</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.delivered_at || log.created_at)}</td>
                  <td>{log.channel}</td>
                  <td>{log.subject || log.event_name}</td>
                  <td>{log.recipient_name || log.recipient_email || 'system'}</td>
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
    </section>
  );
};

export default AutomationCenter;
