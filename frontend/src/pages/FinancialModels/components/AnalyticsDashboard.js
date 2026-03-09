import React, { useState, useMemo } from 'react';

/**
 * Analytics Dashboard Component
 * Displays KPI dashboards, trend analysis, and peer benchmarking
 * Integrates with Phase 6: Advanced Reporting Engine
 */
const AnalyticsDashboard = ({ analytics, results, isLoading }) => {
  const [dashboardView, setDashboardView] = useState('kpis'); // kpis, trends, benchmarking
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [timeRange, setTimeRange] = useState('12m'); // 3m, 6m, 12m, 24m

  /**
   * Format currency
   */
  const formatCurrency = (value, decimals = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  /**
   * Format percentage
   */
  const formatPercent = (value, decimals = 1) => {
    return `${(value || 0).toFixed(decimals)}%`;
  };

  /**
   * Get KPI status color
   */
  const getStatusColor = status => {
    switch (status) {
      case 'CRITICAL':
        return '#d63031';
      case 'WARNING':
        return '#fdcb6e';
      case 'ON_TARGET':
        return '#00b894';
      case 'NORMAL':
        return '#74b9ff';
      default:
        return '#2d3436';
    }
  };

  /**
   * Get KPI status icon
   */
  const getStatusIcon = status => {
    switch (status) {
      case 'CRITICAL':
        return '🔴';
      case 'WARNING':
        return '🟡';
      case 'ON_TARGET':
        return '🟢';
      case 'NORMAL':
        return '🔵';
      default:
        return '⚪';
    }
  };

  const kpis = useMemo(() => {
    return analytics?.kpis || [];
  }, [analytics]);

  const trends = useMemo(() => {
    return analytics?.trends || [];
  }, [analytics]);

  const benchmarks = useMemo(() => {
    return analytics?.benchmarks || {};
  }, [analytics]);

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <p className="subtitle">KPIs, Trends, and Peer Benchmarking</p>

        {/* View Selector */}
        <div className="view-selector">
          <button
            className={`view-button ${dashboardView === 'kpis' ? 'active' : ''}`}
            onClick={() => setDashboardView('kpis')}
            disabled={isLoading}
          >
            📊 KPIs
          </button>
          <button
            className={`view-button ${dashboardView === 'trends' ? 'active' : ''}`}
            onClick={() => setDashboardView('trends')}
            disabled={isLoading}
          >
            📈 Trends
          </button>
          <button
            className={`view-button ${dashboardView === 'benchmarking' ? 'active' : ''}`}
            onClick={() => setDashboardView('benchmarking')}
            disabled={isLoading}
          >
            ⚖️ Benchmarking
          </button>
        </div>
      </div>

      {/* KPIs View */}
      {dashboardView === 'kpis' && (
        <div className="analytics-section">
          <h3>Key Performance Indicators</h3>

          <div className="kpis-grid">
            {kpis.length > 0 ? (
              kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className={`kpi-card ${kpi.status || 'NORMAL'}`}
                  onClick={() => setSelectedKpi(kpi)}
                  style={{
                    borderLeftColor: getStatusColor(kpi.status),
                  }}
                >
                  <div className="kpi-header">
                    <span className="kpi-status-icon">
                      {getStatusIcon(kpi.status)}
                    </span>
                    <h4>{kpi.name}</h4>
                  </div>

                  <div className="kpi-value">
                    {typeof kpi.value === 'number' && kpi.value > 100
                      ? formatCurrency(kpi.value)
                      : typeof kpi.value === 'number'
                      ? formatPercent(kpi.value)
                      : kpi.value}
                  </div>

                  <div className="kpi-target">
                    Target: {kpi.target || 'N/A'}
                  </div>

                  {kpi.trend && (
                    <div className="kpi-trend">
                      <span className="trend-icon">
                        {kpi.trend > 0 ? '📈' : kpi.trend < 0 ? '📉' : '➡️'}
                      </span>
                      <span className={`trend-value ${kpi.trend > 0 ? 'positive' : kpi.trend < 0 ? 'negative' : ''}`}>
                        {Math.abs(kpi.trend).toFixed(1)}%
                      </span>
                    </div>
                  )}

                  {kpi.benchmark && (
                    <div className="kpi-benchmark">
                      vs. Industry: {formatPercent(kpi.benchmark)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-data-placeholder">
                <p>No KPIs available</p>
              </div>
            )}
          </div>

          {/* KPI Details */}
          {selectedKpi && (
            <div className="kpi-details-modal">
              <div className="modal-overlay" onClick={() => setSelectedKpi(null)}></div>
              <div className="modal-content">
                <button
                  className="modal-close"
                  onClick={() => setSelectedKpi(null)}
                >
                  ✕
                </button>

                <h3>{selectedKpi.name}</h3>

                <div className="detail-sections">
                  <div className="detail-section">
                    <h4>Current Performance</h4>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span>Value</span>
                        <strong>{selectedKpi.value}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Target</span>
                        <strong>{selectedKpi.target}</strong>
                      </div>
                      <div className="detail-row">
                        <span>Status</span>
                        <strong>
                          {getStatusIcon(selectedKpi.status)}{' '}
                          {selectedKpi.status}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Comparison</h4>
                    <div className="detail-content">
                      <div className="detail-row">
                        <span>Industry Average</span>
                        <strong>
                          {selectedKpi.industryAverage || 'N/A'}
                        </strong>
                      </div>
                      <div className="detail-row">
                        <span>Percentile Rank</span>
                        <strong>
                          {selectedKpi.percentileRank || 'N/A'}th percentile
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Insights</h4>
                    <div className="insight-list">
                      {selectedKpi.insights?.map((insight, idx) => (
                        <p key={idx} className="insight-item">
                          {insight}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trends View */}
      {dashboardView === 'trends' && (
        <div className="analytics-section">
          <h3>Trend Analysis</h3>

          <div className="time-range-selector">
            {['3m', '6m', '12m', '24m'].map(range => (
              <button
                key={range}
                className={`range-button ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="trends-grid">
            {trends.length > 0 ? (
              trends.map((trend, idx) => (
                <div key={idx} className="trend-card">
                  <h4>{trend.name}</h4>

                  <div className="trend-chart">
                    <div className="chart-placeholder">
                      {/* Simplified chart visualization */}
                      <div className="spark-line">
                        {trend.dataPoints?.map((point, i) => (
                          <div
                            key={i}
                            className="spark-bar"
                            style={{
                              height: `${
                                (point / Math.max(...(trend.dataPoints || []))) *
                                100
                              }%`,
                            }}
                            title={point}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="trend-stats">
                    <div className="stat">
                      <span>Current</span>
                      <strong>{trend.current}</strong>
                    </div>
                    <div className="stat">
                      <span>Previous</span>
                      <strong>{trend.previous}</strong>
                    </div>
                    <div className="stat">
                      <span>Change</span>
                      <strong className={trend.change > 0 ? 'positive' : 'negative'}>
                        {trend.change > 0 ? '+' : ''}
                        {formatPercent(trend.change)}
                      </strong>
                    </div>
                  </div>

                  {trend.forecast && (
                    <div className="trend-forecast">
                      <p className="forecast-label">Forecast</p>
                      <p className="forecast-value">{trend.forecast}</p>
                      {trend.confidenceInterval && (
                        <p className="confidence">
                          CI: {trend.confidenceInterval}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-data-placeholder">
                <p>No trend data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Benchmarking View */}
      {dashboardView === 'benchmarking' && (
        <div className="analytics-section">
          <h3>Peer Benchmarking</h3>

          <div className="benchmarking-container">
            {benchmarks && Object.keys(benchmarks).length > 0 ? (
              Object.entries(benchmarks).map(([metric, data]) => (
                <div key={metric} className="benchmark-card">
                  <h4>{metric}</h4>

                  <div className="benchmark-visualization">
                    <div className="benchmark-bar-container">
                      <div className="benchmark-company">
                        <span className="company-label">Your Company</span>
                        <div className="bar-wrapper">
                          <div
                            className="bar your-company"
                            style={{
                              width: `${
                                (data.yourValue /
                                  Math.max(data.yourValue, data.industryAverage)) *
                                100
                              }%`,
                            }}
                          >
                            <span className="bar-value">
                              {typeof data.yourValue === 'number'
                                ? data.yourValue > 100
                                  ? formatCurrency(data.yourValue)
                                  : formatPercent(data.yourValue)
                                : data.yourValue}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="benchmark-industry">
                        <span className="company-label">Industry Average</span>
                        <div className="bar-wrapper">
                          <div
                            className="bar industry-average"
                            style={{
                              width: `${
                                (data.industryAverage /
                                  Math.max(
                                    data.yourValue,
                                    data.industryAverage
                                  )) *
                                100
                              }%`,
                            }}
                          >
                            <span className="bar-value">
                              {typeof data.industryAverage === 'number'
                                ? data.industryAverage > 100
                                  ? formatCurrency(data.industryAverage)
                                  : formatPercent(data.industryAverage)
                                : data.industryAverage}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="benchmark-insights">
                    <div className="insight">
                      <strong>Position:</strong>{' '}
                      {data.position || 'At Market'}
                    </div>
                    <div className="insight">
                      <strong>Percentile:</strong>{' '}
                      {data.percentile || 'N/A'}
                    </div>
                    {data.recommendation && (
                      <div className="insight recommendation">
                        <strong>Recommendation:</strong>{' '}
                        {data.recommendation}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-placeholder">
                <p>No benchmark data available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary Metrics at Bottom */}
      <div className="analytics-summary">
        <h3>📊 Summary Metrics</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Total KPIs</span>
            <span className="summary-value">{kpis.length}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">On Target</span>
            <span className="summary-value">
              {kpis.filter(k => k.status === 'ON_TARGET').length}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Warnings</span>
            <span className="summary-value warning">
              {kpis.filter(k => k.status === 'WARNING').length}
            </span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Critical</span>
            <span className="summary-value critical">
              {kpis.filter(k => k.status === 'CRITICAL').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
