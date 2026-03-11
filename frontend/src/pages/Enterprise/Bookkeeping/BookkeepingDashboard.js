import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useEnterprise } from '../../../context/EnterpriseContext';
import TransactionForm from './TransactionForm';

const BookkeepingDashboard = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { fetchBookkeepingSummary, fetchTransactions, entities } = useEnterprise();

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const entity = entities.find(e => e.id === parseInt(entityId));

  const loadData = useCallback(async () => {
    setLoading(true);

    // Calculate date range
    const today = new Date();
    let startDate;

    if (dateFilter === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (dateFilter === 'month') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
    } else if (dateFilter === 'quarter') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
    } else if (dateFilter === 'year') {
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
    }

    const filters = startDate ? {
      start_date: startDate.toISOString().split('T')[0]
    } : {};

    // Fetch summary
    const summaryData = await fetchBookkeepingSummary(entityId, filters);
    setSummary(summaryData);

    // Fetch recent transactions (last 10)
    const transactionsData = await fetchTransactions(entityId, filters);
    setRecentTransactions((transactionsData.results || transactionsData).slice(0, 10));

    setLoading(false);
  }, [dateFilter, entityId, fetchBookkeepingSummary, fetchTransactions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionForm(true);
  };

  const handleCloseForm = () => {
    setShowTransactionForm(false);
    setEditingTransaction(null);
  };

  const handleSaveTransaction = async () => {
    // Reload data after saving
    await loadData();
    handleCloseForm();
  };

  if (loading) {
    return (
      <div className="bookkeeping-dashboard">
        <div className="loading">Loading bookkeeping data...</div>
      </div>
    );
  }

  return (
    <div className="bookkeeping-dashboard">
      {/* Header */}
      <div className="bookkeeping-header">
        <div className="header-left">
          <h1>Bookkeeping</h1>
          <p>{entity?.name}</p>
        </div>
        <div className="header-right">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="date-filter"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="btn-primary" onClick={handleNewTransaction}>
            New Transaction
          </button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="quick-nav">
        <button className="nav-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/transactions`)}>

          <span>All Transactions</span>
        </button>
        <button className="nav-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/categories`)}>

          <span>Categories</span>
        </button>
        <button className="nav-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/accounts`)}>

          <span>Accounts</span>
        </button>
        <button className="nav-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/reports`)}>

          <span>Reports</span>
        </button>
        <button className="nav-card" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping/staff-hr`)}>

          <span>Staff & HR</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">

          </div>
          <div className="card-content">
            <p className="card-label">Total Income</p>
            <h2 className="card-value">{formatCurrency(summary?.total_income || 0, entity?.local_currency)}</h2>
            <p className="card-count">{summary?.transaction_count || 0} transactions</p>
          </div>
        </div>

        <div className="summary-card expense">
          <div className="card-icon">

          </div>
          <div className="card-content">
            <p className="card-label">Total Expenses</p>
            <h2 className="card-value">{formatCurrency(summary?.total_expense || 0, entity?.local_currency)}</h2>
            <p className="card-count">{summary?.transaction_count || 0} transactions</p>
          </div>
        </div>

        <div className="summary-card profit">
          <div className="card-icon">

          </div>
          <div className="card-content">
            <p className="card-label">Net Profit</p>
            <h2 className="card-value">{formatCurrency(summary?.net_profit || 0, entity?.local_currency)}</h2>
            <p className="card-count">
              {summary?.net_profit >= 0 ? 'Positive' : 'Negative'}
            </p>
          </div>
        </div>

        <div className="summary-card payroll">
          <div className="card-icon">

          </div>
          <div className="card-content">
            <p className="card-label">Payroll</p>
            <h2 className="card-value">{formatCurrency(summary?.payroll_total || 0, entity?.local_currency)}</h2>
            <p className="card-count">Staff salaries</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Category Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Top Categories</h3>

          </div>
          <div className="category-list">
            {summary?.category_breakdown && summary.category_breakdown.length > 0 ? (
              summary.category_breakdown.map((cat, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <span className={`category-badge ${cat.category__type}`}>
                      {cat.category__type === 'income' ? '+' : '-'}
                    </span>
                    <div>
                      <p className="category-name">{cat.category__name}</p>
                      <p className="category-count">{cat.count} transactions</p>
                    </div>
                  </div>
                  <p className="category-amount">
                    {formatCurrency(cat.total, entity?.local_currency)}
                  </p>
                </div>
              ))
            ) : (
              <p className="no-data">No category data available</p>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Trend</h3>

          </div>
          <div className="trend-chart">
            {summary?.monthly_trend && summary.monthly_trend.length > 0 ? (
              <div className="trend-bars">
                {summary.monthly_trend.map((item, index) => (
                  <div key={index} className="trend-bar-group">
                    <div className="trend-bar" style={{ height: `${(item.total / 10000) * 100}%` }}>
                      <span className="bar-value">{formatCurrency(item.total, entity?.local_currency)}</span>
                    </div>
                    <span className="bar-label">{item.month}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No trend data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="recent-transactions">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="btn-secondary">View All</button>
        </div>

        <div className="transactions-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Type</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td className="transaction-description">{transaction.description}</td>
                    <td>
                      <span className="category-tag">{transaction.category_name}</span>
                    </td>
                    <td>{transaction.account_name}</td>
                    <td>
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`text-right amount-${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
  );
};

export default BookkeepingDashboard;
