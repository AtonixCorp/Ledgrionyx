import React, { useState } from 'react';
import { FaShieldAlt, FaGlobe, FaClock, FaSignature, FaEyeSlash, FaLock, FaChartLine, FaRocket, FaRobot, FaBuilding, FaGem, FaUniversity } from 'react-icons/fa';
import './SecurityVaults.css';

const SecurityVaults = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [geoLockEnabled, setGeoLockEnabled] = useState(false);
  const [decoyModeEnabled, setDecoyModeEnabled] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedVault, setSelectedVault] = useState(null);

  const securityFeatures = [
    {
      id: 1,
      icon: <FaGlobe />,
      title: 'Geo-Locked Transactions',
      description: 'Restrict transactions to specific geographic locations',
      enabled: geoLockEnabled,
      toggle: () => setGeoLockEnabled(!geoLockEnabled),
      details: 'Only allow transactions when you are in approved locations'
    },
    {
      id: 2,
      icon: <FaClock />,
      title: 'Time-Locked Withdrawals',
      description: 'Add mandatory waiting periods for large withdrawals',
      enabled: true,
      details: '24-hour delay for withdrawals over $5,000'
    },
    {
      id: 3,
      icon: <FaSignature />,
      title: 'Multi-Signature Approvals',
      description: 'Require multiple approvals for high-value transfers',
      enabled: true,
      details: '2 of 3 signatures required for transfers over $10,000'
    },
    {
      id: 4,
      icon: <FaEyeSlash />,
      title: 'Invisible Decoy Mode',
      description: 'Show fake low balance when under pressure',
      enabled: decoyModeEnabled,
      toggle: () => setDecoyModeEnabled(!decoyModeEnabled),
      details: 'Display $150 balance instead of actual $45,250'
    },
    {
      id: 5,
      icon: <FaLock />,
      title: 'Encrypted Transaction Notes',
      description: 'All notes are end-to-end encrypted',
      enabled: true,
      details: 'Zero-knowledge encryption for maximum privacy'
    }
  ];

  const investmentVaults = [
    {
      id: 1,
      name: 'Trading Vault',
      icon: <FaChartLine />,
      balance: 15000,
      minDeposit: 1000,
      lockPeriod: 'None',
      expectedReturn: '8-15%',
      riskScore: 7,
      description: 'Active trading with moderate risk and high potential returns',
      color: '#3498db'
    },
    {
      id: 2,
      name: 'Space Research Vault',
      icon: <FaRocket />,
      balance: 5000,
      minDeposit: 500,
      lockPeriod: '12 months',
      expectedReturn: '12-20%',
      riskScore: 8,
      description: 'Invest in cutting-edge space technology and research projects',
      color: '#9b59b6'
    },
    {
      id: 3,
      name: 'AI Research Vault',
      icon: <FaRobot />,
      balance: 8000,
      minDeposit: 500,
      lockPeriod: '6 months',
      expectedReturn: '10-18%',
      riskScore: 7,
      description: 'Fund AI and machine learning breakthrough research',
      color: '#e74c3c'
    },
    {
      id: 4,
      name: 'Real Estate Vault',
      icon: <FaBuilding />,
      balance: 25000,
      minDeposit: 5000,
      lockPeriod: '24 months',
      expectedReturn: '6-10%',
      riskScore: 4,
      description: 'Diversified real estate portfolio with stable returns',
      color: '#27ae60'
    },
    {
      id: 5,
      name: 'DeFi Yield Vault',
      icon: <FaGem />,
      balance: 10000,
      minDeposit: 500,
      lockPeriod: 'Flexible',
      expectedReturn: '5-25%',
      riskScore: 9,
      description: 'High-yield DeFi strategies with variable returns',
      color: '#f39c12'
    },
    {
      id: 6,
      name: 'Treasury Vault',
      icon: <FaUniversity />,
      balance: 50000,
      minDeposit: 1000,
      lockPeriod: '3 months',
      expectedReturn: '3-5%',
      riskScore: 2,
      description: 'Ultra-safe government bonds and treasury securities',
      color: '#34495e'
    }
  ];

  const getRiskColor = (score) => {
    if (score <= 3) return '#27ae60';
    if (score <= 6) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <div className="security-vaults-page">
      <div className="page-header">
        <h1><FaShieldAlt /> Security & Investment Vaults</h1>
        <p>Sovereign security features and modular investment management</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <FaShieldAlt /> Security Layer
        </button>
        <button 
          className={`tab ${activeTab === 'vaults' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaults')}
        >
          <FaUniversity /> Investment Vaults
        </button>
      </div>

      {activeTab === 'security' && (
        <div className="security-section">
          <div className="section-intro">
            <h2>Sovereign Security Features</h2>
            <p>Advanced security controls that put you in complete command of your financial sovereignty</p>
          </div>

          <div className="security-grid">
            {securityFeatures.map(feature => (
              <div key={feature.id} className="security-card">
                <div className="security-header">
                  <span className="security-icon">{feature.icon}</span>
                  <div className="security-info">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                  {feature.toggle && (
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={feature.enabled}
                        onChange={feature.toggle}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  )}
                  {!feature.toggle && (
                    <span className={`status-badge ${feature.enabled ? 'enabled' : 'disabled'}`}>
                      {feature.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  )}
                </div>
                <div className="security-details">
                  <small>{feature.details}</small>
                </div>
              </div>
            ))}
          </div>

          <div className="security-summary">
            <h3><FaLock /> Security Score</h3>
            <div className="security-score-display">
              <div className="score-circle-lg">
                <span className="score">95</span>
                <span className="score-label">/100</span>
              </div>
              <div className="score-details">
                <p><strong>Excellent Security Posture</strong></p>
                <p>Your account has multi-layered protection with sovereign-grade security features.</p>
                <ul>
                  <li>✓ 5 of 5 security features active</li>
                  <li>✓ Geo-locking configured</li>
                  <li>✓ Multi-signature enabled</li>
                  <li>✓ Time-locked withdrawals active</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vaults' && (
        <div className="vaults-section">
          <div className="section-intro">
            <h2>Modular Investment Vaults</h2>
            <p>Choose where your money goes with complete transparency and control</p>
          </div>

          <div className="vaults-summary">
            <div className="summary-card">
              <span className="summary-label">Total Vault Balance</span>
              <span className="summary-value">$113,000</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Active Vaults</span>
              <span className="summary-value">6</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Avg. Expected Return</span>
              <span className="summary-value positive">9.3%</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Portfolio Risk</span>
              <span className="summary-value">Moderate</span>
            </div>
          </div>

          <div className="vaults-grid">
            {investmentVaults.map(vault => (
              <div 
                key={vault.id} 
                className="vault-card"
                style={{ borderLeftColor: vault.color }}
                onClick={() => setSelectedVault(vault)}
              >
                <div className="vault-header">
                  <span className="vault-icon" style={{ background: vault.color }}>
                    {vault.icon}
                  </span>
                  <h3>{vault.name}</h3>
                </div>

                <div className="vault-balance">
                  <span className="balance-label">Current Balance</span>
                  <span className="balance-amount">${vault.balance.toLocaleString()}</span>
                </div>

                <div className="vault-details">
                  <p className="vault-description">{vault.description}</p>
                  
                  <div className="vault-metrics">
                    <div className="metric">
                      <span className="metric-label">Expected Return</span>
                      <span className="metric-value positive">{vault.expectedReturn}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Lock Period</span>
                      <span className="metric-value">{vault.lockPeriod}</span>
                    </div>
                  </div>

                  <div className="risk-indicator">
                    <span className="risk-label">Risk Level:</span>
                    <div className="risk-bar">
                      <div 
                        className="risk-fill"
                        style={{ 
                          width: `${(vault.riskScore / 10) * 100}%`,
                          background: getRiskColor(vault.riskScore)
                        }}
                      ></div>
                    </div>
                    <span className="risk-score">{vault.riskScore}/10</span>
                  </div>

                  <div className="vault-min-deposit">
                    <small>Min. Deposit: ${vault.minDeposit.toLocaleString()}</small>
                  </div>
                </div>

                <div className="vault-actions">
                  <button className="btn-deposit">Deposit</button>
                  <button className="btn-withdraw">Withdraw</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityVaults;
