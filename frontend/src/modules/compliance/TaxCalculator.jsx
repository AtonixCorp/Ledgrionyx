import React, { useEffect, useMemo, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import '../../pages/Enterprise/EnterpriseTaxCompliance.css';
import '../../pages/Enterprise/EnterpriseActionPages.css';

const TaxCalculator = () => {
  const {
    entities,
    fetchEntityTaxCalculations,
    calculateTax,
  } = useEnterprise();

  const [selectedEntityId, setSelectedEntityId] = useState('');
  const selectedEntity = useMemo(() => {
    if (!selectedEntityId) return null;
    return entities.find((e) => String(e.id) === String(selectedEntityId)) || null;
  }, [entities, selectedEntityId]);

  const [taxCalculations, setTaxCalculations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [taxCalculationMode, setTaxCalculationMode] = useState('automatic');
  const [taxCalcForm, setTaxCalcForm] = useState({
    tax_year: new Date().getFullYear(),
    calculation_type: 'corporate',
    jurisdiction: '',
    taxable_income: '',
    tax_rate: '',
  });

  useEffect(() => {
    if (!selectedEntity) return;
    setTaxCalcForm((prev) => ({
      ...prev,
      jurisdiction: prev.jurisdiction || selectedEntity.country || '',
    }));
  }, [selectedEntity]);

  useEffect(() => {
    if (selectedEntityId) return;
    if (!entities || entities.length === 0) return;
    setSelectedEntityId(String(entities[0].id));
  }, [entities, selectedEntityId]);

  useEffect(() => {
    if (!selectedEntityId) return;
    fetchEntityTaxCalculations(selectedEntityId)
      .then((calcs) => setTaxCalculations(calcs || []))
      .catch((err) => setDataError(err?.message || 'Failed to load calculations'));
  }, [selectedEntityId, fetchEntityTaxCalculations]);

  const calculations = useMemo(() => {
    const empty = {
      incomeTax: { amount: 0, breakdown: { salary: 0, business: 0 }, lastCalculated: null },
      capitalGains: { amount: 0, breakdown: { stocks: 0, crypto: 0 }, lastCalculated: null },
      dividends: { amount: 0, breakdown: { qualified: 0, ordinary: 0 }, lastCalculated: null },
      withholding: { amount: 0, breakdown: { federal: 0, state: 0 }, lastCalculated: null },
      vat: { amount: 0, breakdown: { sales: 0, imports: 0 }, lastCalculated: null },
      quarterlyProjection: { amount: 0, confidence: 0, lastProjected: null },
    };
    if (!Array.isArray(taxCalculations) || taxCalculations.length === 0) return empty;
    const sorted = [...taxCalculations].sort((a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const latestCorporate = sorted.find((c) => c.calculation_type === 'corporate') || null;
    const latestVat = sorted.find((c) => c.calculation_type === 'vat') || null;
    return {
      ...empty,
      incomeTax: latestCorporate
        ? { amount: Number(latestCorporate.calculated_tax || 0), breakdown: { salary: 0, business: Number(latestCorporate.taxable_income || 0) }, lastCalculated: latestCorporate.created_at || null }
        : empty.incomeTax,
      vat: latestVat
        ? { amount: Number(latestVat.calculated_tax || 0), breakdown: { sales: Number(latestVat.taxable_income || 0), imports: 0 }, lastCalculated: latestVat.created_at || null }
        : empty.vat,
    };
  }, [taxCalculations]);

  const handleRunTaxCalculation = async () => {
    if (!selectedEntityId) return;
    if (!taxCalcForm.tax_year || !taxCalcForm.calculation_type || !taxCalcForm.jurisdiction) {
      setDataError('Please fill Tax Year, Type, and Jurisdiction');
      return;
    }
    setIsLoading(true);
    setDataError(null);
    try {
      await calculateTax({
        entity: selectedEntityId,
        tax_year: taxCalcForm.tax_year,
        calculation_type: taxCalcForm.calculation_type,
        jurisdiction: taxCalcForm.jurisdiction,
        taxable_income: taxCalcForm.taxable_income || 0,
        tax_rate: taxCalcForm.tax_rate || 0,
        deductions: {},
        credits: {},
      });
      const refreshed = await fetchEntityTaxCalculations(selectedEntityId);
      setTaxCalculations(refreshed || []);
    } catch (err) {
      setDataError(err?.message || 'Tax calculation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="enterprise-action-page">
      <section className="action-page-hero">
        <div className="action-page-copy">
          <span className="action-page-kicker">Compliance — Tax Calculator</span>
          <h1 className="action-page-title">Auto Tax Calculation Engine</h1>
          <p className="action-page-subtitle">Real-time tax calculations across all income types and jurisdictions.</p>
          <div className="action-page-actions">
            <select
              className="entity-selector"
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              disabled={!entities || entities.length === 0}
            >
              {(!entities || entities.length === 0) ? (
                <option value="">No entities</option>
              ) : (
                entities.map((ent) => (
                  <option key={ent.id} value={String(ent.id)}>
                    {ent.name} ({ent.country})
                  </option>
                ))
              )}
            </select>
            {dataError && <span className="status-badge warning">{dataError}</span>}
          </div>
        </div>
        <div className="action-page-badge">{selectedEntity?.country || 'Global'}</div>
      </section>

      <div className="tax-calculator-section">
        <div className="section-header">
          <h2>Calculation Settings</h2>
          <div className="header-actions">
            <div className="calculation-mode">
              <label>Mode:</label>
              <select
                value={taxCalculationMode}
                onChange={(e) => setTaxCalculationMode(e.target.value)}
              >
                <option value="automatic">Automatic</option>
                <option value="manual">Manual Review</option>
                <option value="simulation">Simulation</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleRunTaxCalculation} disabled={!selectedEntityId || isLoading}>
              {isLoading ? 'Calculating…' : 'Run Calculation'}
            </button>
          </div>
        </div>

        <div className="tax-calc-form">
          <div className="tax-calc-field">
            <label>Tax Year</label>
            <input type="number" value={taxCalcForm.tax_year}
              onChange={(e) => setTaxCalcForm({ ...taxCalcForm, tax_year: e.target.value })}
              min="2000" max="2100" />
          </div>
          <div className="tax-calc-field">
            <label>Type</label>
            <select value={taxCalcForm.calculation_type}
              onChange={(e) => setTaxCalcForm({ ...taxCalcForm, calculation_type: e.target.value })}>
              <option value="corporate">Corporate Tax</option>
              <option value="vat">VAT / Sales Tax</option>
              <option value="withholding">Withholding Tax</option>
              <option value="property">Property Tax</option>
              <option value="personal">Personal Income Tax</option>
            </select>
          </div>
          <div className="tax-calc-field">
            <label>Jurisdiction</label>
            <input type="text" value={taxCalcForm.jurisdiction}
              onChange={(e) => setTaxCalcForm({ ...taxCalcForm, jurisdiction: e.target.value })}
              placeholder="e.g. Nigeria" />
          </div>
          <div className="tax-calc-field">
            <label>Taxable Income</label>
            <input type="number" value={taxCalcForm.taxable_income}
              onChange={(e) => setTaxCalcForm({ ...taxCalcForm, taxable_income: e.target.value })}
              placeholder="0" min="0" />
          </div>
          <div className="tax-calc-field">
            <label>Tax Rate (%)</label>
            <input type="number" value={taxCalcForm.tax_rate}
              onChange={(e) => setTaxCalcForm({ ...taxCalcForm, tax_rate: e.target.value })}
              placeholder="0" min="0" step="0.01" />
          </div>
        </div>

        <div className="calculation-status">
          <div className="status-indicator">
            <span>Last calculated:{' '}
              {calculations.incomeTax.lastCalculated
                ? new Date(calculations.incomeTax.lastCalculated).toLocaleString()
                : '—'}
            </span>
          </div>
        </div>

        <div className="calculator-grid">
          <div className="calculation-card income-tax">
            <div className="calc-header">
              <h3>Income Tax</h3>
              <span className="calc-amount">${calculations.incomeTax.amount.toLocaleString()}</span>
            </div>
            <div className="calc-breakdown">
              <h4>Breakdown by Source</h4>
              <div className="breakdown-items">
                <div className="breakdown-item"><span>Salary Income:</span><span>${calculations.incomeTax.breakdown.salary.toLocaleString()}</span></div>
                <div className="breakdown-item"><span>Business Income:</span><span>${calculations.incomeTax.breakdown.business.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="calc-details">
              <p>Calculated across 3 jurisdictions using latest tax rules</p>
              {calculations.incomeTax.lastCalculated && (
                <div className="calc-meta"><span>Last updated: {new Date(calculations.incomeTax.lastCalculated).toLocaleDateString()}</span></div>
              )}
            </div>
          </div>

          <div className="calculation-card capital-gains">
            <div className="calc-header">
              <h3>Capital Gains Tax</h3>
              <span className="calc-amount">${calculations.capitalGains.amount.toLocaleString()}</span>
            </div>
            <div className="calc-breakdown">
              <h4>Breakdown by Asset Type</h4>
              <div className="breakdown-items">
                <div className="breakdown-item"><span>Stocks:</span><span>${calculations.capitalGains.breakdown.stocks.toLocaleString()}</span></div>
                <div className="breakdown-item"><span>Cryptocurrency:</span><span>${calculations.capitalGains.breakdown.crypto.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="calc-details"><p>Short-term and long-term gains calculated separately</p></div>
          </div>

          <div className="calculation-card dividends">
            <div className="calc-header">
              <h3>Dividends Tax</h3>
              <span className="calc-amount">${calculations.dividends.amount.toLocaleString()}</span>
            </div>
            <div className="calc-breakdown">
              <h4>Breakdown by Type</h4>
              <div className="breakdown-items">
                <div className="breakdown-item"><span>Qualified:</span><span>${calculations.dividends.breakdown.qualified.toLocaleString()}</span></div>
                <div className="breakdown-item"><span>Ordinary:</span><span>${calculations.dividends.breakdown.ordinary.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="calc-details"><p>Qualified dividends taxed at capital gains rates</p></div>
          </div>

          <div className="calculation-card withholding">
            <div className="calc-header">
              <h3>Withholding Tax</h3>
              <span className="calc-amount">${calculations.withholding.amount.toLocaleString()}</span>
            </div>
            <div className="calc-breakdown">
              <h4>Breakdown by Jurisdiction</h4>
              <div className="breakdown-items">
                <div className="breakdown-item"><span>Federal:</span><span>${calculations.withholding.breakdown.federal.toLocaleString()}</span></div>
                <div className="breakdown-item"><span>State:</span><span>${calculations.withholding.breakdown.state.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="calc-details"><p>Automatically calculated from payroll data</p></div>
          </div>

          <div className="calculation-card vat">
            <div className="calc-header">
              <h3>VAT / Sales Tax</h3>
              <span className="calc-amount">${calculations.vat.amount.toLocaleString()}</span>
            </div>
            <div className="calc-breakdown">
              <h4>Breakdown by Type</h4>
              <div className="breakdown-items">
                <div className="breakdown-item"><span>Sales Tax:</span><span>${calculations.vat.breakdown.sales.toLocaleString()}</span></div>
                <div className="breakdown-item"><span>Import VAT:</span><span>${calculations.vat.breakdown.imports.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="calc-details"><p>Multi-jurisdiction VAT calculations</p></div>
          </div>

          <div className="calculation-card projection">
            <div className="calc-header">
              <h3>Quarterly Projection</h3>
              <span className="calc-amount">${calculations.quarterlyProjection.amount.toLocaleString()}</span>
            </div>
            <div className="calc-confidence">
              <div className="confidence-meter">
                <span>Projection Confidence: {calculations.quarterlyProjection.confidence}%</span>
                <div className="confidence-bar">
                  <div className="confidence-fill" style={{ width: `${calculations.quarterlyProjection.confidence}%` }}></div>
                </div>
              </div>
            </div>
            <div className="calc-details"><p>AI-powered projections based on historical data and trends</p></div>
          </div>
        </div>

        <div className="taxable-events">
          <h3>Recent Taxable Events Detected</h3>
          <div className="events-list">
            <div className="event-item">
              <div className="event-content">
                <h4>Stock Sale - AAPL (500 shares)</h4>
                <p>Capital gain of $12,450 detected and automatically calculated</p>
                <span className="event-date">Jan 15, 2025</span>
              </div>
              <div className="event-status"><span className="status-badge processed">Calculated</span></div>
            </div>
            <div className="event-item">
              <div className="event-content">
                <h4>Dividend Payment - MSFT</h4>
                <p>Qualified dividend of $890 received and taxed at 15%</p>
                <span className="event-date">Jan 12, 2025</span>
              </div>
              <div className="event-status"><span className="status-badge processed">Calculated</span></div>
            </div>
            <div className="event-item">
              <div className="event-content">
                <h4>Business Income - Consulting</h4>
                <p>$25,000 business income classified and QBI deduction applied</p>
                <span className="event-date">Jan 10, 2025</span>
              </div>
              <div className="event-status"><span className="status-badge processed">Calculated</span></div>
            </div>
          </div>
        </div>

        <div className="income-classification">
          <h3>Auto Income Classification</h3>
          <p>Transactions automatically classified by income type</p>
          <div className="classification-stats">
            <div className="classification-item">
              <div className="classification-info"><h4>Business Income</h4><p>$132,230 classified (89% accuracy)</p></div>
            </div>
            <div className="classification-item">
              <div className="classification-info"><h4>Investment Income</h4><p>$45,670 classified (94% accuracy)</p></div>
            </div>
            <div className="classification-item">
              <div className="classification-info"><h4>Crypto Transactions</h4><p>$28,450 classified (96% accuracy)</p></div>
            </div>
            <div className="classification-item">
              <div className="classification-info"><h4>Real Estate</h4><p>$67,890 classified (91% accuracy)</p></div>
            </div>
          </div>
        </div>

        <div className="calculation-controls">
          <h3>Calculation Controls</h3>
          <div className="controls-grid">
            <button className="control-btn" onClick={handleRunTaxCalculation} disabled={isLoading}>Recalculate All</button>
            <button className="control-btn">Export Calculations</button>
            <button className="control-btn">Review Assumptions</button>
            <button className="control-btn">Adjust Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
