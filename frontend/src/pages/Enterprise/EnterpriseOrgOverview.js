import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import './EnterpriseOrgOverview.css';
import { FaArrowUp, FaArrowDown, FaGlobe, FaBuilding, FaArrowRight, FaClipboardList, FaUsers, FaChartBar } from 'react-icons/fa';

const EnterpriseOrgOverview = () => {
  const navigate = useNavigate();
  const { currentOrganization, orgOverview, fetchOrgOverview, hasPermission, PERMISSIONS } = useEnterprise();

  useEffect(() => {
    if (currentOrganization) {
      fetchOrgOverview(currentOrganization.id);
    }
  }, [currentOrganization, fetchOrgOverview]);

  if (!hasPermission(PERMISSIONS.VIEW_ORG_OVERVIEW)) {
    return <div className="permission-denied">You don't have permission to view this dashboard.</div>;
  }

  if (!orgOverview) {
    return <div className="loading">Loading organization overview...</div>;
  }

  const {
    total_assets = 0,
    total_liabilities = 0,
    net_position = 0,
    total_tax_exposure = 0,
    active_jurisdictions = 0,
    active_entities = 0
  } = orgOverview;

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="org-overview-container">
      {/* Header */}
      <div className="overview-header">
        <h1>Organization Overview</h1>
        <p>Executive summary of your organization's financial and tax position</p>
      </div>

      {/* Executive Summary */}
      <section className="executive-summary">
        <h2 className="section-title">Executive Summary</h2>
        
        <div className="metrics-grid">
          {/* Net Position Card */}
          <div className="metric-card primary">
            <div className="metric-header">
              <h3>Net Position</h3>
              <span className="metric-label">Total Assets vs Liabilities</span>
            </div>
            <div className="metric-value">
              ${Number(net_position).toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <div className="metric-details">
              <span className="asset">Assets: ${Number(total_assets).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              <span className="liability">Liabilities: ${Number(total_liabilities).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Tax Exposure Card */}
          <div className="metric-card warning">
            <div className="metric-header">
              <h3>Total Tax Exposure</h3>
              <span className="metric-label">Current Period</span>
            </div>
            <div className="metric-value">
              ${Number(total_tax_exposure).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div className="metric-badge">2 returns pending</div>
          </div>

          {/* Jurisdictions Card */}
          <div className="metric-card info">
            <div className="metric-header">
              <h3>Active Jurisdictions</h3>
              <FaGlobe className="header-icon" />
            </div>
            <div className="metric-value">{active_jurisdictions}</div>
            <div className="metric-label">countries</div>
          </div>

          {/* Entities Card */}
          <div className="metric-card success">
            <div className="metric-header">
              <h3>Active Entities</h3>
              <FaBuilding className="header-icon" />
            </div>
            <div className="metric-value">{active_entities}</div>
            <div className="metric-label">legal entities</div>
          </div>
        </div>
      </section>

      {/* Active Financial Positions */}
      <section className="active-positions">
        <h3 className="section-title">Active Financial Positions</h3>

        <div className="positions-grid">
          {/* Cash Positions */}
          <div className="position-card cash">
            <div className="position-header">
              <div className="position-icon">💰</div>
              <h4>Cash & Equivalents</h4>
            </div>
            <div className="position-value">$2,450,000</div>
            <div className="position-details">
              <span>4 active accounts</span>
              <span>3 currencies</span>
            </div>
          </div>

          {/* Investment Positions */}
          <div className="position-card investments">
            <div className="position-header">
              <div className="position-icon">📈</div>
              <h4>Investments</h4>
            </div>
            <div className="position-value">$8,750,000</div>
            <div className="position-details">
              <span>12 holdings</span>
              <span>5 asset classes</span>
            </div>
          </div>

          {/* Real Estate Positions */}
          <div className="position-card real-estate">
            <div className="position-header">
              <div className="position-icon">🏢</div>
              <h4>Real Estate</h4>
            </div>
            <div className="position-value">$15,200,000</div>
            <div className="position-details">
              <span>8 properties</span>
              <span>4 countries</span>
            </div>
          </div>

          {/* Crypto Positions */}
          <div className="position-card crypto">
            <div className="position-header">
              <div className="position-icon">₿</div>
              <h4>Cryptocurrency</h4>
            </div>
            <div className="position-value">$1,850,000</div>
            <div className="position-details">
              <span>6 assets</span>
              <span>24h: +2.4%</span>
            </div>
          </div>

          {/* Derivatives Positions */}
          <div className="position-card derivatives">
            <div className="position-header">
              <div className="position-icon">📊</div>
              <h4>Derivatives</h4>
            </div>
            <div className="position-value">$3,100,000</div>
            <div className="position-details">
              <span>15 contracts</span>
              <span>7 counterparties</span>
            </div>
          </div>

          {/* Private Equity */}
          <div className="position-card private-equity">
            <div className="position-header">
              <div className="position-icon">🏛️</div>
              <h4>Private Equity</h4>
            </div>
            <div className="position-value">$12,500,000</div>
            <div className="position-details">
              <span>5 investments</span>
              <span>3 funds</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        
        <div className="actions-grid">
          <button 
            className="action-button entities"
            onClick={() => handleNavigate('/app/enterprise/entities')}
          >
            <div className="action-icon"><FaBuilding /></div>
            <div className="action-content">
              <h4>View All Entities</h4>
              <p>Manage and monitor all legal entities</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button 
            className="action-button compliance"
            onClick={() => handleNavigate('/app/enterprise/tax-compliance')}
          >
            <div className="action-icon"><FaClipboardList /></div>
            <div className="action-content">
              <h4>Tax Compliance</h4>
              <p>Track deadlines and obligations</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button 
            className="action-button team"
            onClick={() => handleNavigate('/app/enterprise/team')}
          >
            <div className="action-icon"><FaUsers /></div>
            <div className="action-content">
              <h4>Manage Team</h4>
              <p>Control access and permissions</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>

          <button 
            className="action-button reports"
            onClick={() => handleNavigate('/app/enterprise/reports')}
          >
            <div className="action-icon"><FaChartBar /></div>
            <div className="action-content">
              <h4>View Reports</h4>
              <p>Generate and export reports</p>
            </div>
            <FaArrowRight className="action-arrow" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default EnterpriseOrgOverview;
