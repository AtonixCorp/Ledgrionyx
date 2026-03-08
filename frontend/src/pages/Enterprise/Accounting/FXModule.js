import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaGlobe, FaExchangeAlt, FaPlus, FaTimes, FaSave, FaDownload } from 'react-icons/fa';
import { exchangeRatesAPI, fxGainLossAPI } from '../../../services/api';
import './Accounting.css';

const fmt = (v, currency = 'USD') => {
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD', minimumFractionDigits: 4 }).format(parseFloat(v || 0)); } 
  catch { return `${currency} ${parseFloat(v || 0).toFixed(4)}`; }
};
const fmtChange = (v) => {
  const n = parseFloat(v || 0);
  return <span style={{ color: n >= 0 ? '#38a169' : '#e53e3e', fontWeight: 600 }}>{n >= 0 ? '+' : ''}{n.toFixed(4)}</span>;
};

const TABS = [
  { id: 'rates', label: 'Exchange Rates', icon: <FaGlobe /> },
  { id: 'fxgl', label: 'FX Gain / Loss', icon: <FaExchangeAlt /> },
];

// ─── Exchange Rates Tab ───────────────────────────────────────────────────────
const ExchangeRatesTab = ({ entityId }) => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ base_currency: 'USD', quote_currency: 'EUR', rate: '', rate_date: new Date().toISOString().split('T')[0], rate_type: 'spot', source: 'manual' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await exchangeRatesAPI.getAll({ entity: entityId }); setRates(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = rates.filter(r => !search || r.base_currency.includes(search.toUpperCase()) || r.quote_currency.includes(search.toUpperCase()));

  const handleNew = () => { setEditing(null); setForm({ base_currency: 'USD', quote_currency: 'EUR', rate: '', rate_date: new Date().toISOString().split('T')[0], rate_type: 'spot', source: 'manual' }); setShowForm(true); };
  const handleEdit = (r) => { setEditing(r); setForm({ base_currency: r.base_currency, quote_currency: r.quote_currency, rate: r.rate, rate_date: r.rate_date, rate_type: r.rate_type || 'spot', source: r.source || 'manual' }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, entity: parseInt(entityId) };
      if (editing) { await exchangeRatesAPI.update(editing.id, payload); } else { await exchangeRatesAPI.create(payload); }
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exchange rate?')) return;
    try { await exchangeRatesAPI.delete(id); await load(); } catch (e) { alert('Delete failed'); }
  };

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Rate Records</div><div className="acct-stat-count">{rates.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Currency Pairs</div><div className="acct-stat-count">{new Set(rates.map(r => `${r.base_currency}/${r.quote_currency}`)).size}</div></div>
      </div>
      <div className="tab-toolbar">
        <div className="acct-search" style={{ minWidth: 200 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by currency (USD, EUR...)  " style={{ paddingLeft: 12 }} />
        </div>
        <button className="btn-primary" onClick={handleNew}><FaPlus /> Add Rate</button>
      </div>
      {loading ? <div className="acct-loading">Loading rates...</div> : (
        <table className="acct-table">
          <thead><tr><th>Pair</th><th>Date</th><th>Rate</th><th>Inverse</th><th>Type</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={7} className="empty-row">No exchange rates found</td></tr> : filtered.map(r => (
              <tr key={r.id}>
                <td><strong style={{ fontFamily: 'monospace', fontSize: '1rem' }}>{r.base_currency} / {r.quote_currency}</strong></td>
                <td>{r.rate_date}</td>
                <td style={{ fontWeight: 700, color: '#667eea', fontFamily: 'monospace' }}>{parseFloat(r.rate).toFixed(6)}</td>
                <td style={{ color: '#718096', fontFamily: 'monospace' }}>{(1 / parseFloat(r.rate)).toFixed(6)}</td>
                <td><span className="tag">{r.rate_type}</span></td>
                <td><span className="tag tag-type">{r.source}</span></td>
                <td className="acct-actions">
                  <button className="btn-icon" onClick={() => handleEdit(r)}><FaPlus style={{ transform: 'rotate(45deg)' }} /></button>
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(r.id)}><FaTimes /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Rate' : 'Add Exchange Rate'}</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Base Currency *</label><input value={form.base_currency} maxLength={3} onChange={e => setForm(p => ({ ...p, base_currency: e.target.value.toUpperCase() }))} placeholder="USD" /></div>
                <div className="form-row"><label>Quote Currency *</label><input value={form.quote_currency} maxLength={3} onChange={e => setForm(p => ({ ...p, quote_currency: e.target.value.toUpperCase() }))} placeholder="EUR" /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Rate *</label><input type="number" step="0.000001" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))} placeholder="1.0850" /><span className="form-note">How many quote currency per 1 base</span></div>
                <div className="form-row"><label>Date *</label><input type="date" value={form.rate_date} onChange={e => setForm(p => ({ ...p, rate_date: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Rate Type</label><select value={form.rate_type} onChange={e => setForm(p => ({ ...p, rate_type: e.target.value }))}><option value="spot">Spot</option><option value="forward">Forward</option><option value="average">Average</option><option value="closing">Closing</option></select></div>
                <div className="form-row"><label>Source</label><select value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}><option value="manual">Manual</option><option value="ecb">ECB</option><option value="fed">Federal Reserve</option><option value="api">API</option></select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FaSave /> Save</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── FX Gain / Loss Tab ───────────────────────────────────────────────────────
const FXGainLossTab = ({ entityId }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ transaction_date: new Date().toISOString().split('T')[0], original_currency: '', functional_currency: 'USD', original_amount: '', functional_amount_at_transaction: '', functional_amount_at_settlement: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fxGainLossAPI.getAll({ entity: entityId }); setRecords(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const totalGain = records.reduce((s, r) => s + parseFloat(r.gain_loss_amount || 0), 0);
  const gains = records.filter(r => parseFloat(r.gain_loss_amount || 0) > 0);
  const losses = records.filter(r => parseFloat(r.gain_loss_amount || 0) < 0);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await fxGainLossAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Records</div><div className="acct-stat-count">{records.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Net FX Impact</div><div className="acct-stat-count" style={{ fontSize: '1.2rem', color: totalGain >= 0 ? '#38a169' : '#e53e3e' }}>{totalGain >= 0 ? '+' : ''}{totalGain.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">FX Gains</div><div className="acct-stat-count" style={{ color: '#38a169' }}>{gains.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">FX Losses</div><div className="acct-stat-count" style={{ color: '#e53e3e' }}>{losses.length}</div></div>
      </div>
      <div className="tab-toolbar">
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> Record FX Gain/Loss</button>
      </div>
      {loading ? <div className="acct-loading">Loading FX records...</div> : (
        <table className="acct-table">
          <thead><tr><th>Date</th><th>Currency</th><th>Original Amount</th><th>Txn Rate Amount</th><th>Settlement Amount</th><th>Gain / Loss</th><th>Description</th></tr></thead>
          <tbody>
            {records.length === 0 ? <tr><td colSpan={7} className="empty-row">No FX gain/loss records found</td></tr> : records.map(r => (
              <tr key={r.id}>
                <td>{r.transaction_date}</td>
                <td><strong style={{ fontFamily: 'monospace' }}>{r.original_currency} → {r.functional_currency}</strong></td>
                <td style={{ fontFamily: 'monospace' }}>{r.original_currency} {parseFloat(r.original_amount || 0).toLocaleString()}</td>
                <td>{fmt(r.functional_amount_at_transaction, r.functional_currency)}</td>
                <td>{fmt(r.functional_amount_at_settlement, r.functional_currency)}</td>
                <td>{fmtChange(r.gain_loss_amount)}</td>
                <td style={{ color: '#718096', maxWidth: 200 }}>{r.description || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Record FX Gain / Loss</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Original Currency *</label><input value={form.original_currency} maxLength={3} onChange={e => setForm(p => ({ ...p, original_currency: e.target.value.toUpperCase() }))} placeholder="EUR" /></div>
                <div className="form-row"><label>Functional Currency *</label><input value={form.functional_currency} maxLength={3} onChange={e => setForm(p => ({ ...p, functional_currency: e.target.value.toUpperCase() }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Transaction Date *</label><input type="date" value={form.transaction_date} onChange={e => setForm(p => ({ ...p, transaction_date: e.target.value }))} /></div>
                <div className="form-row"><label>Original Amount *</label><input type="number" step="0.01" value={form.original_amount} onChange={e => setForm(p => ({ ...p, original_amount: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Functional at Transaction *</label><input type="number" step="0.01" value={form.functional_amount_at_transaction} onChange={e => setForm(p => ({ ...p, functional_amount_at_transaction: e.target.value }))} /></div>
                <div className="form-row"><label>Functional at Settlement *</label><input type="number" step="0.01" value={form.functional_amount_at_settlement} onChange={e => setForm(p => ({ ...p, functional_amount_at_settlement: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <><FaSave /> Record</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main FX Module ───────────────────────────────────────────────────────────
const FXModule = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('rates');

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1><FaGlobe /> FX Accounting</h1>
          <p>Manage exchange rates and track foreign currency gain/loss</p>
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
        {activeTab === 'rates' && <ExchangeRatesTab entityId={entityId} />}
        {activeTab === 'fxgl' && <FXGainLossTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default FXModule;
