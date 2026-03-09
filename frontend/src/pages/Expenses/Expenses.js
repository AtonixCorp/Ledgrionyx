import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';

const Expenses = () => {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    calculationEngine,
    monthlySummary,
    financialSummary,
    validationResults,
    budgets
  } = useFinance();
  
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'monthly'
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Health', 'Shopping', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.description && formData.amount) {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0]
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

  // Use calculation engine for total
  const totalExpenses = financialSummary 
    ? financialSummary.expenses?.total || 0
    : calculationEngine.calculateTotalExpenses(Array.isArray(expenses) ? expenses : []);
  
  // Get monthly expenses if in monthly view
  const displayExpenses = viewMode === 'monthly' && monthlySummary
    ? (Array.isArray(monthlySummary.transactions) ? monthlySummary.transactions : [])
    : (Array.isArray(expenses) ? expenses : []);
  
  const displayTotal = viewMode === 'monthly' && monthlySummary
    ? (monthlySummary.totals?.totalExpenses || 0)
    : totalExpenses;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              All Time
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              This Month
            </button>
          </div>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card form-card">
          <h2>Add New Expense</h2>
          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter expense description"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Add Expense</button>
          </form>
        </div>
      )}

      {/* Summary Card */}
      <div className="card summary-card">
        <div className="expenses-summary">
          <h2>
            {viewMode === 'monthly' ? 'Monthly' : 'Total'} Expenses: 
            <span className="total-amount"> ${displayTotal.toFixed(2)}</span>
          </h2>
          {viewMode === 'monthly' && monthlySummary && (
            <div className="monthly-stats">
              <div className="stat-item">
                <span className="stat-label">Daily Average:</span>
                <span className="stat-value">${(monthlySummary.patterns?.dailyAverage || 0).toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Transactions:</span>
                <span className="stat-value">{monthlySummary.transactions?.length || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Categories:</span>
                <span className="stat-value">{monthlySummary.categories?.length || 0}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Budget Warnings */}
        {validationResults?.warnings && validationResults.warnings.length > 0 && (
          <div className="validation-warnings">
            {validationResults.warnings.slice(0, 2).map((warning, idx) => (
              <div key={idx} className="warning-message">
                ⚠️ {warning}
              </div>
            ))}
          </div>
        )}
        
        {/* Category Breakdown (Monthly View) */}
        {viewMode === 'monthly' && Array.isArray(monthlySummary?.categories) && monthlySummary.categories.length > 0 && (
          <div className="category-breakdown">
            <h3>Spending by Category</h3>
            <div className="category-grid">
              {monthlySummary.categories.map((cat, idx) => {
                const budget = Array.isArray(budgets) ? budgets.find(b => b.category === cat.category) : null;
                const percentUsed = budget && budget.limit ? ((cat.amount || 0) / budget.limit) * 100 : 0;
                
                return (
                  <div key={idx} className="category-item">
                    <div className="category-header">
                      <span className="category-name">{cat.category}</span>
                      <span className="category-amount">${(cat.amount || 0).toFixed(2)}</span>
                    </div>
                    {budget && (
                      <div className="category-progress">
                        <div 
                          className={`progress-bar ${percentUsed > 100 ? 'over-budget' : ''}`}
                          style={{ width: `${Math.min(percentUsed, 100)}%` }}
                        />
                        <span className="progress-text">
                          {percentUsed.toFixed(0)}% of ${(budget.limit || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Expenses Table */}
      <div className="card">
        <h2 className="section-title">
          {viewMode === 'monthly' ? 'Monthly' : 'All'} Transactions
        </h2>
        
        <div className="expenses-list">
          {displayExpenses.length > 0 ? (
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayExpenses
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((expense) => (
                  <tr key={expense.id}>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.description}</td>
                    <td>
                      <span className="category-badge">{expense.category}</span>
                    </td>
                    <td className="amount">${(expense.amount || 0).toFixed(2)}</td>
                    <td>
                      <button 
                        className="btn-danger"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">
              {viewMode === 'monthly' ? 'No expenses this month' : 'No expenses yet. Add your first expense!'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Expenses;
