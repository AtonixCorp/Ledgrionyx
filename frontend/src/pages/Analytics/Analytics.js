import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const { expenses, income, totalIncome, totalExpenses, balance } = useFinance();

  // Category-wise expenses
  const expensesByCategory = useMemo(() => {
    const categoryMap = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += expense.amount;
      return acc;
    }, {});

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2))
    }));
  }, [expenses]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const months = {};
    
    expenses.forEach(expense => {
      const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!months[month]) {
        months[month] = { month, expenses: 0, income: 0 };
      }
      months[month].expenses += expense.amount;
    });

    income.forEach(inc => {
      const month = new Date(inc.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!months[month]) {
        months[month] = { month, expenses: 0, income: 0 };
      }
      months[month].income += inc.amount;
    });

    return Object.values(months).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });
  }, [expenses, income]);

  // Top expenses
  const topExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const COLORS = ['#e74c3c', '#3498db', '#9b59b6', '#f39c12', '#2ecc71', '#1abc9c', '#e67e22'];

  const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

  return (
    <div className="page-container">
      <h1 className="page-title">Analytics & Insights</h1>

      {/* Key Metrics */}
      <div className="grid-4">
        <div className="card metric-card">
          <div className="metric-icon">📊</div>
          <div className="metric-content">
            <h4>Savings Rate</h4>
            <p className="metric-value">{savingsRate}%</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h4>Total Balance</h4>
            <p className={`metric-value ${balance >= 0 ? 'positive' : 'negative'}`}>
              ${Math.abs(balance).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <h4>Total Income</h4>
            <p className="metric-value positive">${totalIncome.toFixed(2)}</p>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon">📉</div>
          <div className="metric-content">
            <h4>Total Expenses</h4>
            <p className="metric-value negative">${totalExpenses.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-2">
        <div className="card">
          <h2 className="chart-title">Expense Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                dataKey="amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.category} (${((entry.amount / totalExpenses) * 100).toFixed(1)}%)`}
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="chart-title">Category-wise Spending</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Bar dataKey="amount" fill="#e74c3c" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Trend */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h2 className="chart-title">Income vs Expenses Trend</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#2ecc71" strokeWidth={2} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#e74c3c" strokeWidth={2} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Expenses */}
      <div className="card">
        <h2 className="chart-title">Top 5 Expenses</h2>
        <div className="top-expenses-list">
          {topExpenses.map((expense, index) => (
            <div key={expense.id} className="top-expense-item">
              <div className="expense-rank">#{index + 1}</div>
              <div className="expense-details">
                <h4>{expense.description}</h4>
                <p className="expense-meta">
                  {expense.category} • {new Date(expense.date).toLocaleDateString()}
                </p>
              </div>
              <div className="expense-amount">${expense.amount.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
