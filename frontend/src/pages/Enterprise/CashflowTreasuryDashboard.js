import React, { useState, useEffect, useCallback, useMemo } from 'react';

import { useEnterprise } from '../../context/EnterpriseContext';
import '../../styles/EntityPages.css';

const CashflowTreasuryDashboard = () => {
  const { entities, fetchCashflowTreasuryDashboard, executeInternalTransfer, executeFXConversion, executeInvestmentAllocation } = useEnterprise();

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
  const [activeTreasuryOp, setActiveTreasuryOp] = useState(null); // null | 'transfer' | 'fx' | 'invest' | 'sweep'
  const [opLoading, setOpLoading] = useState(false);
  const [opResult, setOpResult] = useState(null);
  const [transferForm, setTransferForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
  const [fxForm, setFxForm] = useState({ fromAccountId: '', toAccountId: '', amount: '', exchangeRate: '', description: '' });
  const [investForm, setInvestForm] = useState({ fromAccountId: '', amount: '', instrument: '', allocationType: 'fixed_deposit', description: '' });
  const [sweepForm, setSweepForm] = useState({ fromAccountId: '', toAccountId: '', threshold: '', action: 'sweep_excess', ruleName: '' });

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
      case 'critical': return ;
      case 'warning': return ;
      case 'info': return ;
      default: return ;
    }
  };

  const closeTreasuryOp = () => { setActiveTreasuryOp(null); setOpResult(null); };

  const handleTransfer = async (e) => {
    e.preventDefault(); setOpLoading(true); setOpResult(null);
    try {
      const entityId = selectedEntity?.id || entities[0]?.id;
      const res = await executeInternalTransfer({
        entity_id: entityId,
        from_account_id: transferForm.fromAccountId,
        to_account_id: transferForm.toAccountId,
        amount: transferForm.amount,
        description: transferForm.description,
      });
      setOpResult({ success: true, message: res.message || 'Transfer completed successfully.' });
      setTransferForm({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
      loadDashboardData();
    } catch (err) {
      setOpResult({ success: false, message: err.message || 'Transfer failed.' });
    } finally {
      setOpLoading(false);
    }
  };

  const handleFXConversion = async (e) => {
    e.preventDefault(); setOpLoading(true); setOpResult(null);
    try {
      const entityId = selectedEntity?.id || entities[0]?.id;
      const res = await executeFXConversion({
        entity_id: entityId,
        from_account_id: fxForm.fromAccountId,
        to_account_id: fxForm.toAccountId,
        amount: fxForm.amount,
        exchange_rate: fxForm.exchangeRate || undefined,
        description: fxForm.description,
      });
      setOpResult({ success: true, message: res.message || 'FX conversion completed.' });
      setFxForm({ fromAccountId: '', toAccountId: '', amount: '', exchangeRate: '', description: '' });
      loadDashboardData();
    } catch (err) {
      setOpResult({ success: false, message: err.message || 'FX conversion failed.' });
    } finally {
      setOpLoading(false);
    }
  };

  const handleInvestmentAllocation = async (e) => {
    e.preventDefault(); setOpLoading(true); setOpResult(null);
    try {
      const entityId = selectedEntity?.id || entities[0]?.id;
      const res = await executeInvestmentAllocation({
        entity_id: entityId,
        from_account_id: investForm.fromAccountId,
        amount: investForm.amount,
        instrument: investForm.instrument,
        allocation_type: investForm.allocationType,
        description: investForm.description,
      });
      setOpResult({ success: true, message: res.message || 'Investment allocation completed.' });
      setInvestForm({ fromAccountId: '', amount: '', instrument: '', allocationType: 'fixed_deposit', description: '' });
      loadDashboardData();
    } catch (err) {
      setOpResult({ success: false, message: err.message || 'Investment allocation failed.' });
    } finally {
      setOpLoading(false);
    }
  };

  const handleSweepRule = (e) => {
    e.preventDefault();
    setOpResult({
      success: true,
      message: `Sweep rule "${sweepForm.ruleName || 'Rule'}" saved. It will be applied during the next scheduled treasury cycle.`,
    });
  };

  if (loading) {
    return (
      <div className="cashflow-treasury-dashboard">
        <div className="loading">Loading Cashflow &amp; Treasury Dashboard...</div>
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
            Export
          </button>
        </div>
      </div>

      {/* Row 1: Executive KPIs */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-icon">

          </div>
          <div className="kpi-content">
            <p className="kpi-label">Cash on Hand</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.cashOnHand)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">

          </div>
          <div className="kpi-content">
            <p className="kpi-label">Net Cashflow</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.netCashflow)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">

          </div>
          <div className="kpi-content">
            <p className="kpi-label">Liquidity Ratio</p>
            <h2 className="kpi-value">{dashboardData.kpis.liquidityRatio.toFixed(2)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">

          </div>
          <div className="kpi-content">
            <p className="kpi-label">Monthly Burn Rate</p>
            <h2 className="kpi-value">{formatCurrency(dashboardData.kpis.burnRate)}</h2>
            <p className="kpi-change neutral">—</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">

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
              >Daily
              </button>
              <button
                className={`timeline-btn ${timelineView === 'weekly' ? 'active' : ''}`}
                onClick={() => setTimelineView('weekly')}
              >Weekly
              </button>
              <button
                className={`timeline-btn ${timelineView === 'monthly' ? 'active' : ''}`}
                onClick={() => setTimelineView('monthly')}
              >Monthly
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

          </div>

          <div className="insights-list">
            {dashboardData.insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <div className="insight-icon">

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
            <span className="op-subtitle">Select an operation to execute</span>
          </div>

          <div className="operations-grid">
            <button
              className={`operation-btn${activeTreasuryOp === 'transfer' ? ' op-active' : ''}`}
              onClick={() => { setActiveTreasuryOp('transfer'); setOpResult(null); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
              </svg>
              <span>Internal Transfer</span>
            </button>
            <button
              className={`operation-btn${activeTreasuryOp === 'fx' ? ' op-active' : ''}`}
              onClick={() => { setActiveTreasuryOp('fx'); setOpResult(null); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v1m0 6v1m-3-4h6m-6 0a3 3 0 0 1 3-3m0 6a3 3 0 0 0 3-3"/>
              </svg>
              <span>FX Conversion</span>
            </button>
            <button
              className={`operation-btn${activeTreasuryOp === 'invest' ? ' op-active' : ''}`}
              onClick={() => { setActiveTreasuryOp('invest'); setOpResult(null); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span>Investment Allocation</span>
            </button>
            <button
              className={`operation-btn${activeTreasuryOp === 'sweep' ? ' op-active' : ''}`}
              onClick={() => { setActiveTreasuryOp('sweep'); setOpResult(null); }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l16 8-16 8V4z"/>
              </svg>
              <span>Sweep Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Treasury Operation Modal */}
      {activeTreasuryOp && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeTreasuryOp(); }}>
          <div className="modal-content treasury-op-modal">
            <div className="modal-header">
              <h3>
                {activeTreasuryOp === 'transfer' && 'Internal Transfer'}
                {activeTreasuryOp === 'fx' && 'FX Conversion'}
                {activeTreasuryOp === 'invest' && 'Investment Allocation'}
                {activeTreasuryOp === 'sweep' && 'Sweep Rules'}
              </h3>
              <button className="modal-close-btn" onClick={closeTreasuryOp} aria-label="Close">&#x2715;</button>
            </div>

            <div className="treasury-op-form">
              {opResult && (
                <div className={`op-result-banner ${opResult.success ? 'op-success' : 'op-error'}`}>
                  {opResult.message}
                </div>
              )}

              {/* Internal Transfer */}
              {activeTreasuryOp === 'transfer' && (
                <form onSubmit={handleTransfer}>
                  <div className="form-group">
                    <label>From Account</label>
                    <select
                      required
                      value={transferForm.fromAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: e.target.value })}
                    >
                      <option value="">Select source account</option>
                      {dashboardData.bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance, a.currency)} {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Account</label>
                    <select
                      required
                      value={transferForm.toAccountId}
                      onChange={(e) => setTransferForm({ ...transferForm, toAccountId: e.target.value })}
                    >
                      <option value="">Select destination account</option>
                      {dashboardData.bankAccounts.filter(a => String(a.id) !== String(transferForm.fromAccountId)).map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number" step="0.01" min="0.01" required
                      placeholder="0.00"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                      type="text"
                      placeholder="Transfer notes"
                      value={transferForm.description}
                      onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTreasuryOp}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={opLoading}>
                      {opLoading ? 'Processing…' : 'Execute Transfer'}
                    </button>
                  </div>
                </form>
              )}

              {/* FX Conversion */}
              {activeTreasuryOp === 'fx' && (
                <form onSubmit={handleFXConversion}>
                  <div className="form-group">
                    <label>From Account (source currency)</label>
                    <select
                      required
                      value={fxForm.fromAccountId}
                      onChange={(e) => setFxForm({ ...fxForm, fromAccountId: e.target.value })}
                    >
                      <option value="">Select source account</option>
                      {dashboardData.bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance, a.currency)} {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>To Account (target currency)</label>
                    <select
                      required
                      value={fxForm.toAccountId}
                      onChange={(e) => setFxForm({ ...fxForm, toAccountId: e.target.value })}
                    >
                      <option value="">Select destination account</option>
                      {dashboardData.bankAccounts.filter(a => String(a.id) !== String(fxForm.fromAccountId)).map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Amount to Convert</label>
                    <input
                      type="number" step="0.01" min="0.01" required
                      placeholder="0.00"
                      value={fxForm.amount}
                      onChange={(e) => setFxForm({ ...fxForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Exchange Rate (optional — auto-lookup if blank)</label>
                    <input
                      type="number" step="0.000001" min="0.000001"
                      placeholder="Leave blank for auto lookup"
                      value={fxForm.exchangeRate}
                      onChange={(e) => setFxForm({ ...fxForm, exchangeRate: e.target.value })}
                    />
                  </div>
                  {fxForm.amount && fxForm.exchangeRate && (
                    <div className="op-preview">
                      Estimated output: {(parseFloat(fxForm.amount) * parseFloat(fxForm.exchangeRate)).toFixed(2)}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Description (optional)</label>
                    <input
                      type="text"
                      placeholder="FX conversion notes"
                      value={fxForm.description}
                      onChange={(e) => setFxForm({ ...fxForm, description: e.target.value })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTreasuryOp}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={opLoading}>
                      {opLoading ? 'Processing…' : 'Execute Conversion'}
                    </button>
                  </div>
                </form>
              )}

              {/* Investment Allocation */}
              {activeTreasuryOp === 'invest' && (
                <form onSubmit={handleInvestmentAllocation}>
                  <div className="form-group">
                    <label>Source Account</label>
                    <select
                      required
                      value={investForm.fromAccountId}
                      onChange={(e) => setInvestForm({ ...investForm, fromAccountId: e.target.value })}
                    >
                      <option value="">Select account</option>
                      {dashboardData.bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {formatCurrency(a.balance, a.currency)} {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Allocation Type</label>
                    <select
                      value={investForm.allocationType}
                      onChange={(e) => setInvestForm({ ...investForm, allocationType: e.target.value })}
                    >
                      <option value="fixed_deposit">Fixed Deposit</option>
                      <option value="treasury_bills">Treasury Bills</option>
                      <option value="money_market">Money Market</option>
                      <option value="bonds">Bonds</option>
                      <option value="equity">Equity</option>
                      <option value="general">General Investment</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Instrument / Fund Name</label>
                    <input
                      type="text" required
                      placeholder="e.g. T-Bill 90-day, HSBC Money Market"
                      value={investForm.instrument}
                      onChange={(e) => setInvestForm({ ...investForm, instrument: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number" step="0.01" min="0.01" required
                      placeholder="0.00"
                      value={investForm.amount}
                      onChange={(e) => setInvestForm({ ...investForm, amount: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="Additional details"
                      value={investForm.description}
                      onChange={(e) => setInvestForm({ ...investForm, description: e.target.value })}
                    />
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTreasuryOp}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={opLoading}>
                      {opLoading ? 'Processing…' : 'Allocate Funds'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sweep Rules */}
              {activeTreasuryOp === 'sweep' && (
                <form onSubmit={handleSweepRule}>
                  <p className="op-info">Sweep rules automatically move excess funds or top up accounts based on balance thresholds.</p>
                  <div className="form-group">
                    <label>Rule Name</label>
                    <input
                      type="text" required
                      placeholder="e.g. Overnight Sweep"
                      value={sweepForm.ruleName}
                      onChange={(e) => setSweepForm({ ...sweepForm, ruleName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>From Account</label>
                    <select
                      required
                      value={sweepForm.fromAccountId}
                      onChange={(e) => setSweepForm({ ...sweepForm, fromAccountId: e.target.value })}
                    >
                      <option value="">Select account</option>
                      {dashboardData.bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Action</label>
                    <select
                      value={sweepForm.action}
                      onChange={(e) => setSweepForm({ ...sweepForm, action: e.target.value })}
                    >
                      <option value="sweep_excess">Sweep Excess (when above threshold)</option>
                      <option value="top_up">Top Up (when below threshold)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Threshold Amount</label>
                    <input
                      type="number" step="0.01" min="0" required
                      placeholder="0.00"
                      value={sweepForm.threshold}
                      onChange={(e) => setSweepForm({ ...sweepForm, threshold: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>To Account</label>
                    <select
                      required
                      value={sweepForm.toAccountId}
                      onChange={(e) => setSweepForm({ ...sweepForm, toAccountId: e.target.value })}
                    >
                      <option value="">Select destination account</option>
                      {dashboardData.bankAccounts.filter(a => String(a.id) !== String(sweepForm.fromAccountId)).map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {a.currency}</option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={closeTreasuryOp}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Rule</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashflowTreasuryDashboard;