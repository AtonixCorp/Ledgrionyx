import React, { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    expenses,
    income,
    models,
    reports,
    totalIncome,
    totalExpenses,
    balance,
    loadFinancialModels,
    loadReports
  } = useFinance();

  // Load backend data
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadFinancialModels();
        await loadReports();
      } catch (err) {
        console.error('Error loading analytics data:', err);
      }
    };
    loadData();
  }, [loadFinancialModels, loadReports]);

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

  // Financial Models Analytics
  const modelsByType = useMemo(() => {
    const typeMap = models.reduce((acc, model) => {
      if (!acc[model.model_type]) {
        acc[model.model_type] = 0;
      }
      acc[model.model_type] += 1;
      return acc;
    }, {});

    return Object.entries(typeMap).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count
    }));
  }, [models]);

  const valuationRanges = useMemo(() => {
    const ranges = { '0-10M': 0, '10-50M': 0, '50-100M': 0, '100M+': 0 };

    models.forEach(model => {
      const ev = model.enterprise_value || 0;
      if (ev < 10000000) ranges['0-10M']++;
      else if (ev < 50000000) ranges['10-50M']++;
      else if (ev < 100000000) ranges['50-100M']++;
      else ranges['100M+']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count
    }));
  }, [models]);

  const recentReports = useMemo(() => {
    return reports
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [reports]);

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

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

      {/* Financial Models Analytics */}
      {models.length > 0 && (
        <>
          <h2 className="section-title">Financial Models Analytics</h2>
          <div className="grid-2">
            <div className="card">
              <h2 className="chart-title">Models by Type</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelsByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="chart-title">Valuation Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={valuationRanges}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.range}: ${entry.count}`}
                  >
                    {valuationRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Reports */}
          {recentReports.length > 0 && (
            <div className="card">
              <h2 className="chart-title">Recent Reports</h2>
              <div className="recent-reports-list">
                {recentReports.map((report) => (
                  <div key={report.id} className="report-item">
                    <div className="report-info">
                      <h4>{report.title}</h4>
                      <p className="report-meta">
                        {report.report_type} • {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="report-status">
                      <span className={`status-badge status-${report.export_format.toLowerCase()}`}>
                        {report.export_format}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
