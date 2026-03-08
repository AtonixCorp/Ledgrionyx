import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaLock, FaListAlt, FaCalendarAlt, FaPlus, FaTimes, FaSave, FaCheckCircle } from 'react-icons/fa';
import { ledgerPeriodsAPI, periodCloseChecklistsAPI, periodCloseItemsAPI } from '../../../services/api';
import './Accounting.css';

const TABS = [
  { id: 'periods', label: 'Ledger Periods', icon: <FaCalendarAlt /> },
  { id: 'checklists', label: 'Close Checklists', icon: <FaListAlt /> },
];

const STATUS_COLORS = { open: '#38a169', closed: '#e53e3e', pending: '#ed8936', in_progress: '#4299e1', completed: '#38a169' };

// ─── Ledger Periods Tab ───────────────────────────────────────────────────────
const PeriodsTab = ({ entityId }) => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ period_name: '', start_date: '', end_date: '', fiscal_year: new Date().getFullYear().toString() });
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await ledgerPeriodsAPI.getAll({ entity: entityId }); setPeriods(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const handleClose = async (id) => {
    if (!window.confirm('Close this ledger period? No more entries will be allowed.')) return;
    setClosing(id);
    try { await ledgerPeriodsAPI.close(id); await load(); } catch (e) { alert('Close failed: ' + (e.response?.data?.detail || 'Unknown error')); }
    setClosing(null);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await ledgerPeriodsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Periods</div><div className="acct-stat-count">{periods.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Open</div><div className="acct-stat-count" style={{ color: '#38a169' }}>{periods.filter(p => p.status === 'open').length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Closed</div><div className="acct-stat-count" style={{ color: '#e53e3e' }}>{periods.filter(p => p.status === 'closed').length}</div></div>
      </div>
      <div className="tab-toolbar">
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> New Period</button>
      </div>
      {loading ? <div className="acct-loading">Loading ledger periods...</div> : (
        <table className="acct-table">
          <thead><tr><th>Period Name</th><th>Fiscal Year</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Closed At</th><th>Action</th></tr></thead>
          <tbody>
            {periods.length === 0 ? <tr><td colSpan={7} className="empty-row">No ledger periods found</td></tr> : periods.map(p => (
              <tr key={p.id}>
                <td><strong>{p.period_name}</strong></td>
                <td>{p.fiscal_year}</td>
                <td>{p.start_date}</td>
                <td>{p.end_date}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[p.status] || '#a0aec0', color: 'white' }}>{p.status}</span></td>
                <td style={{ color: '#718096', fontSize: '0.85rem' }}>{p.closed_at ? new Date(p.closed_at).toLocaleDateString() : '—'}</td>
                <td>
                  {p.status === 'open' && (
                    <button className="btn-danger btn-sm" onClick={() => handleClose(p.id)} disabled={closing === p.id}>
                      {closing === p.id ? '...' : <><FaLock /> Close Period</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Ledger Period</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Period Name *</label><input value={form.period_name} onChange={e => setForm(p => ({ ...p, period_name: e.target.value }))} placeholder="e.g. January 2025" /></div>
                <div className="form-row"><label>Fiscal Year *</label><input type="number" value={form.fiscal_year} onChange={e => setForm(p => ({ ...p, fiscal_year: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Start Date *</label><input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                <div className="form-row"><label>End Date *</label><input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
              </div>
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

// ─── Checklists Tab ───────────────────────────────────────────────────────────
const ChecklistsTab = ({ entityId }) => {
  const [checklists, setChecklists] = useState([]);
  const [items, setItems] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ checklist_name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await periodCloseChecklistsAPI.getAll({ entity: entityId }); setChecklists(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const loadItems = async (checklistId) => {
    if (items[checklistId]) return;
    try {
      const r = await periodCloseItemsAPI.getAll({ checklist: checklistId, entity: entityId });
      setItems(prev => ({ ...prev, [checklistId]: r.data.results || r.data }));
    } catch (e) { console.error(e); }
  };

  const toggleChecklist = (id) => {
    if (expanded === id) { setExpanded(null); } else { setExpanded(id); loadItems(id); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await periodCloseChecklistsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="mini-stat"><span>Total Checklists</span><strong>{checklists.length}</strong></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><FaPlus /> New Checklist</button>
      </div>
      {loading ? <div className="acct-loading">Loading checklists...</div> : (
        <div className="acct-groups">
          {checklists.length === 0 ? <div className="acct-empty">No period close checklists found</div> : checklists.map(cl => (
            <div key={cl.id} className="acct-group">
              <div className="acct-group-header" onClick={() => toggleChecklist(cl.id)}>
                <span style={{ fontSize: '0.9rem' }}>{expanded === cl.id ? '▼' : '▶'}</span>
                <strong style={{ flex: 1 }}>{cl.checklist_name}</strong>
                {cl.description && <span style={{ color: '#718096', fontSize: '0.82rem' }}>{cl.description}</span>}
                <span className="status-badge" style={{ background: STATUS_COLORS[cl.status] || '#a0aec0', color: 'white' }}>{cl.status}</span>
              </div>
              {expanded === cl.id && (
                <div style={{ padding: '0 16px 16px' }}>
                  {items[cl.id] ? items[cl.id].map(item => (
                    <div key={item.id} className="checklist-item">
                      <input type="checkbox" checked={item.is_completed} readOnly />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{item.item_name}</div>
                        {item.description && <div style={{ fontSize: '0.8rem', color: '#718096' }}>{item.description}</div>}
                      </div>
                      <span className="status-badge" style={{ background: STATUS_COLORS[item.status] || '#a0aec0', color: 'white', fontSize: '0.7rem' }}>{item.status}</span>
                    </div>
                  )) : <div style={{ color: '#a0aec0', textAlign: 'center', padding: 16 }}>Loading items...</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Period Close Checklist</h2><button onClick={() => setShowForm(false)}><FaTimes /></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row"><label>Checklist Name *</label><input value={form.checklist_name} onChange={e => setForm(p => ({ ...p, checklist_name: e.target.value }))} placeholder="e.g. Month-End Close — January 2025" /></div>
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

// ─── Main Period Close Module ─────────────────────────────────────────────────
const PeriodClose = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('periods');

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1><FaLock /> Period Close</h1>
          <p>Manage accounting periods, close checklists, and period-end processes</p>
        </div>
        <span style={{ color: '#718096', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaCheckCircle style={{ color: '#38a169' }} /> Closing a period prevents new journal entries
        </span>
      </div>

      <div className="module-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="module-tab-content">
        {activeTab === 'periods' && <PeriodsTab entityId={entityId} />}
        {activeTab === 'checklists' && <ChecklistsTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default PeriodClose;
