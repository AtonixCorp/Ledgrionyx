import React, { useState } from 'react';
import '../FinancialModels.css';

/**
 * Report Viewer Component
 * Displays and manages financial reports
 * Integrates with Advanced Reporting Engine
 */
const ReportViewer = ({ report, onExport, isLoading }) => {
  const [selectedSection, setSelectedSection] = useState('executive');
  const [fontSize, setFontSize] = useState('medium');

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

  const sections = [
    { id: 'executive', label: '📋 Executive Summary', icon: '📋' },
    { id: 'valuation', label: '💎 Valuation Analysis', icon: '💎' },
    { id: 'financial', label: '📊 Financial Analysis', icon: '📊' },
    { id: 'scenarios', label: '🎯 Scenario Analysis', icon: '🎯' },
    { id: 'recommendations', label: '💡 Recommendations', icon: '💡' },
  ];

  return (
    <div className="report-viewer">
      <div className="report-header">
        <div className="report-title">
          <h1>Financial Analysis Report</h1>
          <p className="report-meta">
            {report?.generatedDate
              ? new Date(report.generatedDate).toLocaleDateString()
              : 'Report'}
            | Version {report?.version || '1.0'}
          </p>
        </div>

        <div className="report-controls">
          <div className="font-size-control">
            <button
              className={`size-btn ${fontSize === 'small' ? 'active' : ''}`}
              onClick={() => setFontSize('small')}
              title="Reduce text size"
            >
              A
            </button>
            <button
              className={`size-btn ${fontSize === 'medium' ? 'active' : ''}`}
              onClick={() => setFontSize('medium')}
              title="Normal text size"
            >
              A
            </button>
            <button
              className={`size-btn ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => setFontSize('large')}
              title="Increase text size"
            >
              A
            </button>
          </div>

          <div className="export-controls">
            <button
              className="btn-secondary"
              onClick={() => onExport('json')}
              disabled={isLoading}
              title="Export as JSON"
            >
              💾 JSON
            </button>
            <button
              className="btn-secondary"
              onClick={() => onExport('csv')}
              disabled={isLoading}
              title="Export as CSV"
            >
              📊 CSV
            </button>
            <button
              className="btn-secondary"
              onClick={() => window.print()}
              disabled={isLoading}
              title="Print report"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="report-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`section-tab ${selectedSection === section.id ? 'active' : ''}`}
            onClick={() => setSelectedSection(section.id)}
            disabled={isLoading}
          >
            <span className="tab-icon">{section.icon}</span>
            <span className="tab-label">{section.label}</span>
          </button>
        ))}
      </nav>

      {/* Report Content */}
      <div className={`report-content font-${fontSize}`}>
        {/* Executive Summary */}
        {selectedSection === 'executive' && (
          <section className="report-section">
            <h2>Executive Summary</h2>

            <div className="summary-box">
              <h3>📊 Key Findings</h3>
              <div className="findings-list">
                <div className="finding-item">
                  <span className="finding-icon">✓</span>
                  <div className="finding-text">
                    <strong>Enterprise Valuation:</strong>{' '}
                    {formatCurrency(report?.summary?.enterpriseValue)}
                  </div>
                </div>
                <div className="finding-item">
                  <span className="finding-icon">✓</span>
                  <div className="finding-text">
                    <strong>Expected IRR:</strong>{' '}
                    {formatPercent(report?.summary?.expectedIrr)}
                  </div>
                </div>
                <div className="finding-item">
                  <span className="finding-icon">✓</span>
                  <div className="finding-text">
                    <strong>Investment Multiple:</strong>{' '}
                    {(report?.summary?.moic || 0).toFixed(2)}x
                  </div>
                </div>
              </div>
            </div>

            <div className="summary-box">
              <h3>💡 Highlights</h3>
              <ul className="highlights-list">
                {report?.summary?.highlights?.map((highlight, idx) => (
                  <li key={idx}>{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="summary-box">
              <h3>⚠️ Key Risks</h3>
              <ul className="risks-list">
                {report?.summary?.risks?.map((risk, idx) => (
                  <li key={idx}>{risk}</li>
                ))}
              </ul>
            </div>

            <div className="summary-box">
              <h3>✅ Recommendations</h3>
              <ul className="recommendations-list">
                {report?.summary?.recommendations?.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Valuation Analysis */}
        {selectedSection === 'valuation' && (
          <section className="report-section">
            <h2>Valuation Analysis</h2>

            <div className="valuation-grid">
              <div className="valuation-method">
                <h3>DCF Analysis</h3>
                <div className="method-details">
                  <div className="detail-row">
                    <span>PV of Projected FCF</span>
                    <strong>
                      {formatCurrency(report?.valuation?.dcf?.pvProjectedFcf)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Terminal Value</span>
                    <strong>
                      {formatCurrency(report?.valuation?.dcf?.terminalValue)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Less: Net Debt</span>
                    <strong>
                      {formatCurrency(report?.valuation?.dcf?.netDebt)}
                    </strong>
                  </div>
                  <div className="detail-row highlight">
                    <span>Enterprise Value</span>
                    <strong>
                      {formatCurrency(report?.valuation?.dcf?.enterpriseValue)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="valuation-method">
                <h3>Comparable Companies</h3>
                <div className="method-details">
                  <div className="detail-row">
                    <span>Median EV/Revenue Multiple</span>
                    <strong>{(report?.valuation?.comps?.medianEvRevenue || 0).toFixed(2)}x</strong>
                  </div>
                  <div className="detail-row">
                    <span>Implied Valuation</span>
                    <strong>
                      {formatCurrency(report?.valuation?.comps?.impliedValue)}
                    </strong>
                  </div>
                  <div className="detail-row">
                    <span>Range (Min-Max)</span>
                    <strong>
                      {formatCurrency(report?.valuation?.comps?.minValue)} -{' '}
                      {formatCurrency(report?.valuation?.comps?.maxValue)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="valuation-summary-box">
              <h3>Valuation Summary</h3>
              <table className="valuation-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Valuation</th>
                    <th>Weight</th>
                    <th>Weighted Value</th>
                  </tr>
                </thead>
                <tbody>
                  {report?.valuation?.methods?.map((method, idx) => (
                    <tr key={idx}>
                      <td>{method.name}</td>
                      <td>{formatCurrency(method.value)}</td>
                      <td>{formatPercent(method.weight)}</td>
                      <td className="highlight">
                        {formatCurrency(method.weightedValue)}
                      </td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td colSpan="3" className="highlight">
                      Blended Valuation
                    </td>
                    <td className="highlight">
                      {formatCurrency(report?.valuation?.blendedValue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Financial Analysis */}
        {selectedSection === 'financial' && (
          <section className="report-section">
            <h2>Financial Analysis</h2>

            <div className="financial-statements">
              <div className="statement">
                <h3>Income Statement (TTM)</h3>
                <table className="statement-table">
                  <tbody>
                    <tr>
                      <td>Revenue</td>
                      <td>
                        {formatCurrency(report?.financial?.revenue)}
                      </td>
                    </tr>
                    <tr>
                      <td>Operating Income</td>
                      <td>
                        {formatCurrency(report?.financial?.operatingIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td>Operating Margin</td>
                      <td>
                        {formatPercent(report?.financial?.operatingMargin)}
                      </td>
                    </tr>
                    <tr>
                      <td>Net Income</td>
                      <td>
                        {formatCurrency(report?.financial?.netIncome)}
                      </td>
                    </tr>
                    <tr>
                      <td>Net Margin</td>
                      <td>
                        {formatPercent(report?.financial?.netMargin)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="statement">
                <h3>Key Metrics</h3>
                <table className="statement-table">
                  <tbody>
                    <tr>
                      <td>EBITDA</td>
                      <td>
                        {formatCurrency(report?.financial?.ebitda)}
                      </td>
                    </tr>
                    <tr>
                      <td>EBITDA Margin</td>
                      <td>
                        {formatPercent(report?.financial?.ebitdaMargin)}
                      </td>
                    </tr>
                    <tr>
                      <td>Free Cash Flow</td>
                      <td>
                        {formatCurrency(report?.financial?.freeCashFlow)}
                      </td>
                    </tr>
                    <tr>
                      <td>ROE</td>
                      <td>
                        {formatPercent(report?.financial?.roe)}
                      </td>
                    </tr>
                    <tr>
                      <td>ROIC</td>
                      <td>
                        {formatPercent(report?.financial?.roic)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Scenario Analysis */}
        {selectedSection === 'scenarios' && (
          <section className="report-section">
            <h2>Scenario Analysis</h2>

            <div className="scenarios-grid">
              {['worst', 'base', 'best'].map(scenario => (
                <div key={scenario} className="scenario-box">
                  <h3>
                    {scenario === 'worst' && '📉 Downside Case'}
                    {scenario === 'base' && '📊 Base Case'}
                    {scenario === 'best' && '📈 Upside Case'}
                  </h3>
                  <div className="scenario-metrics">
                    <div className="metric">
                      <span>Valuation</span>
                      <strong>
                        {formatCurrency(
                          report?.scenarios?.[scenario]?.valuation
                        )}
                      </strong>
                    </div>
                    <div className="metric">
                      <span>IRR</span>
                      <strong>
                        {formatPercent(report?.scenarios?.[scenario]?.irr)}
                      </strong>
                    </div>
                    <div className="metric">
                      <span>MOIC</span>
                      <strong>
                        {(report?.scenarios?.[scenario]?.moic || 0).toFixed(2)}x
                      </strong>
                    </div>
                    <div className="metric">
                      <span>Probability</span>
                      <strong>
                        {formatPercent(
                          report?.scenarios?.[scenario]?.probability
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="scenario-summary">
              <h3>Expected Value</h3>
              <div className="expected-value">
                <strong>
                  {formatCurrency(report?.scenarios?.expectedValue)}
                </strong>
              </div>
            </div>
          </section>
        )}

        {/* Recommendations */}
        {selectedSection === 'recommendations' && (
          <section className="report-section">
            <h2>Recommendations & Next Steps</h2>

            <div className="recommendations-section">
              <div className="recommendation-box">
                <h3>🎯 Action Items</h3>
                <ol className="action-items">
                  {report?.recommendations?.actions?.map((action, idx) => (
                    <li key={idx}>{action}</li>
                  ))}
                </ol>
              </div>

              <div className="recommendation-box">
                <h3>⚡ Critical Issues</h3>
                <ul className="critical-issues">
                  {report?.recommendations?.issues?.map((issue, idx) => (
                    <li key={idx}>
                      <span className="issue-priority">HIGH</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="recommendation-box">
                <h3>📈 Growth Opportunities</h3>
                <ul className="opportunities">
                  {report?.recommendations?.opportunities?.map((opp, idx) => (
                    <li key={idx}>{opp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Report Footer */}
      <footer className="report-footer">
        <div className="footer-content">
          <p>
            <strong>Disclaimer:</strong> This report is for informational purposes only and
            should not be considered as investment advice. Please consult with financial
            advisors before making investment decisions.
          </p>
          <p className="footer-timestamp">
            Generated: {report?.generatedDate
              ? new Date(report.generatedDate).toLocaleString()
              : 'N/A'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReportViewer;
