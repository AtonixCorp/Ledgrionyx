import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useLanguage } from '../../context/LanguageContext';

const Budget = () => {
  const { t, language } = useLanguage();
  const { 
    budgets, 
    addBudget, 
    deleteBudget,
    expenses,
    financialSummary,
    calculationEngine
  } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    limit: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.category && formData.limit) {
      await addBudget({
        category: formData.category,
        limit: parseFloat(formData.limit)
      });
      setFormData({
        category: '',
        limit: ''
      });
      setShowForm(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate spent amount per category from expenses using calculation engine
  const calculateSpent = (category) => {
    const categoryExpenses = expenses.filter(exp => exp.category === category);
    return calculationEngine.calculateTotalExpenses(categoryExpenses);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return '#e74c3c';
    if (percentage >= 70) return '#f39c12';
    return '#2ecc71';
  };

  return (
    <div className="page-container" key={language}>
      <div className="page-header">
        <h1 className="page-title">Budget Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Budget'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>Create New Budget</h2>
          <form onSubmit={handleSubmit} className="budget-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Food, Transportation"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="limit">Budget Limit ($)</label>
                <input
                  type="number"
                  id="limit"
                  name="limit"
                  value={formData.limit}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Create Budget</button>
          </form>
        </div>
      )}

      {/* Budget Summary from Calculation Engine */}
      {financialSummary && (
        <div className="card budget-summary-card">
          <h2>Budget Overview</h2>
          <div className="summary-stats">
            <div className="stat-box">
              <label>Total Budget</label>
              <span className="stat-value">${financialSummary.budget.total.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              <label>Total Spent</label>
              <span className="stat-value spent">${financialSummary.expenses.total.toFixed(2)}</span>
            </div>
            <div className="stat-box">
              <label>Available</label>
              <span className="stat-value remaining">
                ${calculationEngine.subtract(financialSummary.budget.total, financialSummary.expenses.total).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="budgets-grid">
        {budgets.length > 0 ? (
          budgets.map((budget) => {
            // Use calculation engine for accurate spent calculation
            const spent = calculateSpent(budget.category);
            const budgetLimit = budget.limit || budget.amount;
            const utilization = calculationEngine.calculateBudgetUtilization(budgetLimit, spent);
            const percentage = utilization.percentageUsed;
            const statusColor = getStatusColor(percentage);
            const remaining = utilization.remaining;

            return (
              <div key={budget.id} className="card budget-card">
                <div className="budget-header">
                  <h3>{budget.category}</h3>
                  <button 
                    className="btn-danger btn-small"
                    onClick={() => deleteBudget(budget.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="budget-amounts">
                  <div className="budget-stat">
                    <span className="stat-label">Spent</span>
                    <span className="stat-value spent">${utilization.spent.toFixed(2)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="stat-label">Budget</span>
                    <span className="stat-value">${utilization.budgeted.toFixed(2)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="stat-label">Remaining</span>
                    <span className={`stat-value ${utilization.isOverBudget ? 'over-budget' : 'remaining'}`}>
                      ${Math.abs(remaining).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: statusColor
                    }}
                  >
                    {percentage > 10 && (
                      <span className="progress-text">{percentage.toFixed(0)}%</span>
                    )}
                  </div>
                </div>

                {utilization.isOverBudget && (
                  <div className="budget-warning">
                    ⚠️ {t('labels.overBudget')} ${Math.abs(remaining).toFixed(2)}!
                  </div>
                )}
                {!utilization.isOverBudget && percentage >= 90 && (
                  <div className="budget-warning">
                    ⚠️ {t('labels.approachingLimit')}!
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="card empty-state">
            <p>No budgets created yet. Start by adding a new budget!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Budget;
