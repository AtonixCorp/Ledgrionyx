import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFinance } from '../../context/FinanceContext';
import { aiFinanceService } from '../../services/aiFinanceService';

const AIInsights = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { aiInsights, loadAIInsights, loading, transactions, mockPortfolio } = useFinance();

  const [cashflowPrediction, setCashflowPrediction] = useState(null);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [fraudDetection, setFraudDetection] = useState(null);
  const [taxEstimate, setTaxEstimate] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load AI insights from backend
        await loadAIInsights();

        // Keep local AI analysis for additional insights
        const currentBalance = 45250;

        setCashflowPrediction(
          aiFinanceService.predictCashflow(transactions, currentBalance)
        );

        setRiskAnalysis(
          aiFinanceService.analyzeInvestmentRisk(mockPortfolio)
        );

        setFraudDetection(
          aiFinanceService.detectFraudPatterns(transactions.slice(0, 15))
        );

        setTaxEstimate(
          aiFinanceService.estimateTaxes(transactions, { country: 'US' })
        );

      } catch (err) {
        console.error('Error loading AI insights:', err);
      } finally {
        setLocalLoading(false);
      }
    };

    loadData();
  }, [loadAIInsights, transactions, mockPortfolio]);

  // Redirect to login if not authenticated
  if (!user) {
    navigate('/login');
    return null;
  }

  if (loading || localLoading) {
    return (
      <div className="ai-insights-page">
        <div className="loading-container">
          <div className="ai-loader">
            <div className="brain-icon"></div>
            <p>AI analyzing your financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-insights-page">
      <div className="page-header">
        <h1>AI Financial Intelligence</h1>
        <p>Advanced AI-powered insights for smarter financial decisions</p>
      </div>

      {/* Backend AI Insights */}
      {aiInsights && aiInsights.length > 0 && (
        <div className="backend-insights-section">
          <h2>Model-Specific AI Insights</h2>
          <div className="backend-insights-grid">
            {aiInsights.slice(0, 6).map((insight) => (
              <div key={insight.id} className={`backend-insight-card priority-${insight.priority}`}>
                <div className="insight-header">
                  <h3>{insight.title}</h3>
                  <span className={`priority-badge priority-${insight.priority}`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-meta">
                  <span className="insight-type">{insight.insight_type}</span>
                  <span className="confidence">
                    {insight.confidence_score ? `${insight.confidence_score}%` : 'N/A'}
                  </span>
                </div>
                {insight.recommendations && (
                  <div className="insight-recommendations">
                    <strong>Recommendations:</strong>
                    <ul>
                      {Object.entries(insight.recommendations).map(([key, value]) => (
                        <li key={key}>{value}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="insights-grid">
        {/* Cashflow Predictor */}
        <div className="insight-card cashflow-card">
          <div className="card-header">
            <h2>Cashflow Predictor</h2>
            <span className="confidence-badge">
              {cashflowPrediction?.confidence}% confident
            </span>
          </div>

          <div className="prediction-result">
            <p className="main-prediction">{cashflowPrediction?.prediction}</p>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Monthly Income</span>
              <span className="metric-value positive">
                ${cashflowPrediction?.avgMonthlyIncome.toFixed(2)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Monthly Expenses</span>
              <span className="metric-value negative">
                ${cashflowPrediction?.avgMonthlyExpenses.toFixed(2)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">Net Cashflow</span>
              <span className={`metric-value ${cashflowPrediction?.netMonthlyCashflow >= 0 ? 'positive' : 'negative'}`}>
                ${cashflowPrediction?.netMonthlyCashflow.toFixed(2)}
              </span>
            </div>
            <div className="metric">
              <span className="metric-label">6-Month Projection</span>
              <span className="metric-value">
                ${cashflowPrediction?.projectedBalance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="recommendation">
            <strong>Recommendation:</strong>
            <p>{cashflowPrediction?.recommendation}</p>
          </div>
        </div>

        {/* Investment Risk Radar */}
        <div className="insight-card risk-card">
          <div className="card-header">
            <h2>Investment Risk Radar</h2>
            <span className={`risk-badge risk-${riskAnalysis?.riskLevel}`}>
              {riskAnalysis?.riskLevel.toUpperCase()}
            </span>
          </div>

          <div className="risk-gauge">
            <div className="gauge-container">
              <div
                className="gauge-fill"
                style={{ width: `${riskAnalysis?.volatilePercentage}%` }}
              ></div>
            </div>
            <div className="gauge-labels">
              <span>Safe</span>
              <span>Risky</span>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Volatile Assets</span>
              <span className="metric-value">{riskAnalysis?.volatilePercentage}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Diversification</span>
              <span className="metric-value">{riskAnalysis?.diversificationScore}/100</span>
            </div>
          </div>

          <div className="rebalance-suggestion">
            <h4>Suggested Portfolio Balance:</h4>
            <div className="balance-bars">
              <div className="balance-bar">
                <span>Stable Assets</span>
                <div className="bar">
                  <div
                    className="bar-fill stable"
                    style={{ width: `${riskAnalysis?.suggestedRebalance.stable}%` }}
                  ></div>
                </div>
                <span>{riskAnalysis?.suggestedRebalance.stable}%</span>
              </div>
              <div className="balance-bar">
                <span>Moderate Risk</span>
                <div className="bar">
                  <div
                    className="bar-fill moderate"
                    style={{ width: `${riskAnalysis?.suggestedRebalance.moderate}%` }}
                  ></div>
                </div>
                <span>{riskAnalysis?.suggestedRebalance.moderate}%</span>
              </div>
              <div className="balance-bar">
                <span>Aggressive</span>
                <div className="bar">
                  <div
                    className="bar-fill aggressive"
                    style={{ width: `${riskAnalysis?.suggestedRebalance.aggressive}%` }}
                  ></div>
                </div>
                <span>{riskAnalysis?.suggestedRebalance.aggressive}%</span>
              </div>
            </div>
          </div>

          <div className="recommendation">
            <strong>Recommendation:</strong>
            <p>{riskAnalysis?.recommendation}</p>
          </div>
        </div>

        {/* Fraud Pattern Detector */}
        <div className="insight-card fraud-card">
          <div className="card-header">
            <h2>Fraud Pattern Detector</h2>
            <span className={`status-badge status-${fraudDetection?.status}`}>
              {fraudDetection?.status.toUpperCase()}
            </span>
          </div>

          <div className="fraud-score-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={fraudDetection?.fraudScore > 60 ? '#e74c3c' : fraudDetection?.fraudScore > 30 ? '#f39c12' : '#27ae60'}
                strokeWidth="8"
                strokeDasharray={`${(fraudDetection?.fraudScore / 100) * 283} 283`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-number">{fraudDetection?.fraudScore}</span>
              <span className="score-label">Risk Score</span>
            </div>
          </div>

          {fraudDetection?.alerts.length > 0 ? (
            <div className="alerts-list">
              <h4>Detected Alerts:</h4>
              {fraudDetection.alerts.map((alert, index) => (
                <div key={index} className={`alert-item severity-${alert.severity}`}>
                  <span className="alert-icon">

                  </span>
                  <div className="alert-content">
                    <strong>{alert.type.replace(/_/g, '').toUpperCase()}</strong>
                    <p>{alert.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-alerts">
              <span className="check-icon"></span>
              <p>No suspicious activity detected</p>
              <small>Last scan: {new Date(fraudDetection?.lastScanTime).toLocaleString()}</small>
            </div>
          )}

          <div className="recommendation">
            <strong>Recommendation:</strong>
            <p>{fraudDetection?.recommendation}</p>
          </div>
        </div>

        {/* Tax Estimator */}
        <div className="insight-card tax-card">
          <div className="card-header">
            <h2>AI Tax Estimator</h2>
            <span className="confidence-badge">{taxEstimate?.confidence}% confident</span>
          </div>

          <div className="tax-summary">
            <div className="tax-total">
              <span className="tax-label">Estimated Tax Liability</span>
              <span className="tax-amount">${taxEstimate?.estimatedTax.toFixed(2)}</span>
              <span className="tax-rate">Effective Rate: {taxEstimate?.effectiveRate}%</span>
            </div>
          </div>

          <div className="tax-breakdown">
            <h4>Tax Breakdown:</h4>
            <div className="breakdown-items">
              <div className="breakdown-item">
                <span>Income Tax</span>
                <span>${taxEstimate?.breakdown.incomeTax.toFixed(2)}</span>
              </div>
              <div className="breakdown-item">
                <span>Capital Gains Tax</span>
                <span>${taxEstimate?.breakdown.capitalGainsTax.toFixed(2)}</span>
              </div>
              <div className="breakdown-item">
                <span>Social Security</span>
                <span>${taxEstimate?.breakdown.socialSecurity.toFixed(2)}</span>
              </div>
              <div className="breakdown-item">
                <span>Medicare</span>
                <span>${taxEstimate?.breakdown.medicare.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="tax-metrics">
            <div className="metric">
              <span className="metric-label">Taxable Income</span>
              <span className="metric-value">${taxEstimate?.taxableIncome.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Deductible Expenses</span>
              <span className="metric-value positive">${taxEstimate?.deductibleExpenses.toFixed(2)}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Capital Gains</span>
              <span className="metric-value">${taxEstimate?.capitalGains.toFixed(2)}</span>
            </div>
          </div>

          <div className="recommendations-list">
            <h4>Tax Optimization Tips:</h4>
            {taxEstimate?.recommendations.map((rec, index) => (
              <p key={index} className="recommendation-item">• {rec}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
