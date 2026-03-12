import React, { useEffect, useState } from 'react';
import { taxAPI } from '../../services/api';

const TaxWidget = () => {
  const [countries, setCountries] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    taxAPI.list()
      .then(res => setCountries(res.data || []))
      .catch(() => setCountries([]));
  }, []);

  const filtered = countries.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())
  );

  const selectCountry = (c) => {
    setSelected(c);
  };

  return (
    <div className="tax-widget">
      <h3>Global Tax Directory</h3>
      <p className="widget-sub">Search tax rules & payment portals (no login required)</p>
      <div className="tax-search">
        <input
          type="text"
          placeholder="Search country or code (e.g., United States, US)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="tax-input"
        />
        <div className="tax-list">
          {filtered.slice(0, 20).map(c => (
            <button key={c.code} className="tax-item" onClick={() => selectCountry(c)}>
              {c.name} ({c.code})
            </button>
          ))}
          {filtered.length === 0 && <div className="tax-empty">No countries found</div>}
        </div>
      </div>

      {selected && (
        <div className="tax-details">
          <h4>{selected.name} — {selected.code}</h4>
          <div className="detail-row">
            <strong>Region:</strong> <span>{selected.region || '—'}</span>
          </div>
          <div className="detail-row">
            <strong>Tax Authority:</strong> <a href={selected.tax_authority?.website || '#'} rel="noreferrer">{selected.tax_authority?.name || '—'}</a>
          </div>
          <div className="detail-row">
            <strong>Payment Portal:</strong> {selected.tax_authority?.payment_portal ? (<a href={selected.tax_authority.payment_portal} rel="noreferrer">Open Portal</a>) : 'Not available'}
          </div>

          <div className="links-section">
            <h5>Tax Summaries</h5>
            <ul>
              {selected.links?.corporate_tax_summary && <li><a href={selected.links.corporate_tax_summary} rel="noreferrer">Corporate Tax Summary</a></li>}
              {selected.links?.personal_income_tax_summary && <li><a href={selected.links.personal_income_tax_summary} rel="noreferrer">Personal Income Tax Summary</a></li>}
              {selected.links?.vat_or_indirect_tax_summary && <li><a href={selected.links.vat_or_indirect_tax_summary} rel="noreferrer">VAT / Indirect Tax Summary</a></li>}
            </ul>
          </div>

          <div className="tasks-section">
            <h5>Actions</h5>
            <div className="tasks-list">
              {selected.supported_tasks?.includes('open_tax_payment_portal') && (
                <a className="task-btn" href={selected.tax_authority?.payment_portal} rel="noreferrer">Pay Tax Online</a>
              )}
              {selected.supported_tasks?.includes('basic_tax_estimator') && (
                <button className="task-btn" onClick={() => alert('Basic tax estimator coming soon for ' + selected.name)}>Estimate Tax</button>
              )}
              {selected.supported_tasks?.includes('country_comparison') && (
                <button className="task-btn" onClick={() => alert('Country comparison coming soon')}>Compare Countries</button>
              )}
              {selected.supported_tasks?.includes('corporate_vs_personal_compare') && (
                <button className="task-btn" onClick={() => alert('Corporate vs Personal comparison coming soon')}>Corporate vs Personal</button>
              )}
            </div>
          </div>

          <div className="references">
            <h5>Global References</h5>
            <ul>
              {selected.links?.global_references?.map((r, i) => (
                <li key={i}><a href={r.url} rel="noreferrer">{r.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxWidget;
