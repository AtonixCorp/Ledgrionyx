import React, { useEffect, useState } from 'react';

import { taxAPI } from '../../services/api';
import localCountries from '../../data/tax/countries.json';
import './GlobalTax.css';

const GlobalTax = () => {
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [regionFilter, setRegionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    taxAPI.list()
      .then(res => setCountries(res.data || localCountries))
      .catch(() => setCountries(localCountries))
      .finally(() => setLoading(false));
  }, []);

  const regions = ['Africa', 'Americas', 'Asia', 'Europe', 'Oceania', 'Territories'].filter(
    r => countries.some(c => c.region === r)
  );

  const filtered = countries
    .filter(c => (regionFilter ? c.region === regionFilter : true))
    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="global-tax-page">
      {/* Hero Section */}
      <div className="tax-hero">
        <div className="tax-hero-content">
          <h1 className="tax-hero-title">Global Tax Directory</h1>
          <p className="tax-hero-subtitle">Comprehensive tax guidance for 200+ jurisdictions worldwide</p>
          <p className="tax-hero-description">Access verified tax authority information, payment portals, and expert summaries from PwC, Deloitte, and EY.
            No login required.
          </p>
        </div>
      </div>

      {/* Search & Filter Section */}
      <div className="tax-search-section">
        <div className="tax-search-container">
          <div className="search-input-wrapper">

            <input
              className="tax-search-input"
              placeholder="Search by country name or code (e.g., United States, US)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="tax-region-select">
            <option value="">All Regions</option>
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <span className="results-count">{filtered.length} jurisdictions</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="tax-content-wrapper">
        {loading ? (
          <div className="tax-loading">
            <div className="spinner"></div>
            <p>Loading tax data...</p>
          </div>
        ) : (
          <div className="tax-grid">
            {/* Countries List */}
            <div className="tax-list-wrapper">
              <div className="tax-list-header">
                <h3>Jurisdictions</h3>
                <span className="list-count">{filtered.length}</span>
              </div>
              <div className="tax-list">
                {filtered.map(c => (
                  <div
                    key={c.code}
                    className={`tax-list-item ${selected?.code === c.code ? 'active' : ''}`}
                    onClick={() => setSelected(c)}
                  >
                    <div className="item-content">
                      <div className="country-name">{c.name}</div>
                      <div className="country-region">{c.region}</div>
                    </div>
                    <div className="country-code">{c.code}</div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="empty-list">No jurisdictions match your search</div>
                )}
              </div>
            </div>

            {/* Details Panel */}
            <div className="tax-details-wrapper">
              {!selected ? (
                <div className="empty-panel">
                  <div className="empty-icon"></div>
                  <h3>Select a Jurisdiction</h3>
                  <p>Choose a country from the list to view comprehensive tax information</p>
                </div>
              ) : (
                <div className="country-details">
                  {/* Header */}
                  <div className="details-header">
                    <div className="header-title">
                      <h2>{selected.name}</h2>
                      <span className="country-code-badge">{selected.code}</span>
                    </div>
                    <span className="region-badge">{selected.region}</span>
                  </div>

                  {/* Tax Authority */}
                  <div className="section-card authority-card">
                    <h4 className="section-title">Tax Authority</h4>
                    <div className="authority-info">
                      <div className="info-row">
                        <span className="label">Official Name:</span>
                        <span className="value">{selected.tax_authority?.name || '—'}</span>
                      </div>
                      {selected.tax_authority?.website && (
                        <a href={selected.tax_authority.website} target="_blank" rel="noreferrer" className="primary-link">Visit Tax Authority Website →
                        </a>
                      )}
                      {selected.tax_authority?.payment_portal && (
                        <a href={selected.tax_authority.payment_portal} target="_blank" rel="noreferrer" className="secondary-link">Payment Portal →
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Tax Summaries */}
                  <div className="section-card summaries-card">
                    <h4 className="section-title">Tax Summaries</h4>
                    <div className="summaries-grid">
                      {selected.links?.corporate_tax_summary && (
                        <a href={selected.links.corporate_tax_summary} target="_blank" rel="noreferrer" className="summary-link">
                          <span className="icon"></span>
                          <span>Corporate Tax</span>
                        </a>
                      )}
                      {selected.links?.personal_income_tax_summary && (
                        <a href={selected.links.personal_income_tax_summary} target="_blank" rel="noreferrer" className="summary-link">
                          <span className="icon"></span>
                          <span>Personal Tax</span>
                        </a>
                      )}
                      {selected.links?.vat_or_indirect_tax_summary && (
                        <a href={selected.links.vat_or_indirect_tax_summary} target="_blank" rel="noreferrer" className="summary-link">
                          <span className="icon"></span>
                          <span>VAT / GST</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Global References */}
                  <div className="section-card references-card">
                    <h4 className="section-title">Expert References</h4>
                    <div className="references-list">
                      {selected.links?.global_references?.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noreferrer" className="reference-link">
                          <span className="ref-icon"></span>
                          <span>{r.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {selected.supported_tasks && selected.supported_tasks.length > 0 && (
                    <div className="section-card actions-card">
                      <h4 className="section-title">Quick Actions</h4>
                      <div className="actions-grid">
                        {selected.supported_tasks?.includes('open_tax_payment_portal') && selected.tax_authority?.payment_portal && (
                          <a
                            href={selected.tax_authority.payment_portal}
                            target="_blank"
                            rel="noreferrer"
                            className="action-btn primary-btn"
                          >Pay Tax Online
                          </a>
                        )}
                        {selected.supported_tasks?.includes('basic_tax_estimator') && (
                          <button className="action-btn secondary-btn" onClick={() => alert('Basic estimator coming soon for ' + selected.name)}>Estimate Tax
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTax;
