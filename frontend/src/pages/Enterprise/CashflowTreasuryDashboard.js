import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaWallet, FaChartLine, FaCoins, FaClock, FaExclamationTriangle, FaCheckCircle,
  FaArrowDown, FaExchangeAlt, FaPiggyBank, FaCreditCard, FaDownload
} from 'react-icons/fa';
import { useEnterprise } from '../../context/EnterpriseContext';

const CashflowTreasuryDashboard = () => {
  const { entities, fetchCashflowTreasuryDashboard } = useEnterprise();

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

  const emptyDashboardData = useMemo(
    () => ({
      kpis: {
        cashOnHand: 0,
        netCashflow: 0,
        liquidityRatio: 0,
        burnRate: 0,
        runway: 0,
      },
      cashflowTimeline: {
        monthly: [],
        weekly: [],
        daily: [],
      },
      bankAccounts: [],
      accountsPayable: { upcoming: [], overdue: [] },
      accountsReceivable: { expected: [], aging: { current: 0, '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0 } },
      insights: [],
      alerts: [],
    }),
    []
  );

  const timelineItems = useMemo(() => {
    const timeline = dashboardData?.cashflowTimeline || {};
    const items = timeline[timelineView];
    return Array.isArray(items) ? items : [];
  }, [dashboardData, timelineView]);

  const chartMax = useMemo(() => {
    const values = timelineItems.flatMap((item) => [
      Number(item?.inflows || 0),
      Number(item?.outflows || 0),
      Number(item?.forecast || 0),
    ]);
    const max = values.length ? Math.max(...values) : 0;
    return max > 0 ? max : 1;
  }, [timelineItems]);

  const arAging = useMemo(() => {
    const aging = dashboardData?.accountsReceivable?.aging;
    return {
      current: Number(aging?.current || 0),
      '1-30': Number(aging?.['1-30'] || 0),
      '31-60': Number(aging?.['31-60'] || 0),
      '61-90': Number(aging?.['61-90'] || 0),
      '90+': Number(aging?.['90+'] || 0),
    };
  }, [dashboardData]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    const activeEntityId = selectedEntity?.id || entities[0]?.id;
    if (!activeEntityId) {
      setDashboardData(emptyDashboardData);
      setLoading(false);
      return;
    }

    const filters = {
      start_date: dateRange.start,
      end_date: dateRange.end,
      currency: selectedCurrency
    };

    const data = await fetchCashflowTreasuryDashboard(activeEntityId, filters);
    setDashboardData(data || emptyDashboardData);
    setLoading(false);
  }, [dateRange.end, dateRange.start, emptyDashboardData, entities, fetchCashflowTreasuryDashboard, selectedCurrency, selectedEntity?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaChartLine />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Net Cashflow</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.netCashflow)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaCoins />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Liquidity Ratio</p>
            <h2 className="kpi-value">{dashboardData.kpis.liquidityRatio.toFixed(2)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaArrowDown />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Monthly Burn Rate</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.burnRate)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <FaClock />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Runway</p>
            <h2 className="kpi-value">{dashboardData.kpis.runway} days</h2>
            <p className="kpi-change neutral">—</p>
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
                {timelineItems.length === 0 ? (
                  <div className="loading">No cashflow data for this period.</div>
                ) : (
                  timelineItems.map((item, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="bar-container">
                    <div
                      className="bar inflows"
                        style={{ height: `${(Number(item.inflows || 0) / chartMax) * 100}%` }}
                      title={`Inflows: ${formatCurrency(item.inflows)}`}
                    ></div>
                    <div
                      className="bar outflows"
                        style={{ height: `${(Number(item.outflows || 0) / chartMax) * 100}%` }}
                      title={`Outflows: ${formatCurrency(item.outflows)}`}
                    ></div>
                  </div>
                  <div
                    className="bar forecast"
                      style={{ height: `${(Number(item.forecast || 0) / chartMax) * 100}%` }}
                    title={`Forecast: ${formatCurrency(item.forecast)}`}
                  ></div>
                    <span className="bar-label">{item.month || item.week || item.day || ''}</span>
                </div>
                  ))
                )}
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
            {dashboardData.bankAccounts.length === 0 ? (
              <div className="loading">No bank accounts yet for this entity.</div>
            ) : (
              dashboardData.bankAccounts.map(account => (
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
              ))
            )}
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
            <div className="loading">Liquidity heatmap is not available yet.</div>
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
                {dashboardData.accountsPayable.upcoming.length === 0 ? (
                  <div className="loading">No upcoming payments.</div>
                ) : (
                  dashboardData.accountsPayable.upcoming.map(payment => (
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
                  ))
                )}
              </div>
            </div>

            <div className="ap-section">
              <h4>Overdue ({dashboardData.accountsPayable.overdue.length})</h4>
              <div className="overdue-list">
                {dashboardData.accountsPayable.overdue.length === 0 ? (
                  <div className="loading">No overdue payments.</div>
                ) : (
                  dashboardData.accountsPayable.overdue.map(payment => (
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
                  ))
                )}
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
                {dashboardData.accountsReceivable.expected.length === 0 ? (
                  <div className="loading">No expected inflows.</div>
                ) : (
                  dashboardData.accountsReceivable.expected.map(inflow => (
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
                  ))
                )}
              </div>
            </div>

            <div className="ar-section">
              <h4>Aging Analysis</h4>
              <div className="aging-breakdown">
                <div className="aging-item">
                  <span className="aging-label">Current</span>
                  <span className="aging-amount">{formatCurrency(arAging.current)}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">1-30 days</span>
                  <span className="aging-amount">{formatCurrency(arAging['1-30'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">31-60 days</span>
                  <span className="aging-amount">{formatCurrency(arAging['31-60'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">61-90 days</span>
                  <span className="aging-amount">{formatCurrency(arAging['61-90'])}</span>
                </div>
                <div className="aging-item">
                  <span className="aging-label">90+ days</span>
                  <span className="aging-amount overdue">{formatCurrency(arAging['90+'])}</span>
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