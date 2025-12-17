import React, { useState, useEffect } from 'react';
import { FaWallet, FaChartLine, FaCoins, FaClock, FaExclamationTriangle, FaCheckCircle, FaArrowUp, FaArrowDown, FaExchangeAlt, FaPiggyBank, FaCreditCard, FaCalendarAlt, FaFilter, FaDownload } from 'react-icons/fa';
import { useEnterprise } from '../../context/EnterpriseContext';
import './CashflowTreasury.css';

const CashflowTreasuryDashboard = () => {
  const { currentOrganization, entities, fetchCashflowTreasuryDashboard } = useEnterprise();

  // State management
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timelineView, setTimelineView] = useState('monthly');

  // Mock data for demonstration - in real implementation, this would come from API
  const mockDashboardData = {
    kpis: {
      cashOnHand: 2456789.45,
      netCashflow: 156789.23,
      liquidityRatio: 1.45,
      burnRate: -45678.90,
      runway: 54 // days
    },
    cashflowTimeline: {
      monthly: [
        { month: 'Jan', inflows: 450000, outflows: 380000, forecast: 420000 },
        { month: 'Feb', inflows: 480000, outflows: 395000, forecast: 435000 },
        { month: 'Mar', inflows: 520000, outflows: 410000, forecast: 450000 },
        { month: 'Apr', inflows: 495000, outflows: 425000, forecast: 465000 },
        { month: 'May', inflows: 535000, outflows: 440000, forecast: 480000 },
        { month: 'Jun', inflows: 510000, outflows: 455000, forecast: 495000 }
      ],
      weekly: [], // Would be populated with weekly data
      daily: [] // Would be populated with daily data
    },
    bankAccounts: [
      { id: 1, name: 'Main Operating Account', bank: 'Chase', balance: 1250000.00, currency: 'USD', type: 'operational' },
      { id: 2, name: 'Reserve Account', bank: 'Wells Fargo', balance: 850000.00, currency: 'USD', type: 'reserve' },
      { id: 3, name: 'Investment Account', bank: 'Goldman Sachs', balance: 356789.45, currency: 'USD', type: 'investment' },
      { id: 4, name: 'EUR Operations', bank: 'Deutsche Bank', balance: 234567.89, currency: 'EUR', type: 'operational' }
    ],
    accountsPayable: {
      upcoming: [
        { id: 1, vendor: 'Microsoft', amount: 45000.00, dueDate: '2025-01-15', status: 'pending', risk: 'low' },
        { id: 2, vendor: 'AWS', amount: 28500.00, dueDate: '2025-01-18', status: 'pending', risk: 'medium' },
        { id: 3, vendor: 'Office Supplies Inc', amount: 12500.00, dueDate: '2025-01-20', status: 'pending', risk: 'low' }
      ],
      overdue: [
        { id: 4, vendor: 'Consulting LLC', amount: 75000.00, dueDate: '2024-12-28', status: 'overdue', risk: 'high' }
      ]
    },
    accountsReceivable: {
      expected: [
        { id: 1, customer: 'Tech Corp', amount: 125000.00, dueDate: '2025-01-10', status: 'pending', reliability: 'high' },
        { id: 2, customer: 'Startup Inc', amount: 87500.00, dueDate: '2025-01-15', status: 'pending', reliability: 'medium' }
      ],
      aging: {
        current: 245000.00,
        '1-30': 156000.00,
        '31-60': 89000.00,
        '61-90': 45000.00,
        '90+': 23000.00
      }
    },
    insights: [
      { type: 'warning', message: 'Cash runway decreased by 12% this month', impact: 'high' },
      { type: 'info', message: 'AI detected seasonal cashflow pattern - Q4 typically 15% higher', impact: 'medium' },
      { type: 'success', message: 'Payment optimization saved $12,500 in fees', impact: 'low' }
    ],
    alerts: [
      { type: 'critical', message: 'Liquidity ratio below 1.2 threshold', priority: 'high' },
      { type: 'warning', message: 'Large transaction pending approval: $250,000', priority: 'medium' },
      { type: 'info', message: 'FX exposure increased 8% this week', priority: 'low' }
    ]
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedEntity, dateRange, selectedCurrency]);

  const loadDashboardData = async () => {
    setLoading(true);
    const filters = {
      start_date: dateRange.start,
      end_date: dateRange.end,
      currency: selectedCurrency
    };

    const data = await fetchCashflowTreasuryDashboard(selectedEntity?.id || entities[0]?.id, filters);
    if (data) {
      setDashboardData(data);
    } else {
      // Fallback to mock data if API fails
      setDashboardData(mockDashboardData);
    }
    setLoading(false);
  };

  const formatCurrency = (amount, currency = selectedCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low': return '#0E9F6E';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <FaExclamationTriangle className="alert-critical" />;
      case 'warning': return <FaExclamationTriangle className="alert-warning" />;
      case 'info': return <FaCheckCircle className="alert-info" />;
      default: return <FaCheckCircle className="alert-info" />;
    }
  };

  if (loading) {
    return (
      <div className="cashflow-treasury-dashboard">
        <div className="loading">Loading Cashflow & Treasury Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="cashflow-treasury-dashboard">
      {/* Top Bar */}
      <div className="dashboard-top-bar">
        <div className="top-bar-left">
          <h1>Cashflow & Treasury</h1>
          <p>Real-time financial visibility and treasury operations</p>
        </div>
        <div className="top-bar-controls">
          <select
            value={selectedEntity?.id || ''}
            onChange={(e) => setSelectedEntity(entities.find(ent => ent.id === parseInt(e.target.value)))}
            className="entity-selector"
          >
            <option value="">Select Entity</option>
            {entities.map(entity => (
              <option key={entity.id} value={entity.id}>{entity.name}</option>
            ))}
          </select>

          <div className="date-range-selector">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
          </div>

          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            className="currency-selector"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>

          <button className="export-btn">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Row 1: Executive KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon">
            <FaWallet />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Cash on Hand</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.cashOnHand)}</h2>
            <p className="kpi-change positive">+2.3% from last month</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaChartLine />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Net Cashflow</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.netCashflow)}</h2>
            <p className="kpi-change positive">+8.7% from last period</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaCoins />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Liquidity Ratio</p>
            <h2 className="kpi-value">{dashboardData.kpis.liquidityRatio.toFixed(2)}</h2>
            <p className="kpi-change neutral">Target: 1.5</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaArrowDown />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Monthly Burn Rate</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.burnRate)}</h2>
            <p className="kpi-change negative">+5.2% from last month</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaClock />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Runway</p>
            <h2 className="kpi-value">{dashboardData.kpis.runway} days</h2>
            <p className="kpi-change warning">-12% from last month</p>
          </div>
        </div>
      </div>

      {/* Row 2: Cashflow Timeline */}
      <div className="timeline-row">
        <div className="timeline-card">
          <div className="card-header">
            <h3>Cashflow Timeline</h3>
            <div className="timeline-controls">
              <button
                className={`timeline-btn ${timelineView === 'daily' ? 'active' : ''}`}
                onClick={() => setTimelineView('daily')}
              >
                Daily
              </button>
              <button
                className={`timeline-btn ${timelineView === 'weekly' ? 'active' : ''}`}
                onClick={() => setTimelineView('weekly')}
              >
                Weekly
              </button>
              <button
                className={`timeline-btn ${timelineView === 'monthly' ? 'active' : ''}`}
                onClick={() => setTimelineView('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="timeline-chart">
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color inflows"></div>
                <span>Inflows</span>
              </div>
              <div className="legend-item">
                <div className="legend-color outflows"></div>
                <span>Outflows</span>
              </div>
              <div className="legend-item">
                <div className="legend-color forecast"></div>
                <span>Forecast</span>
              </div>
            </div>

            <div className="chart-bars">
              {dashboardData.cashflowTimeline.monthly.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="bar-container">
                    <div
                      className="bar inflows"
                      style={{ height: `${(item.inflows / 600000) * 100}%` }}
                      title={`Inflows: ${formatCurrency(item.inflows)}`}
                    ></div>
                    <div
                      className="bar outflows"
                      style={{ height: `${(item.outflows / 600000) * 100}%` }}
                      title={`Outflows: ${formatCurrency(item.outflows)}`}
                    ></div>
                  </div>
                  <div
                    className="bar forecast"
                    style={{ height: `${(item.forecast / 600000) * 100}%` }}
                    title={`Forecast: ${formatCurrency(item.forecast)}`}
                  ></div>
                  <span className="bar-label">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Treasury & Liquidity */}
      <div className="treasury-row">
        {/* Bank Accounts Panel */}
        <div className="bank-accounts-card">
          <div className="card-header">
            <h3>Bank Accounts</h3>
            <button className="add-account-btn">+ Add Account</button>
          </div>

          <div className="accounts-list">
            {dashboardData.bankAccounts.map(account => (
              <div key={account.id} className="account-item">
                <div className="account-info">
                  <div className="account-name">{account.name}</div>
                  <div className="account-bank">{account.bank}</div>
                  <div className={`account-type ${account.type}`}>{account.type}</div>
                </div>
                <div className="account-balance">
                  <div className="balance-amount">{formatCurrency(account.balance, account.currency)}</div>
                  <div className="balance-currency">{account.currency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Liquidity Heatmap */}
        <div className="liquidity-heatmap-card">
          <div className="card-header">
            <h3>Liquidity Heatmap</h3>
            <div className="heatmap-legend">
              <div className="legend-item">
                <div className="legend-color high"></div>
                <span>High Liquidity</span>
              </div>
              <div className="legend-item">
                <div className="legend-color medium"></div>
                <span>Medium Liquidity</span>
              </div>
              <div className="legend-item">
                <div className="legend-color low"></div>
                <span>Low Liquidity</span>
              </div>
            </div>
          </div>

          <div className="heatmap-grid">
            {/* Mock heatmap - in real implementation, this would be dynamic */}
            <div className="heatmap-day high">Mon</div>
            <div className="heatmap-day high">Tue</div>
            <div className="heatmap-day medium">Wed</div>
            <div className="heatmap-day medium">Thu</div>
            <div className="heatmap-day low">Fri</div>
            <div className="heatmap-day high">Sat</div>
            <div className="heatmap-day high">Sun</div>
          </div>
        </div>
      </div>

      {/* Row 4: AP & AR */}
      <div className="ap-ar-row">
        {/* Accounts Payable */}
        <div className="ap-card">
          <div className="card-header">
            <h3>Accounts Payable</h3>
            <button className="view-all-btn">View All</button>
          </div>

          <div className="ap-sections">
            <div className="ap-section">
              <h4>Upcoming Payments</h4>
              <div className="payment-list">
                {dashboardData.accountsPayable.upcoming.map(payment => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <div className="vendor-name">{payment.vendor}</div>
                      <div className="payment-date">Due: {formatDate(payment.dueDate)}</div>
                    </div>
                    <div className="payment-amount">
                      <div className="amount">{formatCurrency(payment.amount)}</div>
                      <div className={`risk-badge ${payment.risk}`}>{payment.risk} risk</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ap-section">
              <h4>Overdue ({dashboardData.accountsPayable.overdue.length})</h4>
              <div className="overdue-list">
                {dashboardData.accountsPayable.overdue.map(payment => (
                  <div key={payment.id} className="overdue-item">
                    <div className="payment-info">
                      <div className="vendor-name">{payment.vendor}</div>
                      <div className="payment-date overdue">Overdue: {formatDate(payment.dueDate)}</div>
                    </div>
                    <div className="payment-amount">
                      <div className="amount overdue">{formatCurrency(payment.amount)}</div>
                      <div className={`risk-badge ${payment.risk}`}>{payment.risk} risk</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Receivable */}
        <div className="ar-card">
          <div className="card-header">
            <h3>Accounts Receivable</h3>
            <button className="view-all-btn">View All</button>
          </div>

          <div className="ar-sections">
            <div className="ar-section">
              <h4>Expected Inflows</h4>
              <div className="inflow-list">
                {dashboardData.accountsReceivable.expected.map(inflow => (
                  <div key={inflow.id} className="inflow-item">
                    <div className="customer-info">
                      <div className="customer-name">{inflow.customer}</div>
                      <div className="inflow-date">Expected: {formatDate(inflow.dueDate)}</div>
                    </div>
                    <div className="inflow-amount">
                      <div className="amount">{formatCurrency(inflow.amount)}</div>
                      <div className={`reliability-badge ${inflow.reliability}`}>{inflow.reliability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ar-section">
              <h4>Aging Analysis</h4>
              <div className="aging-breakdown">
                <div className="aging-item">
                  <span className="aging-label">Current</span>
                  <span className="aging-amount">{formatCurrency(dashboardData.accountsReceivable.aging.current)}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">1-30 days</span>
                  <span className="aging-amount">{formatCurrency(dashboardData.accountsReceivable.aging['1-30'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">31-60 days</span>
                  <span className="aging-amount">{formatCurrency(dashboardData.accountsReceivable.aging['31-60'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">61-90 days</span>
                  <span className="aging-amount">{formatCurrency(dashboardData.accountsReceivable.aging['61-90'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">90+ days</span>
                  <span className="aging-amount overdue">{formatCurrency(dashboardData.accountsReceivable.aging['90+'])}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: AI Insights & Alerts */}
      <div className="insights-alerts-row">
        {/* AI Insights */}
        <div className="insights-card">
          <div className="card-header">
            <h3>AI Insights</h3>
            <FaPiggyBank className="card-icon" />
          </div>

          <div className="insights-list">
            {dashboardData.insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'warning' && <FaExclamationTriangle />}
                  {insight.type === 'info' && <FaCheckCircle />}
                  {insight.type === 'success' && <FaCheckCircle />}
                </div>
                <div className="insight-content">
                  <p className="insight-message">{insight.message}</p>
                  <span className={`insight-impact ${insight.impact}`}>{insight.impact} impact</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="alerts-card">
          <div className="card-header">
            <h3>Alerts</h3>
            <FaExclamationTriangle className="card-icon" />
          </div>

          <div className="alerts-list">
            {dashboardData.alerts.map((alert, index) => (
              <div key={index} className={`alert-item ${alert.type}`}>
                <div className="alert-icon">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className={`alert-priority ${alert.priority}`}>{alert.priority} priority</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Treasury Operations Module */}
      <div className="treasury-operations-row">
        <div className="operations-card">
          <div className="card-header">
            <h3>Treasury Operations</h3>
            <FaExchangeAlt className="card-icon" />
          </div>

          <div className="operations-grid">
            <button className="operation-btn">
              <FaExchangeAlt className="operation-icon" />
              <span>Internal Transfer</span>
            </button>
            <button className="operation-btn">
              <FaCoins className="operation-icon" />
              <span>FX Conversion</span>
            </button>
            <button className="operation-btn">
              <FaPiggyBank className="operation-icon" />
              <span>Investment Allocation</span>
            </button>
            <button className="operation-btn">
              <FaCreditCard className="operation-icon" />
              <span>Sweep Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashflowTreasuryDashboard;