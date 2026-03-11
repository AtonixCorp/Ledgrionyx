import React, { useEffect, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';

const EnterpriseRiskExposure = () => {
  const { currentOrganization, fetchRiskExposureDashboard } = useEnterprise();
  const [riskData, setRiskData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!currentOrganization?.id) {
        if (isMounted) {
          setRiskData({});
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const data = await fetchRiskExposureDashboard(currentOrganization.id);
      if (isMounted) {
        setRiskData(data || {});
        setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [currentOrganization?.id, fetchRiskExposureDashboard]);

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
        <h1>Risk & Exposure Analysis</h1>
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
                <div key={idx} className="concentration-card">
                  <div className="rank">#{idx + 1}</div>
                  <div className="country-name">{exp.country}</div>
                  <div className="exposure">{formatCurrency(exp.amount)}</div>
                  <div className="percentage">{exp.percentage}% of total</div>
                </div>
              ))}
            </div>
          </div>

          {/* Country Risk Heatmap */}
          <div className="risk-heatmap-section">
            <h2>Country Risk Scores</h2>
            <div className="heatmap-grid">
              {(riskData.country_risks || []).map(country => (
                <div
                  key={country.country}
                  className={`risk-cell ${country.status}`}
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
            <h2>Compliance Alerts & Actions Required</h2>
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
            <h2>Foreign Exchange Risk</h2>
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
