import React, { useEffect, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { FaWallet, FaChartLine, FaPercent, FaArrowRight } from 'react-icons/fa';
import './EnterpriseCashflow.css';

const EnterpriseCashflow = () => {
  const { currentOrganization } = useEnterprise();
  const [cashflowData, setCashflowData] = useState({});
  const [timeRange, setTimeRange] = useState('monthly'); // 'weekly', 'monthly', 'quarterly'
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setLoading(true);
      // TODO: Call API endpoint /api/cashflow-forecasts/?organization_id=currentOrganization.id
      const mockData = {
        total_position: {
          USD: 250000,
          EUR: 85000,
          GBP: 45000,
          CAD: 120000,
        },
        by_bank: {
          'JP Morgan': { USD: 150000, EUR: 40000 },
          'Bank of America': { USD: 100000, EUR: 45000 },
          'HSBC': { GBP: 45000, EUR: 0 },
          'RBC': { CAD: 120000, USD: 0 },
        },
        by_entity: {
          'Entity A': { USD: 120000, EUR: 30000 },
          'Entity B': { USD: 80000, EUR: 35000 },
          'Entity C': { USD: 50000, GBP: 45000, CAD: 60000 },
          'Entity D': { CAD: 60000, EUR: 20000 },
        },
        monthly_forecast: [
          { month: 'Jan', inflow: 450000, outflow: 280000, forecast: 350000, actual: 310000 },
          { month: 'Feb', inflow: 480000, outflow: 320000, forecast: 380000, actual: null },
          { month: 'Mar', inflow: 500000, outflow: 300000, forecast: 420000, actual: null },
          { month: 'Apr', inflow: 520000, outflow: 310000, forecast: 440000, actual: null },
        ],
        upcoming_obligations: [
          { id: 1, date: '2025-01-20', description: 'Payroll', amount: 85000, status: 'scheduled' },
          { id: 2, date: '2025-01-31', description: 'Tax Payment', amount: 45000, status: 'scheduled' },
          { id: 3, date: '2025-02-15', description: 'Supplier Payment', amount: 125000, status: 'scheduled' },
          { id: 4, date: '2025-02-28', description: 'Loan Payment', amount: 50000, status: 'scheduled' },
        ],
      };
      setCashflowData(mockData);
      setLoading(false);
    }
  }, [currentOrganization]);

  const totalCash = Object.values(cashflowData.total_position || {}).reduce((a, b) => a + b, 0);

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="cashflow-container">
      {/* Header */}
      <div className="cashflow-header">
        <div className="header-left">
          <h1><FaWallet /> Cashflow & Treasury</h1>
          <p>Cash position, forecasts, and obligations</p>
        </div>
        <div className="header-controls">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="select-control">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading cashflow data...</div>
      ) : (
        <>
          {/* Cash Position Summary */}
          <div className="cash-position-section">
            <h2>Consolidated Cash Position</h2>
            <div className="position-grid">
              <div className="position-card main">
                <div className="label">Total Cash (All Currencies)</div>
                <div className="amount">{formatCurrency(totalCash, 'USD')}</div>
                <div className="subtext">Across all banks and entities</div>
              </div>

              {Object.entries(cashflowData.total_position || {}).map(([currency, amount]) => (
                <div 
                  key={currency} 
                  className={`position-card ${selectedCurrency === currency ? 'selected' : ''}`}
                  onClick={() => setSelectedCurrency(currency)}
                >
                  <div className="label">{currency}</div>
                  <div className="amount">{formatCurrency(amount, currency)}</div>
                  <div className="percentage">
                    {((amount / totalCash) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cash by Bank */}
          <div className="cash-by-bank-section">
            <h2>Cash by Bank</h2>
            <div className="banks-grid">
              {Object.entries(cashflowData.by_bank || {}).map(([bank, currencies]) => {
                const bankTotal = Object.values(currencies).reduce((a, b) => a + b, 0);
                return (
                  <div key={bank} className="bank-card">
                    <h3>{bank}</h3>
                    <div className="bank-total">{formatCurrency(bankTotal, 'USD')}</div>
                    <div className="currencies">
                      {Object.entries(currencies).map(([currency, amount]) => (
                        amount > 0 && <div key={currency} className="currency-line">
                          <span>{currency}:</span>
                          <span className="amount">{formatCurrency(amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cash by Entity */}
          <div className="cash-by-entity-section">
            <h2>Cash by Entity</h2>
            <div className="entities-grid">
              {Object.entries(cashflowData.by_entity || {}).map(([entity, currencies]) => {
                const entityTotal = Object.values(currencies).reduce((a, b) => a + b, 0);
                return (
                  <div key={entity} className="entity-card">
                    <h3>{entity}</h3>
                    <div className="entity-total">{formatCurrency(entityTotal, 'USD')}</div>
                    <div className="breakdown">
                      {Object.entries(currencies).map(([currency, amount]) => (
                        amount > 0 && <div key={currency} className="breakdown-item">
                          <span className="currency">{currency}</span>
                          <span className="amount">{formatCurrency(amount, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Forecast vs Actual */}
          <div className="forecast-section">
            <h2><FaChartLine /> Monthly Forecast vs Actual</h2>
            <div className="forecast-table">
              <div className="forecast-header">
                <div className="col-month">Month</div>
                <div className="col-inflow">Inflow</div>
                <div className="col-outflow">Outflow</div>
                <div className="col-forecast">Forecast</div>
                <div className="col-actual">Actual</div>
                <div className="col-variance">Variance</div>
              </div>

              {(cashflowData.monthly_forecast || []).map((row, idx) => {
                const variance = row.actual ? ((row.actual - row.forecast) / row.forecast * 100).toFixed(1) : null;
                return (
                  <div key={idx} className="forecast-row">
                    <div className="col-month">{row.month}</div>
                    <div className="col-inflow" style={{color: '#10b981'}}>{formatCurrency(row.inflow)}</div>
                    <div className="col-outflow" style={{color: '#ef4444'}}>{formatCurrency(row.outflow)}</div>
                    <div className="col-forecast">{formatCurrency(row.forecast)}</div>
                    <div className="col-actual">{row.actual ? formatCurrency(row.actual) : 'N/A'}</div>
                    <div className="col-variance">
                      {variance ? <span style={{color: variance > 0 ? '#10b981' : '#ef4444'}}>{variance}%</span> : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Obligations */}
          <div className="obligations-section">
            <h2><FaPercent /> Upcoming Obligations (Next 30 Days)</h2>
            <div className="obligations-list">
              {(cashflowData.upcoming_obligations || []).map(obligation => (
                <div key={obligation.id} className="obligation-item">
                  <div className="obligation-date">{new Date(obligation.date).toLocaleDateString()}</div>
                  <div className="obligation-desc">
                    <div className="description">{obligation.description}</div>
                    <div className="status-badge">{obligation.status}</div>
                  </div>
                  <div className="obligation-amount" style={{color: '#ef4444'}}>
                    -{formatCurrency(obligation.amount)}
                  </div>
                  <div className="obligation-action">
                    <button className="btn-link">Details</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnterpriseCashflow;
