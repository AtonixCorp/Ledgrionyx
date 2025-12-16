import React, { useEffect, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import { FaExclamationTriangle, FaChartBar, FaMap, FaBell } from 'react-icons/fa';
import './EnterpriseRiskExposure.css';

const EnterpriseRiskExposure = () => {
  const { currentOrganization } = useEnterprise();
  const [riskData, setRiskData] = useState({});
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      setLoading(true);
      // TODO: Call API endpoint /api/tax-exposures/by_country/?organization_id=currentOrganization.id
      const mockData = {
        concentration_risk: {
          top3_percentage: 68,
          countries_with_exposure: 8,
          largest_exposures: [
            { country: 'US', percentage: 32, amount: 450000 },
            { country: 'UK', percentage: 22, amount: 310000 },
            { country: 'CA', percentage: 14, amount: 195000 },
          ]
        },
        country_risks: [
          { country: 'US', exposure: 450000, risk_score: 15, status: 'low', alerts: 0 },
          { country: 'UK', exposure: 310000, risk_score: 22, status: 'medium', alerts: 1 },
          { country: 'CA', exposure: 195000, risk_score: 18, status: 'low', alerts: 0 },
          { country: 'AU', exposure: 125000, risk_score: 35, status: 'high', alerts: 2 },
          { country: 'DE', exposure: 95000, risk_score: 28, status: 'medium', alerts: 1 },
          { country: 'FR', exposure: 75000, risk_score: 25, status: 'medium', alerts: 0 },
          { country: 'JP', exposure: 65000, risk_score: 32, status: 'high', alerts: 1 },
          { country: 'SG', exposure: 55000, risk_score: 12, status: 'low', alerts: 0 },
        ],
        compliance_alerts: [
          { id: 1, country: 'UK', type: 'Overdue Filing', description: 'VAT return overdue by 10 days', severity: 'high' },
          { id: 2, country: 'AU', type: 'Documentation', description: 'Missing entity registration documents', severity: 'high' },
          { id: 3, country: 'AU', type: 'Policy Change', description: 'New tax policy effective Feb 1', severity: 'medium' },
          { id: 4, country: 'DE', type: 'Filing Deadline', description: 'Tax return due in 15 days', severity: 'medium' },
        ],
        fx_exposure: {
          total_exposure: 1405000,
          by_currency: [
            { currency: 'USD', exposure: 450000, concentration: 32 },
            { currency: 'EUR', exposure: 350000, concentration: 25 },
            { currency: 'GBP', exposure: 310000, concentration: 22 },
            { currency: 'CAD', exposure: 195000, concentration: 14 },
            { currency: 'AUD', exposure: 100000, concentration: 7 },
          ]
        },
      };
      setRiskData(mockData);
      setLoading(false);
    }
  }, [currentOrganization]);

  const getRiskColor = (score) => {
    if (score < 20) return '#10b981'; // green
    if (score < 30) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="risk-exposure-container">
      {/* Header */}
      <div className="risk-header">
        <h1><FaExclamationTriangle /> Risk & Exposure Analysis</h1>
        <p>Concentration risk, country risk scores, and compliance alerts</p>
      </div>

      {loading ? (
        <div className="loading">Loading risk data...</div>
      ) : (
        <>
          {/* Concentration Risk */}
          <div className="concentration-section">
            <h2>Concentration Risk Overview</h2>
            <div className="concentration-grid">
              <div className="concentration-card main">
                <div className="metric">
                  <div className="label">Top 3 Countries</div>
                  <div className="value">{riskData.concentration_risk?.top3_percentage}%</div>
                  <div className="description">of total exposure</div>
                </div>
                <div className="metric">
                  <div className="label">Active Jurisdictions</div>
                  <div className="value">{riskData.concentration_risk?.countries_with_exposure}</div>
                  <div className="description">with tax exposure</div>
                </div>
              </div>

              {(riskData.concentration_risk?.largest_exposures || []).map((exp, idx) => (
                <div key={idx} className="concentration-card" onClick={() => setSelectedCountry(exp.country)}>
                  <div className="rank">#{idx + 1}</div>
                  <div className="country-name">{exp.country}</div>
                  <div className="exposure">{formatCurrency(exp.amount)}</div>
                  <div className="percentage">{exp.percentage}% of total</div>
                </div>
              ))}
            </div>

            {/* Concentration Warning */}
            {(riskData.concentration_risk?.top3_percentage || 0) > 60 && (
              <div className="warning-banner">
                <FaBell /> High concentration risk: Top 3 countries represent {riskData.concentration_risk?.top3_percentage}% of exposure
              </div>
            )}
          </div>

          {/* Country Risk Heatmap */}
          <div className="risk-heatmap-section">
            <h2><FaMap /> Country Risk Scores</h2>
            <div className="heatmap-grid">
              {(riskData.country_risks || []).map(country => (
                <div 
                  key={country.country}
                  className={`risk-cell ${country.status}`}
                  onClick={() => setSelectedCountry(country.country)}
                  style={{backgroundColor: getRiskColor(country.risk_score) + '20', borderColor: getRiskColor(country.risk_score)}}
                >
                  <div className="cell-country">{country.country}</div>
                  <div className="cell-score" style={{color: getRiskColor(country.risk_score)}}>
                    {country.risk_score}/100
                  </div>
                  <div className="cell-exposure">{formatCurrency(country.exposure)}</div>
                  {country.alerts > 0 && <div className="alert-badge">{country.alerts}</div>}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="risk-legend">
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#10b981'}}></div>
                <span>Low Risk (&lt;20)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#f59e0b'}}></div>
                <span>Medium Risk (20-30)</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#ef4444'}}></div>
                <span>High Risk (&gt;30)</span>
              </div>
            </div>
          </div>

          {/* Compliance Alerts */}
          <div className="alerts-section">
            <h2><FaBell /> Compliance Alerts & Actions Required</h2>
            <div className="alerts-list">
              {(riskData.compliance_alerts || []).map(alert => (
                <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                  <div className="alert-header">
                    <div className="alert-type">{alert.type}</div>
                    <div className={`severity-badge ${alert.severity}`}>{alert.severity}</div>
                  </div>
                  <div className="alert-country">{alert.country}</div>
                  <div className="alert-description">{alert.description}</div>
                  <div className="alert-action">
                    <button className="btn-link">Take Action</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FX Risk */}
          <div className="fx-risk-section">
            <h2><FaChartBar /> Foreign Exchange Risk</h2>
            <div className="fx-grid">
              {(riskData.fx_exposure?.by_currency || []).map(curr => (
                <div key={curr.currency} className="fx-card">
                  <div className="currency">{curr.currency}</div>
                  <div className="exposure">{formatCurrency(curr.exposure)}</div>
                  <div className="concentration">
                    <div className="bar" style={{width: `${curr.concentration}%`, backgroundColor: getRiskColor(50 + curr.concentration)}}></div>
                  </div>
                  <div className="percentage">{curr.concentration}% of total</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EnterpriseRiskExposure;
