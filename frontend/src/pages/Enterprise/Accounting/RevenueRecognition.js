import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaChartLine, FaCalendarCheck, FaPlus, FaTimes, FaSave, FaDownload } from 'react-icons/fa';
import { deferredRevenuesAPI, revenueRecognitionSchedulesAPI } from '../../../services/api';

const fmt = (v, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));

const TABS = [
  { id: 'deferred', label: 'Deferred Revenue', icon: <FaChartLine /> },
  { id: 'schedules', label: 'Recognition Schedules', icon: <FaCalendarCheck /> },
];

const STATUS_COLORS = { active: '#38a169', completed: '#667eea', cancelled: '#e53e3e', pending: '#ed8936', recognized: '#38a169' };

// ─── Deferred Revenue Tab ─────────────────────────────────────────────────────
const DeferredRevenueTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ contract_name: '', customer_name: '', total_amount: '', start_date: '', end_date: '', recognition_method: 'straight_line', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await deferredRevenuesAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const totalDeferred = items.reduce((s, i) => s + parseFloat(i.deferred_amount || 0), 0);
  const totalRecognized = items.reduce((s, i) => s + parseFloat(i.recognized_amount || 0), 0);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await deferredRevenuesAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Contracts</div><div className="acct-stat-count">{items.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Still Deferred</div><div className="acct-stat-count" style={{ fontSize: '1.2rem', color: '#ed8936' }}>{fmt(totalDeferred)}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Total Recognized</div><div className="acct-stat-count" style={{ fontSize: '1.2rem', color: '#38a169' }}>{fmt(totalRecognized)}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Active Contracts</div><div className="acct-stat-count" style={{ color: '#38a169' }}>{items.filter(i => i.status === 'active').length}</div></div>
      </div>
      <div className="tab-toolbar">
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> New Contract</button>
      </div>
      {loading ? <div className="acct-loading">Loading deferred revenue contracts...</div> : (
        <table className="acct-table">
          <thead><tr><th>Contract</th><th>Customer</th><th>Total</th><th>Recognized</th><th>Deferred</th><th>Period</th><th>Method</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={8} className="empty-row">No deferred revenue contracts found</td></tr> : items.map(item => (
              <tr key={item.id}>
                <td><strong>{item.contract_name}</strong></td>
                <td>{item.customer_name || '—'}</td>
                <td>{fmt(item.total_amount)}</td>
                <td style={{ color: '#38a169', fontWeight: 600 }}>{fmt(item.recognized_amount)}</td>
                <td style={{ color: '#ed8936', fontWeight: 600 }}>{fmt(item.deferred_amount)}</td>
                <td style={{ fontSize: '0.8rem', color: '#718096' }}>{item.start_date} — {item.end_date}</td>
                <td><span className="tag tag-type">{item.recognition_method?.replace(/_/g,' ')}</span></td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[item.status] || '#a0aec0', color: 'white' }}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Deferred Revenue Contract</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Contract Name *</label><input value={form.contract_name} onChange={e => setForm(p => ({ ...p, contract_name: e.target.value }))} /></div>
                <div className="form-row"><label>Customer Name</label><input value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Total Amount *</label><input type="number" step="0.01" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
              <div className="form-row-2">
                <div className="form-row"><label>Start Date *</label><input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                <div className="form-row"><label>End Date *</label><input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Recognition Method</label><select value={form.recognition_method} onChange={e => setForm(p => ({ ...p, recognition_method: e.target.value }))}><option value="straight_line">Straight Line</option><option value="usage_based">Usage Based</option><option value="milestone">Milestone</option><option value="manual">Manual</option></select></div>
              <div className="form-row"><label>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FaSave /> Create</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Recognition Schedules Tab ────────────────────────────────────────────────
const SchedulesTab = ({ entityId }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recognizing, setRecognizing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await revenueRecognitionSchedulesAPI.getAll({ entity: entityId }); setSchedules(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const handleRecognize = async (id) => {
    if (!window.confirm('Recognize revenue for this schedule entry?')) return;
    setRecognizing(id);
    try { await revenueRecognitionSchedulesAPI.recognize(id); await load(); } catch (e) { alert('Recognition failed: ' + (e.response?.data?.detail || 'Unknown error')); }
    setRecognizing(null);
  };

  const pendingTotal = schedules.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseFloat(s.amount || 0), 0);

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Entries</div><div className="acct-stat-count">{schedules.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Pending Recognition</div><div className="acct-stat-count" style={{ color: '#ed8936', fontSize: '1.2rem' }}>{fmt(pendingTotal)}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Recognized This Month</div><div className="acct-stat-count" style={{ color: '#38a169' }}>{schedules.filter(s => s.status === 'recognized').length}</div></div>
      </div>
      {loading ? <div className="acct-loading">Loading recognition schedules...</div> : (
        <table className="acct-table">
          <thead><tr><th>Contract</th><th>Recognition Date</th><th>Amount</th><th>Status</th><th>Recognized At</th><th>Action</th></tr></thead>
          <tbody>
            {schedules.length === 0 ? <tr><td colSpan={6} className="empty-row">No recognition schedule entries found</td></tr> : schedules.map(s => (
              <tr key={s.id}>
                <td>{s.contract_name || `Contract ${s.deferred_revenue}`}</td>
                <td>{s.recognition_date}</td>
                <td style={{ fontWeight: 600, color: '#38a169' }}>{fmt(s.amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[s.status] || '#a0aec0', color: 'white' }}>{s.status}</span></td>
                <td style={{ color: '#718096', fontSize: '0.85rem' }}>{s.recognized_at ? new Date(s.recognized_at).toLocaleDateString() : '—'}</td>
                <td>
                  {s.status === 'pending' && (
                    <button className="btn-success btn-sm" onClick={() => handleRecognize(s.id)} disabled={recognizing === s.id}>
                      {recognizing === s.id ? '...' : 'Recognize'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// ─── Main Revenue Recognition Module ─────────────────────────────────────────
const RevenueRecognition = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('deferred');

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1><FaChartLine /> Revenue Recognition</h1>
          <p>Manage deferred revenue contracts and recognition schedules (ASC 606 / IFRS 15)</p>
        </div>
        <button className="btn-secondary"><FaDownload /> Export</button>
      </div>

      <div className="module-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="module-tab-content">
        {activeTab === 'deferred' && <DeferredRevenueTab entityId={entityId} />}
        {activeTab === 'schedules' && <SchedulesTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default RevenueRecognition;
