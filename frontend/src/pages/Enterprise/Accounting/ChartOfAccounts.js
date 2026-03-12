import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { chartOfAccountsAPI } from '../../../services/api';

const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset', color: 'var(--color-success)' },
  { value: 'liability', label: 'Liability', color: 'var(--color-error)' },
  { value: 'equity', label: 'Equity', color: 'var(--color-cyan)' },
  { value: 'revenue', label: 'Revenue', color: 'var(--color-cyan)' },
  { value: 'expense', label: 'Expense', color: 'var(--color-warning)' },
];

const ACCOUNT_STATUS = [
  { value: 'active', label: 'Active'},
  { value: 'inactive', label: 'Inactive'},
  { value: 'archived', label: 'Archived'},
];

const defaultForm = {
  account_code: '', account_name: '', account_type: 'asset',
  description: '', currency: 'USD', cost_center: '',
  opening_balance: '0.00', status: 'active', parent_account: ''
};

const ChartOfAccounts = () => {
  const { entityId } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedTypes, setExpandedTypes] = useState({ asset: true, liability: true, equity: true, revenue: true, expense: true });

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await chartOfAccountsAPI.getAll({ entity: entityId });
      setAccounts(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const filtered = accounts.filter(a => {
    const matchSearch = !search || a.account_code.toLowerCase().includes(search.toLowerCase()) || a.account_name.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || a.account_type === filterType;
    return matchSearch && matchType;
  });

  const grouped = ACCOUNT_TYPES.reduce((acc, t) => {
    acc[t.value] = filtered.filter(a => a.account_type === t.value);
    return acc;
  }, {});

  const handleEdit = (account) => {
    setEditingAccount(account);
    setForm({
      account_code: account.account_code, account_name: account.account_name,
      account_type: account.account_type, description: account.description || '',
      currency: account.currency || 'USD', cost_center: account.cost_center || '',
      opening_balance: account.opening_balance || '0.00',
      status: account.status, parent_account: account.parent_account || ''
    });
    setShowForm(true);
  };

  const handleNew = () => { setEditingAccount(null); setForm(defaultForm); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, entity: parseInt(entityId) };
      if (!payload.parent_account) delete payload.parent_account;
      if (editingAccount) {
        await chartOfAccountsAPI.update(editingAccount.id, payload);
      } else {
        await chartOfAccountsAPI.create(payload);
      }
      setShowForm(false);
      await loadAccounts();
    } catch (e) {
      setError(e.response?.data?.detail || JSON.stringify(e.response?.data) || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    try { await chartOfAccountsAPI.delete(id); await loadAccounts(); } catch (e) { alert('Cannot delete: ' + (e.response?.data?.detail || e.message)); }
  };

  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

  const stats = ACCOUNT_TYPES.map(t => ({
    ...t,
    count: accounts.filter(a => a.account_type === t.value).length,
    balance: accounts.filter(a => a.account_type === t.value).reduce((sum, a) => sum + parseFloat(a.current_balance || a.opening_balance || 0), 0)
  }));

  return (
    <div className="acct-page">
      {/* Header */}
      <div className="acct-header">
        <div>
          <h1>Chart of Accounts</h1>
          <p>Manage your account hierarchy — assets, liabilities, equity, revenue, and expenses</p>
        </div>
        <div className="acct-header-actions">
          <button className="btn-secondary">Export</button>
          <button className="btn-primary" onClick={handleNew}>New Account</button>
        </div>
      </div>

      {/* Stats */}
      <div className="acct-stat-cards">
        {stats.map(s => (
          <div key={s.value} className="acct-stat-card" style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="acct-stat-label" style={{ color: s.color }}>{s.label}</div>
            <div className="acct-stat-count">{s.count} accounts</div>
            <div className="acct-stat-balance">${formatCurrency(s.balance)}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="acct-filters">
        <div className="acct-search">

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search accounts..." />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="acct-select">
          <option value="">All Types</option>
          {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Accounts List */}
      {loading ? <div className="acct-loading">Loading accounts...</div> : (
        <div className="acct-groups">
          {ACCOUNT_TYPES.map(t => {
            const items = grouped[t.value];
            if (!items || items.length === 0) return null;
            const isExpanded = expandedTypes[t.value];
            return (
              <div key={t.value} className="acct-group">
                <div className="acct-group-header" onClick={() => setExpandedTypes(p => ({ ...p, [t.value]: !isExpanded }))}>

                  <span className="acct-type-badge" style={{ background: t.color }}>{t.label}</span>
                  <span className="acct-group-count">{items.length} accounts</span>
                  <span className="acct-group-balance">${formatCurrency(items.reduce((s, a) => s + parseFloat(a.current_balance || a.opening_balance || 0), 0))}</span>
                </div>
                {isExpanded && (
                  <table className="acct-table">
                    <thead>
                      <tr><th>Code</th><th>Account Name</th><th>Currency</th><th>Cost Center</th><th>Balance</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {items.map(a => (
                        <tr key={a.id}>
                          <td><code className="acct-code">{a.account_code}</code></td>
                          <td>
                            <div className="acct-name">{a.account_name}</div>
                            {a.description && <div className="acct-desc">{a.description}</div>}
                          </td>
                          <td>{a.currency || 'USD'}</td>
                          <td>{a.cost_center || '—'}</td>
                          <td className="acct-balance">${formatCurrency(a.current_balance || a.opening_balance)}</td>
                          <td>
                            <span className={`status-badge status-${a.status}`}>{a.status}</span>
                          </td>
                          <td className="acct-actions">
                            <button onClick={() => handleEdit(a)} className="btn-icon" title="Edit"></button>
                            <button onClick={() => handleDelete(a.id)} className="btn-icon btn-icon-danger" title="Delete"></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && <div className="acct-empty"><p>No accounts found. Create your first account.</p></div>}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAccount ? 'Edit Account' : 'New Account'}</h2>
              <button onClick={() => setShowForm(false)}></button>
            </div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row">
                <label>Account Code *</label>
                <input value={form.account_code} onChange={e => setForm(p => ({ ...p, account_code: e.target.value }))} placeholder="e.g. 1000" />
              </div>
              <div className="form-row">
                <label>Account Name *</label>
                <input value={form.account_name} onChange={e => setForm(p => ({ ...p, account_name: e.target.value }))} placeholder="e.g. Cash" />
              </div>
              <div className="form-row">
                <label>Account Type *</label>
                <select value={form.account_type} onChange={e => setForm(p => ({ ...p, account_type: e.target.value }))}>
                  {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Currency</label>
                  <input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} placeholder="USD" />
                </div>
                <div className="form-row">
                  <label>Opening Balance</label>
                  <input type="number" step="0.01" value={form.opening_balance} onChange={e => setForm(p => ({ ...p, opening_balance: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <label>Cost Center</label>
                <input value={form.cost_center} onChange={e => setForm(p => ({ ...p, cost_center: e.target.value }))} placeholder="e.g. Operations" />
              </div>
              <div className="form-row">
                <label>Parent Account (optional)</label>
                <select value={form.parent_account} onChange={e => setForm(p => ({ ...p, parent_account: e.target.value }))}>
                  <option value="">— None —</option>
                  {accounts.filter(a => a.id !== editingAccount?.id && a.account_type === form.account_type).map(a => (
                    <option key={a.id} value={a.id}>{a.account_code} - {a.account_name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description..." />
              </div>
              <div className="form-row">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {ACCOUNT_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : <>Save Account</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
