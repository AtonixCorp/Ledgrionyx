import React, { useState, useMemo } from 'react';

/**
 * Scenario Dashboard Component
 * Displays scenario analysis results (best/base/worst case)
 * Integrates with Phase 4: Scenario Engine
 */
const ScenarioDashboard = ({
  scenarios,
  baselineResults,
  onGenerateReport,
  isLoading,
}) => {
  const [selectedScenario, setSelectedScenario] = useState('base');
  const [chartType, setChartType] = useState('valuation'); // valuation, returns, sensitivity

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

  // Get scenario data
  const scenarioData = useMemo(() => {
    if (!scenarios || !scenarios.scenarios) return {};
    return scenarios.scenarios;
  }, [scenarios]);

  // Calculate variance from baseline
  const calculateVariance = (scenarioValue, baselineValue) => {
    if (baselineValue === 0) return 0;
    return ((scenarioValue - baselineValue) / Math.abs(baselineValue)) * 100;
  };

  return (
    <div className="scenario-dashboard">
      <div className="scenario-header">
        <h2>Scenario Analysis</h2>
        <p className="subtitle">Best Case | Base Case | Worst Case</p>

        {/* Chart Type Selector */}
        <div className="chart-controls">
          <button
            className={`chart-type-button ${chartType === 'valuation' ? 'active' : ''}`}
            onClick={() => setChartType('valuation')}
          >Valuations
          </button>
          <button
            className={`chart-type-button ${chartType === 'returns' ? 'active' : ''}`}
            onClick={() => setChartType('returns')}
          >Returns
          </button>
          <button
            className={`chart-type-button ${chartType === 'sensitivity' ? 'active' : ''}`}
            onClick={() => setChartType('sensitivity')}
          >Sensitivity
          </button>
        </div>
      </div>

      {/* Scenario Comparison Cards */}
      <div className="scenario-cards">
        {['worst', 'base', 'best'].map(scenario => (
          <div
            key={scenario}
            className={`scenario-card ${selectedScenario === scenario ? 'active' : ''} ${scenario}-case`}
            onClick={() => setSelectedScenario(scenario)}
          >
            <div className="scenario-title">
              {scenario === 'worst' && 'Worst Case'}
              {scenario === 'base' && 'Base Case'}
              {scenario === 'best' && 'Best Case'}
            </div>

            {scenarioData[scenario] && (
              <>
                <div className="scenario-metric">
                  <span className="metric-label">Enterprise Value</span>
                  <span className="metric-value">
                    {formatCurrency(scenarioData[scenario].enterpriseValue)}
                  </span>
                </div>

                <div className="scenario-metric">
                  <span className="metric-label">IRR</span>
                  <span className={`metric-value ${scenario}-case-text`}>
                    {formatPercent(scenarioData[scenario].irr)}
                  </span>
                </div>

                <div className="scenario-metric">
                  <span className="metric-label">vs. Baseline</span>
                  <span className={`metric-change ${scenario}-case-text`}>
                    {calculateVariance(
                      scenarioData[scenario].enterpriseValue,
                      baselineResults?.enterpriseValue
                    ) > 0 ? '+' : ''}
                    {formatPercent(
                      calculateVariance(
                        scenarioData[scenario].enterpriseValue,
                        baselineResults?.enterpriseValue
                      )
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Chart Visualization */}
      {chartType === 'valuation' && (
        <div className="scenario-chart">
          <h3>Valuation Waterfall</h3>
          <div className="waterfall-chart">
            <div className="waterfall-bar">
              <div className="bar worst">
                <div className="bar-label">
                  {formatCurrency(scenarioData.worst?.enterpriseValue)}
                </div>
              </div>
              <div className="bar base highlight">
                <div className="bar-label">
                  {formatCurrency(scenarioData.base?.enterpriseValue)}
                </div>
              </div>
              <div className="bar best">
                <div className="bar-label">
                  {formatCurrency(scenarioData.best?.enterpriseValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="scenario-details">
            {['worst', 'base', 'best'].map(scenario => (
              <div key={scenario} className="detail-card">
                <h4>
                  {scenario === 'worst' && 'Worst Case'}
                  {scenario === 'base' && 'Base Case'}
                  {scenario === 'best' && 'Best Case'}
                </h4>

                <div className="detail-metrics">
                  <div className="detail-row">
                    <span>Enterprise Value</span>
                    <strong>{formatCurrency(scenarioData[scenario]?.enterpriseValue)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Equity Value</span>
                    <strong>{formatCurrency(scenarioData[scenario]?.equityValue)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>IRR</span>
                    <strong>{formatPercent(scenarioData[scenario]?.irr)}</strong>
                  </div>
                  <div className="detail-row">
                    <span>MOIC</span>
                    <strong>{(scenarioData[scenario]?.moic || 0).toFixed(2)}x</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {chartType === 'returns' && (
        <div className="scenario-chart">
          <h3>Return Metrics Comparison</h3>

          <div className="returns-comparison">
            <div className="comparison-metric">
              <span className="metric-label">IRR Comparison</span>
              <div className="metric-bars">
                {['worst', 'base', 'best'].map(scenario => (
                  <div key={scenario} className="bar-group">
                    <div
                      className={`bar ${scenario}`}
                      style={{
                        height: `${Math.max(
                          (scenarioData[scenario]?.irr || 0) / 50 * 100,
                          10
                        )}%`,
                      }}
                    ></div>
                    <div className="bar-value">
                      {formatPercent(scenarioData[scenario]?.irr)}
                    </div>
                    <div className="bar-label">
                      {scenario === 'worst' && 'Worst'}
                      {scenario === 'base' && 'Base'}
                      {scenario === 'best' && 'Best'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="comparison-metric">
              <span className="metric-label">MOIC Comparison</span>
              <div className="metric-bars">
                {['worst', 'base', 'best'].map(scenario => (
                  <div key={scenario} className="bar-group">
                    <div
                      className={`bar ${scenario}`}
                      style={{
                        height: `${Math.max(
                          (scenarioData[scenario]?.moic || 0) / 5 * 100,
                          10
                        )}%`,
                      }}
                    ></div>
                    <div className="bar-value">
                      {(scenarioData[scenario]?.moic || 0).toFixed(2)}x
                    </div>
                    <div className="bar-label">
                      {scenario === 'worst' && 'Worst'}
                      {scenario === 'base' && 'Base'}
                      {scenario === 'best' && 'Best'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {chartType === 'sensitivity' && (
        <div className="scenario-chart">
          <h3>Sensitivity Analysis</h3>

          <div className="sensitivity-table">
            <p className="sensitivity-note">Shows how valuation changes with key assumptions
            </p>

            {scenarios.sensitivity && scenarios.sensitivity.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Variable</th>
                    <th>-20%</th>
                    <th>-10%</th>
                    <th>Base</th>
                    <th>+10%</th>
                    <th>+20%</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.sensitivity.map((item, idx) => (
                    <tr key={idx}>
                      <td className="var-name">{item.variable}</td>
                      <td className="var-value">
                        {formatCurrency(item.values?.[0])}
                      </td>
                      <td className="var-value">
                        {formatCurrency(item.values?.[1])}
                      </td>
                      <td className="var-value highlight">
                        {formatCurrency(item.baseValue)}
                      </td>
                      <td className="var-value">
                        {formatCurrency(item.values?.[3])}
                      </td>
                      <td className="var-value">
                        {formatCurrency(item.values?.[4])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-sensitivity">
                <p>Sensitivity analysis data not available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Key Insights */}
      <div className="scenario-insights">
        <h3>Key Insights</h3>

        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon"></span>
            <div className="insight-text">
              <strong>Valuation Range</strong>
              <p>
                {formatCurrency(scenarioData.worst?.enterpriseValue)} to{''}
                {formatCurrency(scenarioData.best?.enterpriseValue)}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <span className="insight-icon"></span>
            <div className="insight-text">
              <strong>Upside Potential</strong>
              <p>
                {formatPercent(
                  calculateVariance(
                    scenarioData.best?.enterpriseValue,
                    scenarioData.base?.enterpriseValue
                  )
                )}{''}
                upside vs. Base
              </p>
            </div>
          </div>

          <div className="insight-card">
            <span className="insight-icon"></span>
            <div className="insight-text">
              <strong>Downside Risk</strong>
              <p>
                {formatPercent(
                  calculateVariance(
                    scenarioData.worst?.enterpriseValue,
                    scenarioData.base?.enterpriseValue
                  )
                )}{''}
                downside vs. Base
              </p>
            </div>
          </div>

          <div className="insight-card">
            <span className="insight-icon"></span>
            <div className="insight-text">
              <strong>Total Range</strong>
              <p>
                {formatPercent(
                  calculateVariance(
                    scenarioData.best?.enterpriseValue,
                    scenarioData.worst?.enterpriseValue
                  )
                )}{''}
                spread
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="scenario-actions">
        <button
          className="btn-primary"
          onClick={() => onGenerateReport('scenario')}
          disabled={isLoading}
        >Generate Scenario Report
        </button>
      </div>
    </div>
  );
};

export default ScenarioDashboard;
