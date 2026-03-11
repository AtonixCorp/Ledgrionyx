import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { journalEntriesAPI } from '../../../services/api';

const STATUS_COLORS = { draft: '#ed8936', posted: '#48bb78', reversed: '#a0aec0' };
const ENTRY_TYPES = ['manual', 'automated', 'reversal', 'adjusting'];

const defaultForm = {
  entry_type: 'manual', reference_number: '', description: '', posting_date: new Date().toISOString().split('T')[0], status: 'draft'
};

const JournalEntries = () => {
  const { entityId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { entity: entityId };
      if (filterStatus) params.status = filterStatus;
      const res = await journalEntriesAPI.getAll(params);
      setEntries(res.data.results || res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e =>
    !search || e.reference_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await journalEntriesAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); setForm(defaultForm); await load();
    } catch (e) { setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleApprove = async (id) => {
    try { await journalEntriesAPI.approve(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Approve failed'); }
  };

  const handleReverse = async (id) => {
    if (!window.confirm('Create a reversal entry for this journal entry?')) return;
    try { await journalEntriesAPI.reverse(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Reverse failed'); }
  };

  const stats = {
    total: entries.length,
    draft: entries.filter(e => e.status === 'draft').length,
    posted: entries.filter(e => e.status === 'posted').length,
    reversed: entries.filter(e => e.status === 'reversed').length,
  };

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1>Journal Entries</h1>
          <p>Record, approve and manage all financial transactions as double-entry journal entries</p>
        </div>
        <div className="acct-header-actions">
          <button className="btn-secondary">Export</button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>New Entry</button>
        </div>
      </div>

      {/* Stats */}
      <div className="acct-stat-cards">
        <div className="acct-stat-card" style={{ borderTop: '3px solid #4299e1' }}>
          <div className="acct-stat-label" style={{ color: '#4299e1' }}>Total</div>
          <div className="acct-stat-count">{stats.total}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: '3px solid #ed8936' }}>
          <div className="acct-stat-label" style={{ color: '#ed8936' }}>Draft</div>
          <div className="acct-stat-count">{stats.draft}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: '3px solid #48bb78' }}>
          <div className="acct-stat-label" style={{ color: '#48bb78' }}>Posted</div>
          <div className="acct-stat-count">{stats.posted}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: '3px solid #a0aec0' }}>
          <div className="acct-stat-label" style={{ color: '#a0aec0' }}>Reversed</div>
          <div className="acct-stat-count">{stats.reversed}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="acct-filters">
        <div className="acct-search">

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entries..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="acct-select">
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
          <option value="reversed">Reversed</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <div className="acct-loading">Loading journal entries...</div> : (
        <div className="acct-table-wrap">
          <table className="acct-table">
            <thead>
              <tr><th>Reference</th><th>Type</th><th>Description</th><th>Date</th><th>Status</th><th>Created By</th><th>Approved By</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="empty-row">No journal entries found</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td><code className="acct-code">{e.reference_number}</code></td>
                  <td><span className="tag tag-type">{e.entry_type}</span></td>
                  <td>{e.description}</td>
                  <td>{e.posting_date}</td>
                  <td>
                    <span className="status-badge" style={{ background: STATUS_COLORS[e.status] || '#e2e8f0', color: 'white' }}>

                      {''}{e.status}
                    </span>
                  </td>
                  <td>{e.created_by_name || '—'}</td>
                  <td>{e.approved_by_name || '—'}</td>
                  <td className="acct-actions-row">
                    {e.status === 'draft' && (
                      <button className="btn-sm btn-success" onClick={() => handleApprove(e.id)} title="Approve & Post">
                        Post
                      </button>
                    )}
                    {e.status === 'posted' && (
                      <button className="btn-sm btn-warning" onClick={() => handleReverse(e.id)} title="Reverse">
                        Reverse
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Journal Entry</h2>
              <button onClick={() => setShowForm(false)}></button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row">
                <label>Reference Number *</label>
                <input value={form.reference_number} onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))} placeholder="e.g. JNL-2025-001" />
              </div>
              <div className="form-row">
                <label>Entry Type</label>
                <select value={form.entry_type} onChange={e => setForm(p => ({ ...p, entry_type: e.target.value }))}>
                  {ENTRY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-row">
                <label>Posting Date *</label>
                <input type="date" value={form.posting_date} onChange={e => setForm(p => ({ ...p, posting_date: e.target.value }))} />
              </div>
              <div className="form-row">
                <label>Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe this journal entry..." />
              </div>
              <div className="form-note">
                <strong>Note:</strong>After creating the journal entry, add debit/credit postings via the General Ledger.
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <>Create Entry</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalEntries;
