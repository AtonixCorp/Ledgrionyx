import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useEnterprise } from '../../../context/EnterpriseContext';
import TransactionForm from './TransactionForm';

const TransactionList = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const {
    fetchTransactions,
    deleteTransaction,
    fetchBookkeepingCategories,
    fetchBookkeepingAccounts,
    entities
  } = useEnterprise();

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    account: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const entity = entities.find(e => e.id === parseInt(entityId));

  const buildQueryParams = useCallback(() => {
    const params = {};
    if (filters.startDate) params.start_date = filters.startDate;
    if (filters.endDate) params.end_date = filters.endDate;
    if (filters.type) params.type = filters.type;
    if (filters.category) params.category = filters.category;
    if (filters.account) params.account = filters.account;
    if (filters.minAmount) params.min_amount = filters.minAmount;
    if (filters.maxAmount) params.max_amount = filters.maxAmount;
    if (filters.search) params.search = filters.search;
    return params;
  }, [filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchTransactions(entityId, buildQueryParams());
    setTransactions(data.results || data);
    setLoading(false);
  }, [buildQueryParams, entityId, fetchTransactions]);

  const loadFiltersData = useCallback(async () => {
    const [cats, accs] = await Promise.all([
      fetchBookkeepingCategories(entityId),
      fetchBookkeepingAccounts(entityId)
    ]);
    setCategories(cats.results || cats);
    setAccounts(accs.results || accs);
  }, [entityId, fetchBookkeepingAccounts, fetchBookkeepingCategories]);

  useEffect(() => {
    loadData();
    loadFiltersData();
  }, [loadData, loadFiltersData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    loadData();
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      category: '',
      account: '',
      minAmount: '',
      maxAmount: '',
      search: ''
    });
    setTimeout(loadData, 100);
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const handleDelete = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transactionId);
        alert('Transaction deleted successfully!');
        loadData();
      } catch (err) {
        alert('Failed to delete transaction: ' + err.message);
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Type', 'Category', 'Account', 'Amount', 'Currency', 'Description', 'Reference'];
    const rows = transactions.map(t => [
      t.date,
      t.type,
      t.category_name,
      t.account_name,
      t.amount,
      t.currency,
      t.description,
      t.reference_number || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${entity?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = async () => {
    await loadData();
    handleCloseForm();
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="transaction-list-container">
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f9fafb' }}>
      {/* Topbar */}
      <div style={{ height: 60, background: '#003B73', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', paddingLeft: 24, paddingRight: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          ← Back
        </button>
        <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.3)', margin: '0 16px' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>ATC Capital</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>/</span>
          <span style={{ color: '#fff', fontSize: 13 }}>{entity?.name || 'Transactions'}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ background: '#10B981', color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Active</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{entity?.country} • {entity?.entity_type}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
    <div className="transaction-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>All Transactions</h1>
          <p>{entity?.name} • {transactions.length} transactions</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="btn-primary" onClick={handleNewTransaction}>
            New Transaction
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="filters-panel">
        <div className="filters-header">
          <h3>Filters</h3>
          <button className="btn-link" onClick={handleClearFilters}>Clear All</button>
        </div>

        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group">
            <label>Search</label>
            <div className="search-input">

              <input
                type="text"
                placeholder="Search description..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          {/* Type */}
          <div className="filter-group">
            <label>Type</label>
            <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)}>
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div className="filter-group">
            <label>Category</label>
            <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.type})
                </option>
              ))}
            </select>
          </div>

          {/* Account */}
          <div className="filter-group">
            <label>Account</label>
            <select value={filters.account} onChange={(e) => handleFilterChange('account', e.target.value)}>
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
                </option>
              ))}
            </select>
          </div>

          {/* Amount Range */}
          <div className="filter-group">
            <label>Min Amount</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minAmount}
              onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Max Amount</label>
            <input
              type="number"
              placeholder="999999"
              value={filters.maxAmount}
              onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn-primary" onClick={handleApplyFilters}>Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Account</th>
              <th>Reference</th>
              <th className="text-right">Amount</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>
                    <span className="category-tag">{transaction.category_name}</span>
                  </td>
                  <td className="transaction-description">{transaction.description}</td>
                  <td>{transaction.account_name}</td>
                  <td className="reference-number">{transaction.reference_number || '-'}</td>
                  <td className={`text-right amount-${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </td>
                  <td className="text-center">
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(transaction)}
                        title="Edit transaction"
                      >

                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(transaction.id)}
                        title="Delete transaction"
                      >

                      </button>
                      {transaction.attachment_url && (
                        <button
                          className="btn-icon btn-view"
                          onClick={() => window.open(transaction.attachment_url, '_blank')}
                          title="View attachment"
                        >

                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No transactions found. Try adjusting your filters or create a new transaction.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Summary */}
      {transactions.length > 0 && (
        <div className="table-summary">
          <div className="summary-item">
            <span>Total Income:</span>
            <strong className="amount-income">
              {formatCurrency(
                transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0),
                entity?.local_currency
              )}
            </strong>
          </div>
          <div className="summary-item">
            <span>Total Expenses:</span>
            <strong className="amount-expense">
              {formatCurrency(
                transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0),
                entity?.local_currency
              )}
            </strong>
          </div>
          <div className="summary-item">
            <span>Net:</span>
            <strong>
              {formatCurrency(
                transactions.reduce((sum, t) =>
                  sum + (t.type === 'income' ? parseFloat(t.amount) : -parseFloat(t.amount)), 0
                ),
                entity?.local_currency
              )}
            </strong>
          </div>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm
          entityId={entityId}
          transaction={editingTransaction}
          onClose={handleCloseForm}
          onSave={handleSaveTransaction}
        />
      )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default TransactionList;
