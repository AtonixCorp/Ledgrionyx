import React, { useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import './EnterpriseOrgOverview.css';
import { FaArrowUp, FaArrowDown, FaGlobe, FaBuilding, FaExclamationTriangle } from 'react-icons/fa';

const EnterpriseOrgOverview = () => {
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
    active_entities = 0,
    pending_tax_returns = 0,
    missing_data_entities = 0,
    tax_exposure_by_country = {}
  } = orgOverview;

  return (
    <div className="org-overview-container">
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
            <div className="metric-badge">{pending_tax_returns} returns pending</div>
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

      {/* Status Indicators */}
      <section className="status-indicators">
        <h3 className="section-title">Organization Status</h3>
        
        <div className="status-strip">
          {pending_tax_returns > 0 && (
            <div className="status-item warning">
              <FaExclamationTriangle className="status-icon" />
              <span>{pending_tax_returns} tax returns due this month</span>
            </div>
          )}
          
          {missing_data_entities > 0 && (
            <div className="status-item alert">
              <FaExclamationTriangle className="status-icon" />
              <span>{missing_data_entities} entities with missing data</span>
            </div>
          )}
          
          {missing_data_entities === 0 && pending_tax_returns === 0 && (
            <div className="status-item healthy">
              <span>✓ All systems operational</span>
            </div>
          )}
        </div>
      </section>

      {/* Tax Exposure Heatmap */}
      <section className="tax-heatmap">
        <h3 className="section-title">Tax Exposure by Country</h3>
        
        <div className="heatmap-grid">
          {Object.entries(tax_exposure_by_country).map(([country, amount]) => {
            const max = Math.max(...Object.values(tax_exposure_by_country));
            const intensity = max > 0 ? (amount / max) : 0;
            const heatmapColor = `rgba(220, 38, 38, ${0.2 + intensity * 0.8})`;
            
            return (
              <div
                key={country}
                className="heatmap-cell"
                style={{ backgroundColor: heatmapColor }}
                title={`${country}: $${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
              >
                <div className="cell-content">
                  <div className="cell-country">{country}</div>
                  <div className="cell-amount">${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Links */}
      <section className="quick-links">
        <h3 className="section-title">Quick Actions</h3>
        
        <div className="links-grid">
          <a href="/enterprise/entities" className="quick-link">
            <span className="link-icon">🏢</span>
            <span className="link-text">View All Entities</span>
          </a>
          <a href="/enterprise/tax-compliance" className="quick-link">
            <span className="link-icon">📋</span>
            <span className="link-text">Tax Compliance</span>
          </a>
          <a href="/enterprise/team" className="quick-link">
            <span className="link-icon">👥</span>
            <span className="link-text">Manage Team</span>
          </a>
          <a href="/enterprise/reports" className="quick-link">
            <span className="link-icon">📊</span>
            <span className="link-text">View Reports</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default EnterpriseOrgOverview;
