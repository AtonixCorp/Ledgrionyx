import React, { useState, useMemo } from 'react';

/**
 * Results Dashboard Component
 * Displays financial model calculation results
 * Integrates with Phase 1: Calculation Foundation
 */
const ResultsDashboard = ({
  results,
  inputData,
  onScenarioAnalysis,
  onGenerateReport,
  onLoadAnalytics,
  onExport,
  isLoading,
}) => {
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison
  const [expandedSection, setExpandedSection] = useState(null);

  // Calculate key metrics from results
  const metrics = useMemo(() => {
    if (!results) return {};

    return {
      enterpriseValue: results.enterpriseValue || 0,
      equityValue: results.equityValue || 0,
      pricePerShare: results.pricePerShare || 0,
      impliedValuation: results.impliedValuation || 0,
      irr: results.irr || 0,
      moic: results.moic || 0,
      roic: results.roic || 0,
      roi: results.roi || 0,
      fcf: results.freeCashFlow || 0,
      dcf: results.dcfValue || 0,
    };
  }, [results]);

  /**
   * Format currency values
   */
  const formatCurrency = (value, decimals = 0) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: inputData?.reportingCurrency || 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return formatter.format(value);
  };

  /**
   * Format percentage values
   */
  const formatPercent = (value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
  };

  /**
   * Get color based on metric performance
   */
  const getMetricColor = (value, type = 'return') => {
    if (type === 'return') {
      if (value > 30) return '#00b894'; // Green - Excellent
      if (value > 15) return '#74b9ff'; // Blue - Good
      if (value > 0) return '#fdcb6e'; // Yellow - Fair
      return '#d63031'; // Red - Poor
    }
    return '#2d3436'; // Default
  };

  return (
    <div className="results-dashboard">
      <div className="results-header">
        <h2>Financial Model Results</h2>
        <p className="results-subtitle">
          {inputData?.companyName} | {inputData?.modelType?.toUpperCase()}
        </p>

        <div className="results-controls">
          <button
            className={`view-toggle ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
            disabled={isLoading}
          >
            📋 Overview
          </button>
          <button
            className={`view-toggle ${viewMode === 'detailed' ? 'active' : ''}`}
            onClick={() => setViewMode('detailed')}
            disabled={isLoading}
          >
            📊 Detailed
          </button>
          <button
            className={`view-toggle ${viewMode === 'comparison' ? 'active' : ''}`}
            onClick={() => setViewMode('comparison')}
            disabled={isLoading}
          >
            ⚖️ Comparison
          </button>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="results-overview">
          {/* Key Valuation Metrics */}
          <section className="metrics-grid">
            <h3>💎 Valuation Summary</h3>

            <div className="metric-card primary">
              <div className="metric-label">Enterprise Value</div>
              <div className="metric-value">
                {formatCurrency(metrics.enterpriseValue)}
              </div>
              <div className="metric-change">+12.5% vs. Last Year</div>
            </div>

            <div className="metric-card primary">
              <div className="metric-label">Equity Value</div>
              <div className="metric-value">
                {formatCurrency(metrics.equityValue)}
              </div>
              <div className="metric-change">vs. Market Cap</div>
            </div>

            <div className="metric-card secondary">
              <div className="metric-label">Price Per Share</div>
              <div className="metric-value">
                ${(metrics.pricePerShare || 0).toFixed(2)}
              </div>
              <div className="metric-change">Implied</div>
            </div>

            <div className="metric-card secondary">
              <div className="metric-label">DCF Valuation</div>
              <div className="metric-value">
                {formatCurrency(metrics.dcf)}
              </div>
              <div className="metric-change">Base Case</div>
            </div>
          </section>

          {/* Return Metrics */}
          <section className="metrics-grid">
            <h3>📈 Return Metrics</h3>

            <div className="metric-card">
              <div className="metric-label">IRR (Internal Rate of Return)</div>
              <div
                className="metric-value"
                style={{ color: getMetricColor(metrics.irr) }}
              >
                {formatPercent(metrics.irr)}
              </div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min((metrics.irr || 0) / 50 * 100, 100)}%`,
                    backgroundColor: getMetricColor(metrics.irr),
                  }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">MOIC (Multiple on Invested Capital)</div>
              <div
                className="metric-value"
                style={{ color: getMetricColor(metrics.moic * 100) }}
              >
                {(metrics.moic || 0).toFixed(2)}x
              </div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min((metrics.moic || 0) / 5 * 100, 100)}%`,
                    backgroundColor: getMetricColor(metrics.moic * 100),
                  }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">ROIC (Return on Invested Capital)</div>
              <div
                className="metric-value"
                style={{ color: getMetricColor(metrics.roic) }}
              >
                {formatPercent(metrics.roic)}
              </div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min((metrics.roic || 0) / 30 * 100, 100)}%`,
                    backgroundColor: getMetricColor(metrics.roic),
                  }}
                ></div>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">ROI (Return on Investment)</div>
              <div
                className="metric-value"
                style={{ color: getMetricColor(metrics.roi) }}
              >
                {formatPercent(metrics.roi)}
              </div>
              <div className="metric-bar">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${Math.min((metrics.roi || 0) / 30 * 100, 100)}%`,
                    backgroundColor: getMetricColor(metrics.roi),
                  }}
                ></div>
              </div>
            </div>
          </section>

          {/* Cash Flow & Key Drivers */}
          <section className="results-section">
            <h3>💵 Key Drivers</h3>

            <div className="drivers-grid">
              <div className="driver-card">
                <span className="driver-label">Free Cash Flow</span>
                <span className="driver-value">
                  {formatCurrency(metrics.fcf)}
                </span>
              </div>

              <div className="driver-card">
                <span className="driver-label">Revenue (TTM)</span>
                <span className="driver-value">
                  {formatCurrency(inputData?.revenue)}
                </span>
              </div>

              <div className="driver-card">
                <span className="driver-label">Operating Margin</span>
                <span className="driver-value">
                  {formatPercent(inputData?.operatingMargin)}
                </span>
              </div>

              <div className="driver-card">
                <span className="driver-label">WACC (Discount Rate)</span>
                <span className="driver-value">
                  {formatPercent(inputData?.discountRate)}
                </span>
              </div>
            </div>
          </section>

          {/* Projection Summary */}
          <section className="results-section">
            <h3>📅 Projection Summary</h3>

            <div className="collapsible-section">
              <button
                className="collapsible-button"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === 'projections' ? null : 'projections'
                  )
                }
              >
                <span>{expandedSection === 'projections' ? '▼' : '▶'}</span>
                Year-by-Year Projections
              </button>

              {expandedSection === 'projections' && results.projections && (
                <div className="projections-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Revenue</th>
                        <th>EBIT</th>
                        <th>NOPAT</th>
                        <th>FCF</th>
                        <th>PV of FCF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.projections.map((proj, idx) => (
                        <tr key={idx}>
                          <td className="year-col">{proj.year || idx + 1}</td>
                          <td>{formatCurrency(proj.revenue)}</td>
                          <td>{formatCurrency(proj.ebit)}</td>
                          <td>{formatCurrency(proj.nopat)}</td>
                          <td>{formatCurrency(proj.fcf)}</td>
                          <td className="pv-col">{formatCurrency(proj.pvFcf)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <div className="results-detailed">
          <div className="detail-sections">
            {/* Income Statement Metrics */}
            <div className="detail-section">
              <h3>📊 Income Statement</h3>
              <div className="detail-metrics">
                <div className="detail-row">
                  <span>Revenue</span>
                  <span>{formatCurrency(results.revenue)}</span>
                </div>
                <div className="detail-row">
                  <span>Operating Income</span>
                  <span>{formatCurrency(results.operatingIncome)}</span>
                </div>
                <div className="detail-row">
                  <span>Tax</span>
                  <span>{formatCurrency(results.taxes)}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Net Income</span>
                  <span>{formatCurrency(results.netIncome)}</span>
                </div>
              </div>
            </div>

            {/* Balance Sheet Metrics */}
            <div className="detail-section">
              <h3>🏦 Balance Sheet</h3>
              <div className="detail-metrics">
                <div className="detail-row">
                  <span>Total Assets</span>
                  <span>{formatCurrency(results.totalAssets)}</span>
                </div>
                <div className="detail-row">
                  <span>Total Liabilities</span>
                  <span>{formatCurrency(results.totalLiabilities)}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Shareholders Equity</span>
                  <span>{formatCurrency(results.equity)}</span>
                </div>
              </div>
            </div>

            {/* Cash Flow Metrics */}
            <div className="detail-section">
              <h3>💰 Cash Flow</h3>
              <div className="detail-metrics">
                <div className="detail-row">
                  <span>Operating Cash Flow</span>
                  <span>{formatCurrency(results.operatingCashFlow)}</span>
                </div>
                <div className="detail-row">
                  <span>Capital Expenditure</span>
                  <span>{formatCurrency(results.capex)}</span>
                </div>
                <div className="detail-row highlight">
                  <span>Free Cash Flow</span>
                  <span>{formatCurrency(results.freeCashFlow)}</span>
                </div>
              </div>
            </div>

            {/* Valuation Multiples */}
            <div className="detail-section">
              <h3>📈 Valuation Multiples</h3>
              <div className="detail-metrics">
                <div className="detail-row">
                  <span>EV/Revenue</span>
                  <span>{(results.evRevenue || 0).toFixed(2)}x</span>
                </div>
                <div className="detail-row">
                  <span>EV/EBITDA</span>
                  <span>{(results.evEbitda || 0).toFixed(2)}x</span>
                </div>
                <div className="detail-row">
                  <span>P/E Ratio</span>
                  <span>{(results.peRatio || 0).toFixed(2)}x</span>
                </div>
                <div className="detail-row">
                  <span>P/B Ratio</span>
                  <span>{(results.pbRatio || 0).toFixed(2)}x</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Mode */}
      {viewMode === 'comparison' && (
        <div className="results-comparison">
          <h3>📊 Scenario Comparison</h3>
          <p className="comparison-note">
            Run scenario analysis to compare different assumptions and outcomes
          </p>

          <div className="comparison-placeholder">
            <div className="placeholder-icon">🎯</div>
            <div className="placeholder-text">No scenarios yet</div>
            <button
              className="btn-primary"
              onClick={onScenarioAnalysis}
              disabled={isLoading}
            >
              Generate Scenarios
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="results-actions">
        <button
          className="btn-primary"
          onClick={onScenarioAnalysis}
          disabled={isLoading}
        >
          🎯 Scenario Analysis
        </button>

        <button
          className="btn-secondary"
          onClick={() => onGenerateReport('executive')}
          disabled={isLoading}
        >
          📄 Generate Report
        </button>

        <button
          className="btn-secondary"
          onClick={onLoadAnalytics}
          disabled={isLoading}
        >
          📈 View Analytics
        </button>

        <div className="dropdown-actions">
          <button className="btn-tertiary dropdown-toggle" disabled={isLoading}>
            ⬇ Export
          </button>
          <div className="dropdown-menu">
            <button onClick={() => onExport('json')} disabled={isLoading}>
              JSON
            </button>
            <button onClick={() => onExport('csv')} disabled={isLoading}>
              CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
