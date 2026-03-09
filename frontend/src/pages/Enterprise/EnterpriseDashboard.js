import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  FaGlobe, FaBuilding, FaChartBar, FaMapMarkerAlt, FaDollarSign,
  FaArrowUp, FaArrowDown, FaSync, FaExclamationTriangle,
  FaCheckCircle, FaFilter, FaExchangeAlt, FaSitemap
} from 'react-icons/fa';
import './EnterpriseDashboard.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const REGION_MAP = {
  US: 'North America', CA: 'North America', MX: 'North America',
  GB: 'Europe', DE: 'Europe', FR: 'Europe', NL: 'Europe', IE: 'Europe',
  AE: 'Middle East', SA: 'Middle East', QA: 'Middle East',
  IN: 'Asia Pacific', SG: 'Asia Pacific', HK: 'Asia Pacific', AU: 'Asia Pacific',
  ZA: 'Africa', NG: 'Africa', KE: 'Africa', GH: 'Africa',
};

function getRegion(country) {
  const code = country?.toUpperCase().slice(0, 2);
  return REGION_MAP[code] || 'Other';
}

const EnterpriseDashboard = () => {
  const navigate = useNavigate();
  const { currentOrganization, entities, orgOverview, fetchOrgOverview, fetchEntities } = useEnterprise();
  const [loading, setLoading] = useState(false);
  const [branchData, setBranchData] = useState([]);
  const [regionData, setRegionData] = useState({});
  const [viewMode, setViewMode] = useState('branches'); // branches | regions
  const [sortBy, setSortBy] = useState('revenue');

  const buildBranchData = useCallback((entitiesList) => {
    const branches = entitiesList.map(e => ({
      id: e.id,
      name: e.name,
      country: e.country,
      entity_type: e.entity_type,
      status: e.status,
      currency: e.local_currency || 'USD',
      region: getRegion(e.country),
      // Simulated financials (in real app, fetch from server)
      revenue: Math.floor(Math.random() * 2000000) + 100000,
      expenses: Math.floor(Math.random() * 1500000) + 80000,
      tax_exposure: Math.floor(Math.random() * 200000),
      staff_count: Math.floor(Math.random() * 50) + 1,
    }));
    branches.forEach(b => { b.profit = b.revenue - b.expenses; });
    setBranchData(branches);

    // Aggregate by region
    const byRegion = {};
    branches.forEach(b => {
      if (!byRegion[b.region]) {
        byRegion[b.region] = { region: b.region, entities: 0, revenue: 0, expenses: 0, profit: 0, countries: new Set() };
      }
      byRegion[b.region].entities++;
      byRegion[b.region].revenue += b.revenue;
      byRegion[b.region].expenses += b.expenses;
      byRegion[b.region].profit += b.profit;
      byRegion[b.region].countries.add(b.country);
    });
    Object.values(byRegion).forEach(r => { r.countries = r.countries.size; });
    setRegionData(byRegion);
  }, []);

  useEffect(() => {
    if (!currentOrganization) return;
    setLoading(true);
    fetchOrgOverview(currentOrganization.id);
    fetchEntities(currentOrganization.id);
  }, [currentOrganization, fetchOrgOverview, fetchEntities]);

  useEffect(() => {
    if (entities && entities.length > 0) {
      buildBranchData(entities);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [entities, buildBranchData]);

  const sortedBranches = [...branchData].sort((a, b) => {
    if (sortBy === 'revenue') return b.revenue - a.revenue;
    if (sortBy === 'profit') return b.profit - a.profit;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const totalRevenue = branchData.reduce((s, b) => s + b.revenue, 0);
  const totalExpenses = branchData.reduce((s, b) => s + b.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const totalTax = branchData.reduce((s, b) => s + b.tax_exposure, 0);

  const fmt = (n) => '$' + (n >= 1000000
    ? (n / 1000000).toFixed(1) + 'M'
    : n >= 1000 ? (n / 1000).toFixed(0) + 'K' : n.toFixed(0));

  if (!currentOrganization) {
    return (
      <div className="ent-dash">
        <div className="ed-empty">
          <FaSitemap size={48} />
          <h2>No Organization Selected</h2>
          <p>Create or select an organization to view the Enterprise Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ent-dash">
      {/* Header */}
      <div className="ed-header">
        <div className="ed-header-left">
          <h1><FaSitemap /> Enterprise Dashboard</h1>
          <p>{currentOrganization.name} &mdash; Multi-Branch · Multi-Region Operations</p>
        </div>
        <div className="ed-header-actions">
          <button className="btn-ed-secondary" onClick={() => navigate('/app/enterprise/entities')}>
            <FaBuilding /> Manage Entities
          </button>
          <button className="btn-ed-primary" onClick={() => {
            fetchOrgOverview(currentOrganization.id);
            fetchEntities(currentOrganization.id);
          }}>
            <FaSync /> Refresh
          </button>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="ed-kpi-row">
        <div className="ed-kpi kpi-blue">
          <div className="ed-kpi-icon"><FaGlobe /></div>
          <div>
            <div className="ed-kpi-val">{orgOverview?.active_jurisdictions || branchData.length}</div>
            <div className="ed-kpi-lbl">Jurisdictions</div>
          </div>
        </div>
        <div className="ed-kpi kpi-purple">
          <div className="ed-kpi-icon"><FaBuilding /></div>
          <div>
            <div className="ed-kpi-val">{orgOverview?.active_entities || branchData.length}</div>
            <div className="ed-kpi-lbl">Active Entities</div>
          </div>
        </div>
        <div className="ed-kpi kpi-green">
          <div className="ed-kpi-icon"><FaArrowUp /></div>
          <div>
            <div className="ed-kpi-val">{fmt(totalRevenue)}</div>
            <div className="ed-kpi-lbl">Total Revenue</div>
          </div>
        </div>
        <div className="ed-kpi kpi-teal">
          <div className="ed-kpi-icon"><FaDollarSign /></div>
          <div>
            <div className="ed-kpi-val" style={{ color: totalProfit >= 0 ? '#10b981' : '#ef4444' }}>
              {fmt(Math.abs(totalProfit))}
            </div>
            <div className="ed-kpi-lbl">Net Profit</div>
          </div>
        </div>
        <div className="ed-kpi kpi-orange">
          <div className="ed-kpi-icon"><FaExclamationTriangle /></div>
          <div>
            <div className="ed-kpi-val">{fmt(totalTax)}</div>
            <div className="ed-kpi-lbl">Tax Exposure</div>
          </div>
        </div>
        <div className="ed-kpi kpi-red">
          <div className="ed-kpi-icon"><FaExclamationTriangle /></div>
          <div>
            <div className="ed-kpi-val">{orgOverview?.pending_tax_returns || 0}</div>
            <div className="ed-kpi-lbl">Pending Returns</div>
          </div>
        </div>
      </div>

      {/* View toggle + Sort */}
      <div className="ed-controls">
        <div className="ed-view-toggle">
          <button
            className={`vt-btn ${viewMode === 'branches' ? 'active' : ''}`}
            onClick={() => setViewMode('branches')}
          >
            <FaBuilding /> Branch View
          </button>
          <button
            className={`vt-btn ${viewMode === 'regions' ? 'active' : ''}`}
            onClick={() => setViewMode('regions')}
          >
            <FaGlobe /> Regional View
          </button>
        </div>
        {viewMode === 'branches' && (
          <div className="ed-sort">
            <FaFilter />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="revenue">Sort by Revenue</option>
              <option value="profit">Sort by Profit</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        )}
      </div>

      {loading && <div className="ed-loading"><div className="spinner" /> Loading enterprise data…</div>}

      {!loading && branchData.length === 0 && (
        <div className="ed-no-entities">
          <FaBuilding size={32} />
          <h3>No entities yet</h3>
          <p>Add entities to see your multi-branch dashboard.</p>
          <button className="btn-ed-primary" onClick={() => navigate('/app/enterprise/entities')}>
            <FaBuilding /> Add First Entity
          </button>
        </div>
      )}

      {/* ── BRANCH VIEW ── */}
      {!loading && viewMode === 'branches' && branchData.length > 0 && (
        <div className="ed-branches">
          <h2 className="ed-section-title">Branch Overview ({branchData.length} entities)</h2>

          {/* Performance bar chart */}
          <div className="ed-card ed-perf-bars">
            <h3>Revenue by Branch</h3>
            {sortedBranches.map(branch => {
              const pct = totalRevenue ? (branch.revenue / totalRevenue) * 100 : 0;
              return (
                <div className="perf-bar-row" key={branch.id} onClick={() => navigate(`/app/enterprise/entities/${branch.id}/dashboard`)}>
                  <div className="pbr-label">
                    <span className="pbr-name">{branch.name}</span>
                    <span className="pbr-country">{branch.country}</span>
                  </div>
                  <div className="pbr-track">
                    <div
                      className="pbr-fill"
                      style={{ width: `${pct}%`, background: branch.profit >= 0 ? '#10b981' : '#ef4444' }}
                    />
                  </div>
                  <div className="pbr-values">
                    <span className="pbr-rev">{fmt(branch.revenue)}</span>
                    <span className={`pbr-profit ${branch.profit >= 0 ? 'pos' : 'neg'}`}>
                      {branch.profit >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {fmt(Math.abs(branch.profit))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branch cards grid */}
          <div className="ed-branch-grid">
            {sortedBranches.map(branch => (
              <div
                className="ed-branch-card"
                key={branch.id}
                onClick={() => navigate(`/app/enterprise/entities/${branch.id}/dashboard`)}
              >
                <div className="ebc-header">
                  <div className="ebc-flag">
                    <FaMapMarkerAlt /> {branch.country}
                  </div>
                  <span className={`status-pill ${branch.status}`}>{branch.status}</span>
                </div>
                <div className="ebc-name">{branch.name}</div>
                <div className="ebc-type">{branch.entity_type?.replace('_', ' ')}</div>
                <div className="ebc-region">{branch.region}</div>
                <div className="ebc-metrics">
                  <div className="ebc-metric">
                    <span>Revenue</span>
                    <strong>{fmt(branch.revenue)}</strong>
                  </div>
                  <div className="ebc-metric">
                    <span>Expenses</span>
                    <strong>{fmt(branch.expenses)}</strong>
                  </div>
                  <div className="ebc-metric">
                    <span>Profit</span>
                    <strong className={branch.profit >= 0 ? 'pos' : 'neg'}>
                      {fmt(Math.abs(branch.profit))}
                    </strong>
                  </div>
                  <div className="ebc-metric">
                    <span>Tax Exp</span>
                    <strong>{fmt(branch.tax_exposure)}</strong>
                  </div>
                </div>
                <div className="ebc-margin-bar">
                  <div
                    style={{
                      width: `${branch.revenue ? (branch.profit / branch.revenue) * 100 : 0}%`,
                      background: branch.profit >= 0 ? '#10b981' : '#ef4444'
                    }}
                  />
                </div>
                <div className="ebc-margin-label">
                  {branch.revenue ? ((branch.profit / branch.revenue) * 100).toFixed(1) : 0}% margin
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REGIONAL VIEW ── */}
      {!loading && viewMode === 'regions' && Object.keys(regionData).length > 0 && (
        <div className="ed-regions">
          <h2 className="ed-section-title">Regional Operations ({Object.keys(regionData).length} regions)</h2>
          <div className="ed-region-grid">
            {Object.values(regionData)
              .sort((a, b) => b.revenue - a.revenue)
              .map(region => (
                <div className="ed-region-card" key={region.region}>
                  <div className="erc-header">
                    <div className="erc-icon"><FaGlobe /></div>
                    <div>
                      <div className="erc-name">{region.region}</div>
                      <div className="erc-meta">
                        {region.entities} entities · {region.countries} countries
                      </div>
                    </div>
                  </div>
                  <div className="erc-metrics">
                    <div className="erc-metric">
                      <span>Revenue</span>
                      <strong>{fmt(region.revenue)}</strong>
                    </div>
                    <div className="erc-metric">
                      <span>Expenses</span>
                      <strong>{fmt(region.expenses)}</strong>
                    </div>
                    <div className="erc-metric">
                      <span>Net Profit</span>
                      <strong className={region.profit >= 0 ? 'pos' : 'neg'}>
                        {fmt(Math.abs(region.profit))}
                      </strong>
                    </div>
                  </div>
                  <div className="erc-contribution">
                    <span>Revenue contribution</span>
                    <div className="erc-bar-track">
                      <div
                        className="erc-bar-fill"
                        style={{ width: `${totalRevenue ? (region.revenue / totalRevenue) * 100 : 0}%` }}
                      />
                    </div>
                    <span>{totalRevenue ? ((region.revenue / totalRevenue) * 100).toFixed(0) : 0}%</span>
                  </div>
                  <div className="erc-entities">
                    {branchData
                      .filter(b => b.region === region.region)
                      .map(b => (
                        <div
                          className="erc-entity-chip"
                          key={b.id}
                          onClick={() => navigate(`/app/enterprise/entities/${b.id}/dashboard`)}
                        >
                          <FaMapMarkerAlt /> {b.name}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Compliance alerts */}
      {orgOverview && (orgOverview.pending_tax_returns > 0 || orgOverview.missing_data_entities > 0) && (
        <div className="ed-alerts">
          <h3><FaExclamationTriangle /> Action Required</h3>
          <div className="ed-alert-list">
            {orgOverview.pending_tax_returns > 0 && (
              <div className="ed-alert-item warning">
                <FaExclamationTriangle />
                <span>{orgOverview.pending_tax_returns} tax return(s) pending. Review compliance status.</span>
                <button className="btn-alert-action" onClick={() => navigate('/app/enterprise/tax-compliance')}>
                  View →
                </button>
              </div>
            )}
            {orgOverview.missing_data_entities > 0 && (
              <div className="ed-alert-item info">
                <FaExclamationTriangle />
                <span>{orgOverview.missing_data_entities} entity(ies) have incomplete data.</span>
                <button className="btn-alert-action" onClick={() => navigate('/app/enterprise/entities')}>
                  Fix →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseDashboard;
