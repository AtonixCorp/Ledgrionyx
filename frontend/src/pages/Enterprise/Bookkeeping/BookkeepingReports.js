import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useEnterprise } from '../../../context/EnterpriseContext';

const BookkeepingReports = () => {
  const { entityId } = useParams();
  const navigate = useNavigate();
  const { fetchBookkeepingSummary, entities } = useEnterprise();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('pnl');

  const entity = entities.find(e => e.id === parseInt(entityId));

  const loadReportData = useCallback(async () => {
    setLoading(true);
    const filters = {
      start_date: dateRange.start,
      end_date: dateRange.end
    };

    const summaryData = await fetchBookkeepingSummary(entityId, filters);
    setSummary(summaryData);
    setLoading(false);
  }, [dateRange.end, dateRange.start, entityId, fetchBookkeepingSummary]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + data.map(row => row.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePNLReport = () => {
    if (!summary) return;

    const data = [
      ['Profit & Loss Statement', ''],
      ['Period', `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`],
      ['Entity', entity?.name || 'Unknown'],
      ['', ''],
      ['Income', ''],
      ['Total Income', formatCurrency(summary.total_income, entity?.local_currency)],
      ['', ''],
      ['Expenses', ''],
      ['Total Expenses', formatCurrency(summary.total_expense, entity?.local_currency)],
      ['Payroll', formatCurrency(summary.payroll_total, entity?.local_currency)],
      ['', ''],
      ['Net Profit', formatCurrency(summary.net_profit, entity?.local_currency)],
      ['', ''],
      ['Category Breakdown', ''],
      ...summary.category_breakdown.map(cat => [
        cat.category__name,
        formatCurrency(cat.total, entity?.local_currency)
      ])
    ];

    exportToCSV(data, `pnl-report-${entity?.name || 'entity'}-${dateRange.start}-to-${dateRange.end}.csv`);
  };

  const generateCashflowReport = () => {
    if (!summary) return;

    const data = [
      ['Cash Flow Statement', ''],
      ['Period', `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`],
      ['Entity', entity?.name || 'Unknown'],
      ['', ''],
      ['Operating Activities', ''],
      ['Income', formatCurrency(summary.total_income, entity?.local_currency)],
      ['Expenses', `(${formatCurrency(summary.total_expense, entity?.local_currency)})`],
      ['Net Cash from Operations', formatCurrency(summary.net_profit, entity?.local_currency)],
      ['', ''],
      ['Monthly Trends', ''],
      ...summary.monthly_trend.map(item => [
        item.month,
        formatCurrency(item.total, entity?.local_currency)
      ])
    ];

    exportToCSV(data, `cashflow-report-${entity?.name || 'entity'}-${dateRange.start}-to-${dateRange.end}.csv`);
  };

  if (loading) {
    return (
      <div className="bookkeeping-reports">
        <div className="loading">Loading report data...</div>
      </div>
    );
  }

  return (
    <div className="bookkeeping-reports">
      {/* Header */}
      <div className="bookkeeping-header">
        <div className="header-left">
          <h1>Bookkeeping Reports</h1>
          <p>{entity?.name} - Financial Reports & Exports</p>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={() => navigate(`/enterprise/entity/${entityId}/bookkeeping`)}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="report-filters">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          />
        </div>
        <button className="btn-primary" onClick={loadReportData}>
          Apply Filters
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="report-type-selector">
        <button
          className={`report-type-btn ${reportType === 'pnl' ? 'active' : ''}`}
          onClick={() => setReportType('pnl')}
        >
          Profit & Loss
        </button>
        <button
          className={`report-type-btn ${reportType === 'cashflow' ? 'active' : ''}`}
          onClick={() => setReportType('cashflow')}
        >
          Cash Flow
        </button>
        <button
          className={`report-type-btn ${reportType === 'summary' ? 'active' : ''}`}
          onClick={() => setReportType('summary')}
        >
          Summary
        </button>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {reportType === 'pnl' && (
          <div className="pnl-report">
            <div className="report-header">
              <h2>Profit & Loss Statement</h2>
              <button className="btn-primary" onClick={generatePNLReport}>
                Export CSV
              </button>
            </div>

            <div className="pnl-grid">
              <div className="pnl-section income">
                <h3>Income</h3>
                <div className="pnl-item">
                  <span>Total Income</span>
                  <span className="amount positive">
                    {formatCurrency(summary?.total_income || 0, entity?.local_currency)}
                  </span>
                </div>
              </div>

              <div className="pnl-section expenses">
                <h3>Expenses</h3>
                <div className="pnl-item">
                  <span>Total Expenses</span>
                  <span className="amount negative">
                    {formatCurrency(summary?.total_expense || 0, entity?.local_currency)}
                  </span>
                </div>
                <div className="pnl-item">
                  <span>Payroll</span>
                  <span className="amount negative">
                    {formatCurrency(summary?.payroll_total || 0, entity?.local_currency)}
                  </span>
                </div>
              </div>

              <div className="pnl-section net-profit">
                <h3>Net Result</h3>
                <div className="pnl-item total">
                  <span>Net Profit</span>
                  <span className={`amount ${summary?.net_profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(summary?.net_profit || 0, entity?.local_currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="category-breakdown">
              <h3>Category Breakdown</h3>
              <div className="category-list">
                {summary?.category_breakdown && summary.category_breakdown.length > 0 ? (
                  summary.category_breakdown.map((cat, index) => (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className={`category-badge ${cat.category__type}`}>
                          {cat.category__type === 'income' ? '+' : '-'}
                        </span>
                        <span>{cat.category__name}</span>
                      </div>
                      <div className="category-stats">
                        <span className="amount">
                          {formatCurrency(cat.total, entity?.local_currency)}
                        </span>
                        <span className="count">{cat.count} transactions</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No category data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {reportType === 'cashflow' && (
          <div className="cashflow-report">
            <div className="report-header">
              <h2>Cash Flow Statement</h2>
              <button className="btn-primary" onClick={generateCashflowReport}>
                Export CSV
              </button>
            </div>

            <div className="cashflow-sections">
              <div className="cashflow-section">
                <h3>Operating Activities</h3>
                <div className="cashflow-item">
                  <span>Income</span>
                  <span className="amount positive">
                    {formatCurrency(summary?.total_income || 0, entity?.local_currency)}
                  </span>
                </div>
                <div className="cashflow-item">
                  <span>Expenses</span>
                  <span className="amount negative">
                    ({formatCurrency(summary?.total_expense || 0, entity?.local_currency)})
                  </span>
                </div>
                <div className="cashflow-item total">
                  <span>Net Cash from Operations</span>
                  <span className={`amount ${summary?.net_profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(summary?.net_profit || 0, entity?.local_currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Monthly Trends */}
            <div className="monthly-trends">
              <h3>Monthly Cash Flow Trends</h3>
              <div className="trend-chart">
                {summary?.monthly_trend && summary.monthly_trend.length > 0 ? (
                  <div className="trend-bars">
                    {summary.monthly_trend.map((item, index) => (
                      <div key={index} className="trend-bar-group">
                        <div
                          className="trend-bar"
                          style={{
                            height: `${Math.max((Math.abs(item.total) / 10000) * 100, 10)}%`,
                            backgroundColor: item.total >= 0 ? '#10b981' : '#ef4444'
                          }}
                        >
                          <span className="bar-value">
                            {formatCurrency(item.total, entity?.local_currency)}
                          </span>
                        </div>
                        <span className="bar-label">{item.month}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No trend data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {reportType === 'summary' && (
          <div className="summary-report">
            <div className="report-header">
              <h2>Financial Summary</h2>
              <button className="btn-primary" onClick={() => exportToCSV([
                ['Financial Summary', entity?.name || 'Entity'],
                ['Period', `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`],
                [''],
                ['Total Income', formatCurrency(summary?.total_income || 0, entity?.local_currency)],
                ['Total Expenses', formatCurrency(summary?.total_expense || 0, entity?.local_currency)],
                ['Net Profit', formatCurrency(summary?.net_profit || 0, entity?.local_currency)],
                ['Payroll Total', formatCurrency(summary?.payroll_total || 0, entity?.local_currency)],
                ['Transaction Count', summary?.transaction_count || 0]
              ], `summary-report-${entity?.name || 'entity'}-${dateRange.start}-to-${dateRange.end}.csv`)}>
                Export CSV
              </button>
            </div>

            <div className="summary-stats">
              <div className="stat-card">
                <div className="stat-icon income">

                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Income</p>
                  <h3 className="stat-value">
                    {formatCurrency(summary?.total_income || 0, entity?.local_currency)}
                  </h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon expense">

                </div>
                <div className="stat-content">
                  <p className="stat-label">Total Expenses</p>
                  <h3 className="stat-value">
                    {formatCurrency(summary?.total_expense || 0, entity?.local_currency)}
                  </h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon profit">

                </div>
                <div className="stat-content">
                  <p className="stat-label">Net Profit</p>
                  <h3 className={`stat-value ${summary?.net_profit >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(summary?.net_profit || 0, entity?.local_currency)}
                  </h3>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon transactions">

                </div>
                <div className="stat-content">
                  <p className="stat-label">Transactions</p>
                  <h3 className="stat-value">{summary?.transaction_count || 0}</h3>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookkeepingReports;