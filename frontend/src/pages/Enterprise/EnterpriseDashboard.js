import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';

import { Button } from '../../components/ui';

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
      <div className="page-shell">
        <div className="ed-empty-state">

          <h2>No Organization Selected</h2>
          <p>Create or select an organization to view the Enterprise Dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">

      {/*  Page Header  */}
      <div className="page-shell-header">
        <div>
          <h1 className="page-shell-title">Enterprise Dashboard</h1>
          <p className="page-shell-subtitle">
            {currentOrganization.name} &mdash; Multi-Branch · Multi-Region Operations
          </p>
        </div>
        <div className="page-shell-actions">
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/app/enterprise/entities')}
          >Manage Entities
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate('/app/overview/dashboard')}
          >Accounting Dashboard
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              fetchOrgOverview(currentOrganization.id);
              fetchEntities(currentOrganization.id);
            }}
          >Refresh
          </Button>
        </div>
      </div>

      {/*  BAND 1 — Financial Health KPIs  */}
      <section className="ed-band">
        <div className="grid-kpi-6">
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--blue"></div>
            <p className="kpi-card-label">Jurisdictions</p>
            <p className="kpi-card-value numeric">
              {orgOverview?.active_jurisdictions || branchData.length}
            </p>
          </div>
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--purple"></div>
            <p className="kpi-card-label">Active Entities</p>
            <p className="kpi-card-value numeric">
              {orgOverview?.active_entities || branchData.length}
            </p>
          </div>
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--green"></div>
            <p className="kpi-card-label">Total Revenue</p>
            <p className="kpi-card-value numeric">{fmt(totalRevenue)}</p>
          </div>
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--teal"></div>
            <p className="kpi-card-label">Net Profit</p>
            <p className={`kpi-card-value numeric ${totalProfit >= 0 ? 'kpi-val-positive' : 'kpi-val-negative'}`}>
              {fmt(Math.abs(totalProfit))}
            </p>
          </div>
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--orange"></div>
            <p className="kpi-card-label">Tax Exposure</p>
            <p className="kpi-card-value numeric">{fmt(totalTax)}</p>
          </div>
          <div className="kpi-card">
            <div className="ed-kpi-icon-wrap kpi-icon--red"></div>
            <p className="kpi-card-label">Pending Returns</p>
            <p className="kpi-card-value numeric">{orgOverview?.pending_tax_returns || 0}</p>
          </div>
        </div>
      </section>

      {/* Controls bar */}
      <div className="toolbar section-gap-sm">
        <div className="ed-view-toggle">
          <button
            className={`vt-btn ${viewMode === 'branches' ? 'active' : ''}`}
            onClick={() => setViewMode('branches')}
          >
            Branch View
          </button>
          <button
            className={`vt-btn ${viewMode === 'regions' ? 'active' : ''}`}
            onClick={() => setViewMode('regions')}
          >
            Regional View
          </button>
        </div>
        {viewMode === 'branches' && (
          <div className="toolbar-right ed-sort">

            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="revenue">Sort by Revenue</option>
              <option value="profit">Sort by Profit</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        )}
      </div>

      {loading && (
        <div className="ed-loading">
          <div className="spinner" />Loading enterprise data…
        </div>
      )}

      {!loading && branchData.length === 0 && (
        <div className="ed-onboarding">
          <div className="ed-onboarding-header">
            <div className="ed-onboarding-kpi-row">
              <div className="ed-ob-kpi">
                <div className="ed-ob-kpi-value">0</div>
                <div className="ed-ob-kpi-label">Active Entities</div>
              </div>
              <div className="ed-ob-kpi">
                <div className="ed-ob-kpi-value">$0</div>
                <div className="ed-ob-kpi-label">Consolidated Revenue</div>
              </div>
              <div className="ed-ob-kpi">
                <div className="ed-ob-kpi-value">$0</div>
                <div className="ed-ob-kpi-label">Total Tax Exposure</div>
              </div>
              <div className="ed-ob-kpi">
                <div className="ed-ob-kpi-value">0</div>
                <div className="ed-ob-kpi-label">Jurisdictions</div>
              </div>
            </div>
          </div>

          <div className="ed-onboarding-body">
            <div className="ed-ob-left">
              <div className="ed-ob-step-label">Getting Started</div>
              <h2 className="ed-ob-title">Set up your Enterprise Structure</h2>
              <p className="ed-ob-desc">
                Add legal entities to unlock multi-branch financial consolidation, regional P&amp;L,
                tax exposure tracking, and cross-entity reporting.
              </p>
              <div className="ed-ob-steps">
                <div className="ed-ob-step">
                  <div className="ed-ob-step-num">1</div>
                  <div>
                    <div className="ed-ob-step-title">Create an entity</div>
                    <div className="ed-ob-step-sub">Add a subsidiary, branch, or holding company</div>
                  </div>
                </div>
                <div className="ed-ob-step">
                  <div className="ed-ob-step-num">2</div>
                  <div>
                    <div className="ed-ob-step-title">Assign jurisdiction &amp; currency</div>
                    <div className="ed-ob-step-sub">Set the operating country and local currency</div>
                  </div>
                </div>
                <div className="ed-ob-step">
                  <div className="ed-ob-step-num">3</div>
                  <div>
                    <div className="ed-ob-step-title">Connect accounting</div>
                    <div className="ed-ob-step-sub">Import or record transactions for consolidated reporting</div>
                  </div>
                </div>
                <div className="ed-ob-step">
                  <div className="ed-ob-step-num">4</div>
                  <div>
                    <div className="ed-ob-step-title">View consolidated dashboard</div>
                    <div className="ed-ob-step-sub">Revenue, profit, and tax across all branches appear here</div>
                  </div>
                </div>
              </div>
              <div className="ed-ob-actions">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => navigate('/app/enterprise/entities')}
                >
                  Add First Entity
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate('/app/overview/dashboard')}
                >
                  Go to Accounting Dashboard
                </Button>
              </div>
            </div>

            <div className="ed-ob-right">
              <div className="ed-ob-preview-label">Preview — With entities, you will see:</div>
              <div className="ed-ob-preview-cards">
                <div className="ed-ob-preview-card">
                  <div className="ed-ob-preview-row">
                    <span className="ed-ob-preview-dot cyan" />
                    <span>Revenue by Branch</span>
                  </div>
                  <div className="ed-ob-preview-bar-track">
                    <div className="ed-ob-preview-bar-fill" style={{ width: '80%', background: 'var(--color-cyan)' }} />
                  </div>
                  <div className="ed-ob-preview-bar-track" style={{ marginTop: 6 }}>
                    <div className="ed-ob-preview-bar-fill" style={{ width: '55%', background: 'var(--color-cyan-dark)' }} />
                  </div>
                  <div className="ed-ob-preview-bar-track" style={{ marginTop: 6 }}>
                    <div className="ed-ob-preview-bar-fill" style={{ width: '35%', background: 'var(--color-silver-dark)' }} />
                  </div>
                </div>
                <div className="ed-ob-preview-card">
                  <div className="ed-ob-preview-row">
                    <span className="ed-ob-preview-dot green" />
                    <span>Regional P&amp;L Breakdown</span>
                  </div>
                  <div className="ed-ob-preview-region-list">
                    <div className="ed-ob-preview-region">
                      <span>North America</span><span className="pos">+$1.2M</span>
                    </div>
                    <div className="ed-ob-preview-region">
                      <span>Europe</span><span className="pos">+$840K</span>
                    </div>
                    <div className="ed-ob-preview-region">
                      <span>Middle East</span><span className="pos">+$480K</span>
                    </div>
                  </div>
                </div>
                <div className="ed-ob-preview-card">
                  <div className="ed-ob-preview-row">
                    <span className="ed-ob-preview-dot orange" />
                    <span>Tax Exposure by Jurisdiction</span>
                  </div>
                  <div className="ed-ob-preview-region-list">
                    <div className="ed-ob-preview-region">
                      <span>US Federal + State</span><span>$142K</span>
                    </div>
                    <div className="ed-ob-preview-region">
                      <span>UK Corporation Tax</span><span>$88K</span>
                    </div>
                    <div className="ed-ob-preview-region">
                      <span>UAE Corporate Tax</span><span>$34K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  BAND 2 — Activity & Money Movement — Branch View  */}
      {!loading && viewMode === 'branches' && branchData.length > 0 && (
        <section className="ed-band">
          <h2 className="section-sub-heading">Branch Overview ({branchData.length} entities)
          </h2>

          {/* Revenue by branch — performance bars */}
          <div className="ent-card">
            <div className="ent-card-header">
              <h3 className="ent-card-title">Revenue by Branch</h3>
            </div>
            {sortedBranches.map(branch => {
              const pct = totalRevenue ? (branch.revenue / totalRevenue) * 100 : 0;
              return (
                <div
                  className="perf-bar-row"
                  key={branch.id}
                  onClick={() => navigate(`/app/enterprise/entities/${branch.id}/dashboard`)}
                >
                  <div className="pbr-label">
                    <span className="pbr-name">{branch.name}</span>
                    <span className="pbr-country">{branch.country}</span>
                  </div>
                  <div className="pbr-track">
                    <div
                      className="pbr-fill"
                      style={{ width: `${pct}%`, background: branch.profit >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}
                    />
                  </div>
                  <div className="pbr-values">
                    <span className="pbr-rev">{fmt(branch.revenue)}</span>
                    <span className={`pbr-profit ${branch.profit >= 0 ? 'pos' : 'neg'}`}>

                      {fmt(Math.abs(branch.profit))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branch cards — 3-per-row grid */}
          <div className="grid-12 section-gap-sm">
            {sortedBranches.map(branch => (
              <div className="col-4" key={branch.id}>
                <div
                  className="ent-card ent-card--clickable"
                  onClick={() => navigate(`/app/enterprise/entities/${branch.id}/dashboard`)}
                >
                  <div className="ebc-header">
                    <div className="ebc-flag">
                       {branch.country}
                    </div>
                    <span className={`status-pill ${branch.status}`}>{branch.status}</span>
                  </div>
                  <div className="ebc-name">{branch.name}</div>
                  <div className="ebc-type">{branch.entity_type?.replace('_', '')}</div>
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
                        width: `${branch.revenue ? Math.max(0, (branch.profit / branch.revenue) * 100) : 0}%`,
                        background: branch.profit >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                      }}
                    />
                  </div>
                  <div className="ebc-margin-label">
                    {branch.revenue ? ((branch.profit / branch.revenue) * 100).toFixed(1) : 0}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/*  BAND 2 — Activity & Money Movement — Regional View  */}
      {!loading && viewMode === 'regions' && Object.keys(regionData).length > 0 && (
        <section className="ed-band">
          <h2 className="section-sub-heading">Regional Operations ({Object.keys(regionData).length} regions)
          </h2>
          <div className="grid-12">
            {Object.values(regionData)
              .sort((a, b) => b.revenue - a.revenue)
              .map(region => (
                <div className="col-4" key={region.region}>
                  <div className="ent-card ent-card--clickable">
                    <div className="erc-header">
                      <div className="erc-icon"></div>
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
                             {b.name}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/*  BAND 3 — Alerts & Workflows  */}
      {orgOverview && (orgOverview.pending_tax_returns > 0 || orgOverview.missing_data_entities > 0) && (
        <section className="ed-band">
          <div className="ent-card">
            <div className="ent-card-header">
              <h3 className="ent-card-title ent-card-title--with-icon">
                Action Required
              </h3>
            </div>
            <div className="ed-alert-list">
              {orgOverview.pending_tax_returns > 0 && (
                <div className="ed-alert-item warning">

                  <span>{orgOverview.pending_tax_returns} tax return(s) pending. Review compliance status.</span>
                  <button
                    className="btn-alert-action"
                    onClick={() => navigate('/app/enterprise/tax-compliance')}
                  >View →
                  </button>
                </div>
              )}
              {orgOverview.missing_data_entities > 0 && (
                <div className="ed-alert-item info">

                  <span>{orgOverview.missing_data_entities} entity(ies) have incomplete data.</span>
                  <button
                    className="btn-alert-action"
                    onClick={() => navigate('/app/enterprise/entities')}
                  >Fix →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default EnterpriseDashboard;
