import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '../../context/FinanceContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    totalIncome, 
    totalExpenses, 
    balance, 
    expenses, 
    budgets,
    monthlySummary,
    selectedMonth,
    availableMonths,
    changeMonth,
    financialSummary,
    validationResults
  } = useFinance();
  
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly' or 'all-time'
  
  // Get month name
  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  };

  // Determine data to display based on view mode
  const displayData = viewMode === 'monthly' && monthlySummary ? {
    income: monthlySummary.totals?.totalIncome || 0,
    expenses: monthlySummary.totals?.totalExpenses || 0,
    balance: monthlySummary.totals?.remainingBalance || 0,
    tax: monthlySummary.totals?.totalTax || 0,
    netIncome: monthlySummary.totals?.netIncome || 0,
    categoryData: Array.isArray(monthlySummary.categories) ? monthlySummary.categories : [],
    budgetComparison: Array.isArray(monthlySummary.budgetAnalysis?.comparison) ? monthlySummary.budgetAnalysis.comparison : [],
    recentTransactions: Array.isArray(monthlySummary.transactions) ? monthlySummary.transactions : []
  } : {
    income: totalIncome || 0,
    expenses: totalExpenses || 0,
    balance: balance || 0,
    tax: financialSummary?.tax?.amount || 0,
    netIncome: financialSummary?.income?.net || 0,
    categoryData: Array.isArray(expenses) ? expenses.reduce((acc, expense) => {
      const existing = acc.find(item => item.category === expense.category);
      if (existing) {
        existing.amount += expense.amount;
      } else {
        acc.push({ category: expense.category, amount: expense.amount });
      }
      return acc;
    }, []) : [],
    budgetComparison: Array.isArray(budgets) ? budgets.map(b => ({
      category: b.category,
      budget: b.limit || 0,
      spent: b.spent || 0,
      remaining: (b.limit || 0) - (b.spent || 0)
    })) : [],
    recentTransactions: Array.isArray(expenses) ? [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5) : []
  };

  const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71', '#1abc9c'];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="page-title">Financial Dashboard</h1>
        
        {/* View Mode Toggle */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            📅 Monthly View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'all-time' ? 'active' : ''}`}
            onClick={() => setViewMode('all-time')}
          >
            📊 All-Time
          </button>
        </div>
        
        {/* Month Selector (only in monthly view) */}
        {viewMode === 'monthly' && availableMonths.length > 0 && (
          <div className="month-selector">
            <select 
              value={`${selectedMonth.year}-${selectedMonth.month}`}
              onChange={(e) => {
                const [year, month] = e.target.value.split('-');
                changeMonth(parseInt(year), parseInt(month));
              }}
              className="month-select"
            >
              {availableMonths.map(m => (
                <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                  {getMonthName(m.month)} {m.year}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Quick Access Navigation Cards */}
      <div className="grid-3 quick-access-cards">
        <div className="card nav-card dashboard-card" onClick={() => navigate('/dashboard')}>
          <div className="nav-icon">📊</div>
          <div className="nav-content">
            <h3>Dashboard</h3>
            <p>Real-time overview</p>
          </div>
          <div className="nav-arrow">→</div>
        </div>
        
        <div className="card nav-card expenses-card" onClick={() => navigate('/expenses')}>
          <div className="nav-icon">💸</div>
          <div className="nav-content">
            <h3>Expenses</h3>
            <p>Track spending</p>
          </div>
          <div className="nav-arrow">→</div>
        </div>
        
        <div className="card nav-card budgets-card" onClick={() => navigate('/budget')}>
          <div className="nav-icon">🎯</div>
          <div className="nav-content">
            <h3>Budgets</h3>
            <p>Set limits</p>
          </div>
          <div className="nav-arrow">→</div>
        </div>
      </div>
      
      {/* Health Score (if available) */}
      {validationResults && (
        <div className={`card health-score ${
          validationResults.healthScore >= 80 ? 'health-excellent' :
          validationResults.healthScore >= 60 ? 'health-good' :
          validationResults.healthScore >= 40 ? 'health-fair' : 'health-poor'
        }`}>
          <div className="health-content">
            <h3>Financial Health Score</h3>
            <div className="health-bar">
              <div 
                className="health-fill" 
                style={{ width: `${validationResults.healthScore}%` }}
              />
            </div>
            <p className="health-value">{validationResults.healthScore.toFixed(0)}%</p>
            {validationResults.recommendations && validationResults.recommendations.length > 0 && (
              <div className="health-tips">
                <strong>💡 Tips:</strong>
                <ul>
                  {validationResults.recommendations.slice(0, 2).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid-4 summary-cards">
        <div className="card summary-card income">
          <div className="summary-icon">💵</div>
          <div className="summary-content">
            <h3>
              {viewMode === 'monthly' ? 'Monthly' : 'Total'} Income
              {viewMode === 'monthly' && monthlySummary?.trends?.comparison && (
                <span className={`trend ${monthlySummary.trends.comparison.incomeChange >= 0 ? 'up' : 'down'}`}>
                  {monthlySummary.trends.comparison.incomeChange >= 0 ? '↑' : '↓'}
                  {Math.abs(monthlySummary.trends.comparison.incomeChange).toFixed(1)}%
                </span>
              )}
            </h3>
            <p className="summary-amount">${displayData.income.toFixed(2)}</p>
            {viewMode === 'monthly' && monthlySummary?.patterns?.dailyAverage != null && (
              <p className="summary-detail">Avg/day: ${monthlySummary.patterns.dailyAverage.toFixed(2)}</p>
            )}
          </div>
        </div>
        
        <div className="card summary-card expense">
          <div className="summary-icon">💸</div>
          <div className="summary-content">
            <h3>
              {viewMode === 'monthly' ? 'Monthly' : 'Total'} Expenses
              {viewMode === 'monthly' && monthlySummary?.trends?.comparison && (
                <span className={`trend ${monthlySummary.trends.comparison.expenseChange >= 0 ? 'down' : 'up'}`}>
                  {monthlySummary.trends.comparison.expenseChange >= 0 ? '↑' : '↓'}
                  {Math.abs(monthlySummary.trends.comparison.expenseChange).toFixed(1)}%
                </span>
              )}
            </h3>
            <p className="summary-amount">${displayData.expenses.toFixed(2)}</p>
            {viewMode === 'monthly' && monthlySummary?.patterns?.dailyAverage != null && (
              <p className="summary-detail">Avg/day: ${monthlySummary.patterns.dailyAverage.toFixed(2)}</p>
            )}
          </div>
        </div>
        
        <div className="card summary-card tax">
          <div className="summary-icon">🏛️</div>
          <div className="summary-content">
            <h3>{viewMode === 'monthly' ? 'Monthly' : 'Total'} Tax</h3>
            <p className="summary-amount">${displayData.tax.toFixed(2)}</p>
            {financialSummary?.tax && (
              <p className="summary-detail">{financialSummary.tax.rate.toFixed(1)}% rate</p>
            )}
          </div>
        </div>
        
        <div className={`card summary-card ${displayData.balance >= 0 ? 'balance-positive' : 'balance-negative'}`}>
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>{viewMode === 'monthly' ? 'Monthly' : 'Net'} Balance</h3>
            <p className="summary-amount">${displayData.balance.toFixed(2)}</p>
            {viewMode === 'monthly' && monthlySummary?.budgetAnalysis && (
              <p className="summary-detail">
                {monthlySummary.budgetAnalysis.overallStatus === 'under' ? '✅' : '⚠️'}
                {' '}{monthlySummary.budgetAnalysis.overallStatus} budget
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2">
        {/* Category Breakdown */}
        <div className="card">
          <h2 className="chart-title">
            {viewMode === 'monthly' ? 'Monthly' : 'All-Time'} Expenses by Category
          </h2>
          {displayData.categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={displayData.categoryData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.category}: $${(entry.amount || 0).toFixed(2)}`}
                  >
                    {displayData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
              
              {viewMode === 'monthly' && Array.isArray(monthlySummary?.categories) && monthlySummary.categories.length > 0 && (
                <div className="category-details">
                  <h4>Top Spending Categories:</h4>
                  <ul>
                    {monthlySummary.categories.slice(0, 3).map((cat, idx) => (
                      <li key={idx}>
                        <strong>{cat.category}:</strong> ${(cat.amount || 0).toFixed(2)} 
                        ({(cat.percentage || 0).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="empty-state">No expense data available</p>
          )}
        </div>

        {/* Budget vs Actual */}
        <div className="card">
          <h2 className="chart-title">Budget vs Actual Spending</h2>
          {displayData.budgetComparison.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={displayData.budgetComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="spent" fill="#e74c3c" name="Spent" />
                  <Bar dataKey="budget" fill="#2ecc71" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
              
              {viewMode === 'monthly' && monthlySummary?.budgetAnalysis && (
                <div className="budget-status">
                  <p>
                    <strong>Status:</strong> {(monthlySummary.budgetAnalysis.totalRemaining || 0) >= 0 ? '✅' : '⚠️'}
                    {' '}{(monthlySummary.budgetAnalysis.totalRemaining || 0) >= 0 ? 'Under' : 'Over'} budget by 
                    ${Math.abs(monthlySummary.budgetAnalysis.totalRemaining || 0).toFixed(2)}
                  </p>
                  {Array.isArray(monthlySummary.budgetAnalysis.overBudgetCategories) && monthlySummary.budgetAnalysis.overBudgetCategories.length > 0 && (
                    <div className="warning-box">
                      <strong>⚠️ Over Budget:</strong>
                      <ul>
                        {monthlySummary.budgetAnalysis.overBudgetCategories.map((cat, idx) => (
                          <li key={idx}>{cat.category} (${ (cat.over || 0).toFixed(2)} over)</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="empty-state">No budget data available</p>
          )}
        </div>
      </div>
      
      {/* Spending Patterns (Monthly View Only) */}
      {viewMode === 'monthly' && monthlySummary?.patterns?.weeklySpending && (
        <div className="card">
          <h2 className="chart-title">Weekly Spending Pattern</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlySummary.patterns.weeklySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#e74c3c" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          
          {monthlySummary.patterns?.highestSpendingDay && (
            <div className="pattern-insights">
              <p>
                <strong>📊 Insights:</strong> Highest spending day was{' '}
                <strong>{monthlySummary.patterns.highestSpendingDay.date}</strong>
                {' '}with <strong>${(monthlySummary.patterns.highestSpendingDay.amount || 0).toFixed(2)}</strong>
              </p>
              <p>
                Daily average: <strong>${(monthlySummary.patterns.dailyAverage || 0).toFixed(2)}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="chart-title">
          {viewMode === 'monthly' ? 'Monthly' : 'Recent'} Transactions
        </h2>
        <div className="transactions-list">
          {displayData.recentTransactions.length > 0 ? (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayData.recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{new Date(transaction.date).toLocaleDateString()}</td>
                    <td>{transaction.description}</td>
                    <td>
                      <span className="category-badge">{transaction.category}</span>
                    </td>
                    <td className="amount-expense">-${(transaction.amount || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="empty-state">
              {viewMode === 'monthly' ? 'No transactions this month' : 'No transactions yet'}
            </p>
          )}
          
          {viewMode === 'monthly' && monthlySummary && (
            <div className="monthly-summary-footer">
              <div className="summary-stats">
                <div className="stat">
                  <span className="stat-label">Total Transactions:</span>
                  <span className="stat-value">{monthlySummary.transactions?.length || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Categories:</span>
                  <span className="stat-value">{monthlySummary.categories?.length || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Savings Rate:</span>
                  <span className="stat-value">
                    {monthlySummary.totals?.totalIncome > 0 
                      ? (((monthlySummary.totals?.remainingBalance || 0) / monthlySummary.totals.totalIncome) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* AI Insights */}
      {validationResults?.anomalies && validationResults.anomalies.length > 0 && (
        <div className="card anomaly-card">
          <h2 className="chart-title">🤖 AI-Detected Anomalies</h2>
          <div className="anomalies-list">
            {validationResults.anomalies.map((anomaly, idx) => (
              <div key={idx} className={`anomaly-item severity-${anomaly.severity}`}>
                <div className="anomaly-header">
                  <span className="anomaly-type">{anomaly.type}</span>
                  <span className="anomaly-severity">{anomaly.severity}</span>
                </div>
                <p className="anomaly-message">{anomaly.message}</p>
                {anomaly.suggestion && (
                  <p className="anomaly-suggestion">💡 {anomaly.suggestion}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
