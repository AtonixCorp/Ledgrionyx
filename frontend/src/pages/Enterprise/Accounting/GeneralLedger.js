import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { FaBook, FaSearch, FaDownload, FaFilter } from 'react-icons/fa';
import { generalLedgerAPI } from '../../../services/api';

const GeneralLedger = () => {
  const { entityId } = useParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { entity: entityId };
      if (filterStatus) params.posting_status = filterStatus;
      if (dateFrom) params.posting_date__gte = dateFrom;
      if (dateTo) params.posting_date__lte = dateTo;
      const res = await generalLedgerAPI.getAll(params);
      setEntries(res.data.results || res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId, filterStatus, dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  const filtered = entries.filter(e =>
    !search || e.journal_entry_number?.toLowerCase().includes(search.toLowerCase()) ||
    e.debit_account_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.credit_account_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDebits = filtered.reduce((s, e) => s + parseFloat(e.debit_amount || 0), 0);
  const totalCredits = filtered.reduce((s, e) => s + parseFloat(e.credit_amount || 0), 0);
  const fmt = (v) => parseFloat(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const statusColor = { pending: '#ed8936', posted: '#48bb78', reversed: '#fc8181' };

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1><FaBook /> General Ledger</h1>
          <p>Complete double-entry ledger — all debit and credit postings in one view</p>
        </div>
        <button className="btn-secondary"><FaDownload /> Export</button>
      </div>

      {/* Summary */}
      <div className="acct-stat-cards">
        <div className="acct-stat-card" style={{ borderTop: '3px solid #4299e1' }}>
          <div className="acct-stat-label" style={{ color: '#4299e1' }}>Total Entries</div>
          <div className="acct-stat-count">{filtered.length}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: '3px solid #48bb78' }}>
          <div className="acct-stat-label" style={{ color: '#48bb78' }}>Total Debits</div>
          <div className="acct-stat-balance">${fmt(totalDebits)}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: '3px solid #fc8181' }}>
          <div className="acct-stat-label" style={{ color: '#fc8181' }}>Total Credits</div>
          <div className="acct-stat-balance">${fmt(totalCredits)}</div>
        </div>
        <div className="acct-stat-card" style={{ borderTop: `3px solid ${Math.abs(totalDebits - totalCredits) < 0.01 ? '#48bb78' : '#e53e3e'}` }}>
          <div className="acct-stat-label">Balance Check</div>
          <div className="acct-stat-balance" style={{ color: Math.abs(totalDebits - totalCredits) < 0.01 ? '#48bb78' : '#e53e3e' }}>
            {Math.abs(totalDebits - totalCredits) < 0.01 ? '✓ Balanced' : `Diff: $${fmt(totalDebits - totalCredits)}`}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="acct-filters">
        <div className="acct-search">
          <FaSearch className="search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by account or entry..." />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="acct-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="posted">Posted</option>
          <option value="reversed">Reversed</option>
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="acct-date" placeholder="From date" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="acct-date" placeholder="To date" />
        <button onClick={load} className="btn-secondary"><FaFilter /> Filter</button>
      </div>

      {/* Table */}
      {loading ? <div className="acct-loading">Loading general ledger...</div> : (
        <div className="acct-table-wrap">
          <table className="acct-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Journal Entry</th>
                <th>Debit Account</th>
                <th>Credit Account</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="empty-row">No ledger entries found</td></tr>
              ) : filtered.map(e => (
                <tr key={e.id}>
                  <td>{e.posting_date}</td>
                  <td><code className="acct-code">{e.journal_entry_number || `JNL-${e.id}`}</code></td>
                  <td>{e.debit_account_name || `Account ${e.debit_account}`}</td>
                  <td>{e.credit_account_name || `Account ${e.credit_account}`}</td>
                  <td className="amount-debit">${fmt(e.debit_amount)}</td>
                  <td className="amount-credit">${fmt(e.credit_amount)}</td>
                  <td>
                    <span className="status-badge" style={{ background: statusColor[e.posting_status] || '#e2e8f0', color: 'white' }}>
                      {e.posting_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="gl-totals-row">
                  <td colSpan={4}><strong>Totals</strong></td>
                  <td className="amount-debit"><strong>${fmt(totalDebits)}</strong></td>
                  <td className="amount-credit"><strong>${fmt(totalCredits)}</strong></td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;
