import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';

const ExpensesManager = () => {
  const { entityId } = useParams();
  const { fetchEntityExpenses, createEntityExpense, entities } = useEnterprise();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const entity = entities.find(e => e.id.toString() === entityId);

  // Default expense categories
  const categories = [
    'Office Supplies', 'Travel', 'Marketing', 'Utilities', 'Rent', 'Insurance',
    'Professional Services', 'Equipment', 'Software', 'Training', 'Meals',
    'Transportation', 'Salaries', 'Benefits', 'Taxes', 'Other'
  ];

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
    vendor: '',
    notes: ''
  });

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    const data = await fetchEntityExpenses(entityId);
    setExpenses(data || []);
    setLoading(false);
  }, [entityId, fetchEntityExpenses]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description || '',
      amount: expense.amount || '',
      category: expense.category || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      payment_method: expense.payment_method || 'bank_transfer',
      vendor: expense.vendor || '',
      notes: expense.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEntityExpense(entityId, formData);
      setShowForm(false);
      setFormData({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        vendor: '',
        notes: ''
      });
      loadExpenses();
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        // Delete functionality to be implemented
        loadExpenses();
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Category', 'Amount', 'Vendor', 'Payment Method'];
    const csvData = filteredExpenses.map(exp => [
      new Date(exp.date).toLocaleDateString(),
      exp.description,
      exp.category,
      exp.amount,
      exp.vendor || '',
      exp.payment_method
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${entity?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter expenses
  const filteredExpenses = expenses.filter(exp => {
    if (filters.category && exp.category !== filters.category) return false;
    if (filters.dateFrom && new Date(exp.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(exp.date) > new Date(filters.dateTo)) return false;
    if (filters.minAmount && parseFloat(exp.amount) < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && parseFloat(exp.amount) > parseFloat(filters.maxAmount)) return false;
    if (filters.search && !exp.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  // Category breakdown
  const categoryBreakdown = filteredExpenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { count: 0, amount: 0 };
    }
    acc[exp.category].count++;
    acc[exp.category].amount += parseFloat(exp.amount);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="entity-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h2>Expense Management</h2>
          <p className="subtitle">{entity?.name} - {filteredExpenses.length} expenses</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleExportCSV} title="Export CSV">
            Export
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        <div className="summary-card-mini">
          <h4>Total Expenses</h4>
          <p className="amount negative">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Transactions</h4>
          <p className="count">{filteredExpenses.length}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Average</h4>
          <p className="amount">${(totalExpenses / (filteredExpenses.length || 1)).toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Categories</h4>
          <p className="count">{Object.keys(categoryBreakdown).length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="filter-input"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            placeholder="From Date"
            className="filter-input"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            placeholder="To Date"
            className="filter-input"
          />
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            placeholder="Min Amount"
            className="filter-input"
          />
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            placeholder="Max Amount"
            className="filter-input"
          />
        </div>
        <button
          className="btn-clear-filters"
          onClick={() => setFilters({ category: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', search: '' })}
        >Clear Filters
        </button>
      </div>

      {/* Category Breakdown */}
      <div className="category-breakdown">
        <h3>Category Breakdown</h3>
        <div className="category-grid">
          {Object.entries(categoryBreakdown)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .map(([category, data]) => (
              <div key={category} className="category-card-mini">
                <h4>{category}</h4>
                <p className="amount">${data.amount.toFixed(2)}</p>
                <p className="count-mini">{data.count} transactions</p>
                <div className="percentage-bar">
                  <div
                    className="percentage-fill"
                    style={{ width: `${(data.amount / totalExpenses * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.map(expense => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description}</td>
                <td><span className="badge-category">{expense.category}</span></td>
                <td>{expense.vendor || '-'}</td>
                <td className="payment-method">{expense.payment_method?.replace('_', '')}</td>
                <td className="amount negative">${parseFloat(expense.amount).toFixed(2)}</td>
                <td className="actions">
                  <button className="btn-icon-small" title="Edit" onClick={() => handleEdit(expense)}>

                  </button>
                  <button
                    className="btn-icon-small delete"
                    onClick={() => handleDelete(expense.id)}
                    title="Delete"
                  >

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredExpenses.length === 0 && (
          <div className="empty-state">
            <p>No expenses found. Add your first expense to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="entity-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Description *</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vendor</label>
                  <input
                    type="text"
                    value={formData.vendor}
                    onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingExpense ? 'Update' : 'Create'} Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesManager;
