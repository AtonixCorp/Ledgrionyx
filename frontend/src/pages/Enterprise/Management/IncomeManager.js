import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';
import { FaPlus, FaEdit, FaTrash, FaDownload, FaChartLine } from 'react-icons/fa';

const IncomeManager = () => {
  const { entityId } = useParams();
  const { fetchEntityIncome, createEntityIncome, entities } = useEnterprise();
  
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [filters, setFilters] = useState({
    source: '',
    type: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    search: ''
  });

  const entity = entities.find(e => e.id.toString() === entityId);

  // Income sources
  const sources = [
    'Product Sales', 'Service Revenue', 'Consulting', 'Investment Income', 
    'Grants', 'Royalties', 'Licensing', 'Subscriptions', 'Commissions', 
    'Interest', 'Dividends', 'Rental Income', 'Other'
  ];

  const incomeTypes = [
    { value: 'business', label: 'Business Revenue' },
    { value: 'investment', label: 'Investment Income' },
    { value: 'passive', label: 'Passive Income' },
    { value: 'other', label: 'Other Income' }
  ];

  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    income_type: 'business',
    date: new Date().toISOString().split('T')[0],
    description: '',
    client: '',
    invoice_number: '',
    payment_method: 'bank_transfer',
    notes: ''
  });

  const loadIncome = useCallback(async () => {
    setLoading(true);
    const data = await fetchEntityIncome(entityId);
    setIncome(data || []);
    setLoading(false);
  }, [entityId, fetchEntityIncome]);

  useEffect(() => {
    loadIncome();
  }, [loadIncome]);

  const handleEdit = (inc) => {
    setEditingIncome(inc);
    setFormData({
      source: inc.source || '',
      amount: inc.amount || '',
      income_type: inc.income_type || 'business',
      date: inc.date || new Date().toISOString().split('T')[0],
      description: inc.description || '',
      client: inc.client || '',
      invoice_number: inc.invoice_number || '',
      payment_method: inc.payment_method || 'bank_transfer',
      notes: inc.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEntityIncome(entityId, formData);
      setShowForm(false);
      setFormData({
        source: '',
        amount: '',
        income_type: 'business',
        date: new Date().toISOString().split('T')[0],
        description: '',
        client: '',
        invoice_number: '',
        payment_method: 'bank_transfer',
        notes: ''
      });
      loadIncome();
    } catch (error) {
      console.error('Failed to create income:', error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Source', 'Type', 'Amount', 'Client', 'Invoice', 'Payment Method'];
    const csvData = filteredIncome.map(inc => [
      new Date(inc.date).toLocaleDateString(),
      inc.source,
      inc.income_type,
      inc.amount,
      inc.client || '',
      inc.invoice_number || '',
      inc.payment_method
    ]);

    const csv = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income_${entity?.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter income
  const filteredIncome = income.filter(inc => {
    if (filters.source && inc.source !== filters.source) return false;
    if (filters.type && inc.income_type !== filters.type) return false;
    if (filters.dateFrom && new Date(inc.date) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(inc.date) > new Date(filters.dateTo)) return false;
    if (filters.minAmount && parseFloat(inc.amount) < parseFloat(filters.minAmount)) return false;
    if (filters.maxAmount && parseFloat(inc.amount) > parseFloat(filters.maxAmount)) return false;
    if (filters.search && !inc.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate totals
  const totalIncome = filteredIncome.reduce((sum, inc) => sum + parseFloat(inc.amount), 0);
  
  // Source breakdown
  const sourceBreakdown = filteredIncome.reduce((acc, inc) => {
    if (!acc[inc.source]) {
      acc[inc.source] = { count: 0, amount: 0 };
    }
    acc[inc.source].count++;
    acc[inc.source].amount += parseFloat(inc.amount);
    return acc;
  }, {});

  // Type breakdown
  const typeBreakdown = filteredIncome.reduce((acc, inc) => {
    if (!acc[inc.income_type]) {
      acc[inc.income_type] = { count: 0, amount: 0 };
    }
    acc[inc.income_type].count++;
    acc[inc.income_type].amount += parseFloat(inc.amount);
    return acc;
  }, {});

  if (loading) return <div className="loading">Loading income...</div>;

  return (
    <div className="entity-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h2>Income Management</h2>
          <p className="subtitle">{entity?.name} - {filteredIncome.length} income records</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon" onClick={handleExportCSV} title="Export CSV">
            <FaDownload /> Export
          </button>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <FaPlus /> Add Income
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        <div className="summary-card-mini income">
          <h4>Total Income</h4>
          <p className="amount positive">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Transactions</h4>
          <p className="count">{filteredIncome.length}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Average</h4>
          <p className="amount">${(totalIncome / (filteredIncome.length || 1)).toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Sources</h4>
          <p className="count">{Object.keys(sourceBreakdown).length}</p>
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
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="filter-select"
          >
            <option value="">All Sources</option>
            {sources.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="filter-select"
          >
            <option value="">All Types</option>
            {incomeTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
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
          <button 
            className="btn-clear-filters"
            onClick={() => setFilters({ source: '', type: '', dateFrom: '', dateTo: '', minAmount: '', maxAmount: '', search: '' })}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Type Breakdown */}
      <div className="type-breakdown">
        <h3><FaChartLine /> Revenue by Type</h3>
        <div className="type-grid">
          {Object.entries(typeBreakdown)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .map(([type, data]) => (
              <div key={type} className="type-card">
                <h4>{incomeTypes.find(t => t.value === type)?.label || type}</h4>
                <p className="amount positive">${data.amount.toFixed(2)}</p>
                <p className="count-mini">{data.count} transactions</p>
                <p className="percentage">{((data.amount / totalIncome) * 100).toFixed(1)}% of total</p>
              </div>
            ))}
        </div>
      </div>

      {/* Source Breakdown */}
      <div className="source-breakdown">
        <h3>Revenue by Source</h3>
        <div className="source-grid">
          {Object.entries(sourceBreakdown)
            .sort(([, a], [, b]) => b.amount - a.amount)
            .slice(0, 6)
            .map(([source, data]) => (
              <div key={source} className="source-card-mini">
                <h4>{source}</h4>
                <p className="amount">${data.amount.toFixed(2)}</p>
                <p className="count-mini">{data.count} transactions</p>
                <div className="percentage-bar income">
                  <div 
                    className="percentage-fill"
                    style={{ width: `${(data.amount / totalIncome * 100).toFixed(0)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Income Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Type</th>
              <th>Client</th>
              <th>Invoice #</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncome.map(inc => (
              <tr key={inc.id}>
                <td>{new Date(inc.date).toLocaleDateString()}</td>
                <td>{inc.source}</td>
                <td><span className="badge-type">{incomeTypes.find(t => t.value === inc.income_type)?.label}</span></td>
                <td>{inc.client || '-'}</td>
                <td>{inc.invoice_number || '-'}</td>
                <td className="payment-method">{inc.payment_method?.replace('_', ' ')}</td>
                <td className="amount positive">${parseFloat(inc.amount).toFixed(2)}</td>
                <td className="actions">
                  <button className="btn-icon-small" title="Edit" onClick={() => handleEdit(inc)}>
                    <FaEdit />
                  </button>
                  <button className="btn-icon-small delete" title="Delete">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredIncome.length === 0 && (
          <div className="empty-state">
            <p>No income records found. Add your first income entry to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIncome ? 'Edit Income' : 'Add New Income'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="entity-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Source *</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    required
                  >
                    <option value="">Select Source</option>
                    {sources.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
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
                  <label>Income Type *</label>
                  <select
                    value={formData.income_type}
                    onChange={(e) => setFormData({ ...formData, income_type: e.target.value })}
                    required
                  >
                    {incomeTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
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
                  <label>Client/Customer</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="check">Check</option>
                    <option value="wire_transfer">Wire Transfer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
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
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingIncome ? 'Update' : 'Create'} Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeManager;
