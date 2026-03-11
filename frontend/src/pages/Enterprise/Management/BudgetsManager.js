import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useEnterprise } from '../../../context/EnterpriseContext';

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

  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    alert_threshold: 80,
    notes: ''
  });

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
      category: budget.category || '',
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
    const categoryExpenses = expenses.filter(exp => exp.category === budget.category);
    const spent = categoryExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
    const limit = parseFloat(budget.limit);
    const percentage = (spent / limit) * 100;
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
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + parseFloat(b.limit), 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const status = getBudgetStatus(b);
    return sum + status.spent;
  }, 0);
  const totalRemaining = totalBudgetLimit - totalSpent;

  const exceededBudgets = budgets.filter(b => getBudgetStatus(b).status === 'exceeded').length;
  const warningBudgets = budgets.filter(b => getBudgetStatus(b).status === 'warning').length;

  if (loading) return <div className="loading">Loading budgets...</div>;

  return (
    <div className="entity-management-container">
      {/* Header */}
      <div className="management-header">
        <div>
          <h2>Budget Management</h2>
          <p className="subtitle">{entity?.name} - {budgets.length} budgets</p>
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
          <p className="percentage">{((totalSpent / totalBudgetLimit) * 100).toFixed(1)}%</p>
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
                  <span className="amount">${parseFloat(budget.limit).toFixed(2)}</span>
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
        <div className="empty-state">
          <p>No budgets created yet. Create your first budget to start tracking spending.</p>
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
