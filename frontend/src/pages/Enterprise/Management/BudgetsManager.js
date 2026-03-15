import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';
import '../../../styles/EntityPages.css';

const BudgetsManager = () => {
  const { entityId } = useParams();
  const { fetchEntityBudgets, createEntityBudget, fetchEntityExpenses, entities } = useEnterprise();

  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const entity = entities.find(e => e.id.toString() === entityId);

  // Budget categories
  const categories = [
    'Office Supplies', 'Travel', 'Marketing', 'Utilities', 'Rent', 'Insurance',
    'Professional Services', 'Equipment', 'Software', 'Training', 'Meals',
    'Transportation', 'Salaries', 'Benefits', 'Taxes', 'Other'
  ];

  const normalizeCategoryKey = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  const categoryAliases = {
    utility: 'Utilities',
    utilities: 'Utilities',
    travel: 'Travel',
  };

  const getCanonicalCategory = (value) => {
    const normalized = normalizeCategoryKey(value);
    if (!normalized) return '';

    const directMatch = categories.find((category) => normalizeCategoryKey(category) === normalized);
    if (directMatch) return directMatch;

    return categoryAliases[normalized] || value;
  };

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    alert_threshold: 80,
    notes: ''
  });

  const toAmount = (value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    const data = await fetchEntityBudgets(entityId);
    setBudgets(data || []);
    setLoading(false);
  }, [entityId, fetchEntityBudgets]);

  const loadExpenses = useCallback(async () => {
    const data = await fetchEntityExpenses(entityId);
    setExpenses(data || []);
  }, [entityId, fetchEntityExpenses]);

  useEffect(() => {
    loadBudgets();
    loadExpenses();
  }, [loadBudgets, loadExpenses]);

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: getCanonicalCategory(budget.category),
      limit: budget.limit || '',
      period: budget.period || 'monthly',
      start_date: budget.start_date || new Date().toISOString().split('T')[0],
      end_date: budget.end_date || '',
      alert_threshold: budget.alert_threshold ?? 80,
      notes: budget.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createEntityBudget(entityId, formData);
      setShowForm(false);
      setFormData({
        category: '',
        limit: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        alert_threshold: 80,
        notes: ''
      });
      loadBudgets();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  // Calculate spending for each budget
  const getBudgetStatus = (budget) => {
    const budgetCategory = normalizeCategoryKey(getCanonicalCategory(budget.category));
    const categoryExpenses = expenses.filter(
      (exp) => normalizeCategoryKey(getCanonicalCategory(exp.category)) === budgetCategory
    );
    const spent = categoryExpenses.reduce((sum, exp) => sum + toAmount(exp.amount), 0);
    const limit = toAmount(budget.limit);
    const percentage = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;

    let status = 'good';
    if (percentage >= 100) status = 'exceeded';
    else if (percentage >= (budget.alert_threshold || 80)) status = 'warning';

    return {
      spent,
      remaining,
      percentage: percentage.toFixed(1),
      status,
      transactionCount: categoryExpenses.length
    };
  };

  // Calculate overall budget summary
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + toAmount(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const status = getBudgetStatus(b);
    return sum + status.spent;
  }, 0);
  const totalRemaining = totalBudgetLimit - totalSpent;
  const utilizationPercentage = totalBudgetLimit > 0
    ? ((totalSpent / totalBudgetLimit) * 100).toFixed(1)
    : '0.0';

  const exceededBudgets = budgets.filter(b => getBudgetStatus(b).status === 'exceeded').length;
  const warningBudgets = budgets.filter(b => getBudgetStatus(b).status === 'warning').length;

  if (loading) return <div className="loading">Loading budgets...</div>;

  return (
    <div className="entity-management-container">
      {/* Header */}
      <div className="management-header">
        <div className="budget-header-copy">
          <h2>Budget Management</h2>
          <p className="subtitle">Plan category budgets, monitor utilization, and catch overspend risk early for {entity?.name}.</p>
          <div className="budget-header-meta">
            <span className="budget-meta-pill">{budgets.length} budget{budgets.length === 1 ? '' : 's'}</span>
            <span className="budget-meta-pill">{expenses.length} tracked expense entries</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create Budget
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-row">
        <div className="summary-card-mini">
          <h4>Total Budget</h4>
          <p className="amount">${totalBudgetLimit.toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Total Spent</h4>
          <p className="amount negative">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="summary-card-mini">
          <h4>Remaining</h4>
          <p className={`amount ${totalRemaining >= 0 ? 'positive' : 'negative'}`}>
            ${totalRemaining.toFixed(2)}
          </p>
        </div>
        <div className="summary-card-mini">
          <h4>Utilization</h4>
          <p className="percentage">{utilizationPercentage}%</p>
        </div>
      </div>

      {/* Alert Summary */}
      {(exceededBudgets > 0 || warningBudgets > 0) && (
        <div className="alert-summary">
          {exceededBudgets > 0 && (
            <div className="alert-card danger">
              <span>{exceededBudgets} budget{exceededBudgets > 1 ? 's' : ''} exceeded</span>
            </div>
          )}
          {warningBudgets > 0 && (
            <div className="alert-card warning">
              <span>{warningBudgets} budget{warningBudgets > 1 ? 's' : ''} approaching limit</span>
            </div>
          )}
        </div>
      )}

      {/* Budgets Grid */}
      <div className="budgets-grid">
        {budgets.map(budget => {
          const status = getBudgetStatus(budget);
          const budgetLimit = toAmount(budget.limit);
          return (
            <div key={budget.id} className={`budget-card ${status.status}`}>
              <div className="budget-header">
                <h3>{budget.category}</h3>
                <div className="budget-actions">
                  <button className="btn-icon-small" title="Edit" onClick={() => handleEditBudget(budget)}>

                  </button>
                  <button className="btn-icon-small delete" title="Delete">

                  </button>
                </div>
              </div>

              <div className="budget-amounts">
                <div className="budget-amount-row">
                  <span>Budget:</span>
                  <span className="amount">${budgetLimit.toFixed(2)}</span>
                </div>
                <div className="budget-amount-row">
                  <span>Spent:</span>
                  <span className="amount negative">${status.spent.toFixed(2)}</span>
                </div>
                <div className="budget-amount-row">
                  <span>Remaining:</span>
                  <span className={`amount ${status.remaining >= 0 ? 'positive' : 'negative'}`}>
                    ${status.remaining.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="budget-progress">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${status.status}`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  />
                </div>
                <div className="progress-info">
                  <span className="percentage">{status.percentage}% used</span>
                  <span className="transaction-count">{status.transactionCount} transactions</span>
                </div>
              </div>

              <div className="budget-meta">
                <span className={`status-badge ${status.status}`}>
                  {status.status === 'exceeded' && 'Exceeded'}
                  {status.status === 'warning' && 'Warning'}
                  {status.status === 'good' && <>On Track</>}
                </span>
                <span className="period">{budget.period}</span>
              </div>

              {budget.notes && (
                <div className="budget-notes">
                  <small>{budget.notes}</small>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="empty-state budget-empty-state">
          <h3>No budgets created yet</h3>
          <p>Create your first budget to start tracking category spending against clear limits.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            Create First Budget
          </button>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</h3>
              <button className="btn-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="entity-form">
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
                  <label>Budget Limit *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Period *</label>
                  <select
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    required
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                    <option value="one_time">One-Time</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Alert Threshold (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.alert_threshold}
                    onChange={(e) => setFormData({ ...formData, alert_threshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingBudget ? 'Update' : 'Create'} Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetsManager;
