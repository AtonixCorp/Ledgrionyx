import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { bankAccountsAPI, bankReconciliationsAPI } from '../../../services/api';
import '../../../styles/EntityPages.css';

const fmt = (v, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));

const STATUS_COLORS = { pending: 'var(--color-warning)', in_progress: 'var(--color-cyan)', reconciled: 'var(--color-success)' };

const BankReconciliation = () => {
  const { entityId } = useParams();
  const [records, setRecords] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bank_account: '', reconciliation_date: new Date().toISOString().split('T')[0], bank_statement_balance: '', book_balance: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reconciling, setReconciling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await bankReconciliationsAPI.getAll({ entity: entityId }); setRecords(r.data.results || r.data); } catch (e) { console.error(e); }
    try { const banks = await bankAccountsAPI.getAll({ entity: entityId }); setBankAccounts(banks.data.results || banks.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const selectedBankAccount = bankAccounts.find((account) => String(account.id) === String(form.bank_account)) || null;
  const bankStatementBalance = parseFloat(form.bank_statement_balance || 0);
  const bookBalance = parseFloat(form.book_balance || selectedBankAccount?.balance || 0);
  const variance = bankStatementBalance - bookBalance;
  const isBalanced = Math.abs(variance) < 0.01;

  const pendingCount = records.filter(r => r.status === 'pending').length;
  const reconciledCount = records.filter(r => r.status === 'reconciled').length;

  const handleCreate = async () => {
    setSaving(true); setError('');
    try {
      await bankReconciliationsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); setForm({ bank_account: '', reconciliation_date: new Date().toISOString().split('T')[0], bank_statement_balance: '', book_balance: '', notes: '' }); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleReconcile = async (id) => {
    if (!window.confirm('Mark this reconciliation as complete?')) return;
    setReconciling(id);
    try { await bankReconciliationsAPI.reconcile(id); await load(); } catch (e) { alert('Reconciliation failed: ' + (e.response?.data?.detail || 'Unknown error')); }
    setReconciling(null);
  };

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1>New Reconciliation</h1>
          <p>Compare your bank statement to the book balance, identify variances, and confirm which items still need adjustment.</p>
        </div>
        <div className="acct-header-actions">
          <button className="btn-secondary">Export</button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>Start Reconciliation</button>
        </div>
      </div>

      <div className="acct-stat-cards">
        <div className="acct-stat-card"><div className="acct-stat-label">Total Records</div><div className="acct-stat-count">{records.length}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Pending</div><div className="acct-stat-count" style={{ color: 'var(--color-warning)' }}>{pendingCount}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Reconciled</div><div className="acct-stat-count" style={{ color: 'var(--color-success)' }}>{reconciledCount}</div></div>
        <div className="acct-stat-card"><div className="acct-stat-label">Unreconciled</div><div className="acct-stat-count" style={{ color: 'var(--color-error)' }}>{records.filter(r => r.status !== 'reconciled').length}</div></div>
      </div>

      {loading ? <div className="acct-loading">Loading reconciliations...</div> : (
        <div className="acct-groups">
          {records.length === 0 ? <div className="acct-empty">No reconciliations found. Start by creating a new one.</div> : records.map(rec => {
            const variance = parseFloat(rec.bank_statement_balance || 0) - parseFloat(rec.book_balance || 0);
            const isReconciled = rec.status === 'reconciled';
            const recordAccount = bankAccounts.find((account) => String(account.id) === String(rec.bank_account));
            return (
              <div key={rec.id} className="recon-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--color-midnight)', fontSize: '1rem' }}>{recordAccount?.account_name || rec.bank_account_name || rec.bank_account}</h3>
                    {recordAccount?.bank_name && <small style={{ color: 'var(--color-silver-dark)', display: 'block' }}>{recordAccount.bank_name}</small>}
                    <small style={{ color: 'var(--color-silver-dark)' }}>Reconciliation Date: {rec.reconciliation_date}</small>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span className="status-badge" style={{ background: STATUS_COLORS[rec.status] || 'var(--color-silver-dark)', color: 'white' }}>{rec.status?.replace('_', '')}</span>
                    {!isReconciled && (
                      <button className="btn-success btn-sm" onClick={() => handleReconcile(rec.id)} disabled={reconciling === rec.id}>
                        {reconciling === rec.id ? 'Processing...' : <>Reconcile</>}
                      </button>
                    )}
                    {isReconciled && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>Reconciled {rec.reconciled_at?.split('T')[0]}</span>}
                  </div>
                </div>
                <div className="recon-variance">
                  <div className="mini-stat"><span>Bank Statement Balance</span><strong>{fmt(rec.bank_statement_balance)}</strong></div>
                  <div className="mini-stat"><span>Book Balance</span><strong>{fmt(rec.book_balance)}</strong></div>
                  <div className="mini-stat"><span>Variance</span><strong style={{ color: Math.abs(variance) < 0.01 ? 'var(--color-success)' : 'var(--color-error)' }}>{fmt(variance)}</strong></div>
                  {Math.abs(variance) < 0.01 && <span style={{ color: 'var(--color-success)', fontSize: '0.85rem', fontWeight: 600 }}>Balanced</span>}
                </div>
                {rec.notes && <p style={{ color: 'var(--color-silver-dark)', fontSize: '0.85rem', margin: 0 }}>{rec.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Bank Reconciliation</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row"><label>Bank Account *</label><select value={form.bank_account} onChange={e => {
                const nextAccountId = e.target.value;
                const nextAccount = bankAccounts.find((account) => String(account.id) === String(nextAccountId));
                setForm((p) => ({
                  ...p,
                  bank_account: nextAccountId,
                  book_balance: nextAccount?.balance !== undefined ? String(nextAccount.balance) : p.book_balance,
                }));
              }}>
                <option value="">Select bank account</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_name} · {account.bank_name} {account.account_number ? `(${account.account_number})` : ''}
                  </option>
                ))}
              </select></div>
              <div className="form-row"><label>Reconciliation Date *</label><input type="date" value={form.reconciliation_date} onChange={e => setForm(p => ({ ...p, reconciliation_date: e.target.value }))} /></div>
              <div className="form-row"><label>Book Balance *</label><input type="number" step="0.01" value={form.book_balance} onChange={e => setForm(p => ({ ...p, book_balance: e.target.value }))} placeholder="0.00" /><span className="form-note">This is the cash balance recorded in the books.</span></div>
              <div className="form-row"><label>Bank Statement Balance *</label><input type="number" step="0.01" value={form.bank_statement_balance} onChange={e => setForm(p => ({ ...p, bank_statement_balance: e.target.value }))} placeholder="0.00" /><span className="form-note">Enter the ending balance from your bank statement</span></div>
              <div className="form-row">
                <label>Variance Preview</label>
                <div className="acct-stat-card" style={{ margin: 0 }}>
                  <div className="acct-stat-label">{isBalanced ? 'Balanced' : 'Out of Balance'}</div>
                  <div className="acct-stat-count" style={{ color: isBalanced ? 'var(--color-success)' : 'var(--color-error)', fontSize: '1.25rem' }}>{fmt(variance)}</div>
                </div>
              </div>
              <div className="form-row"><label>Notes</label><textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes about this reconciliation..." /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !form.bank_account} className="btn-primary">{saving ? 'Creating...' : <>Create</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReconciliation;
