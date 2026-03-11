import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import taxCalculatorService from '../../services/taxCalculatorService';

const FinancialSettings = () => {
  const {
    userCountry,
    userTaxRate,
    userTaxType,
    updateUserCountry,
    updateUserTaxType,
    updateUserTaxRate,
    financialSummary,
    validationService
  } = useFinance();

  const [selectedCountry, setSelectedCountry] = useState(userCountry);
  const [customTaxRate, setCustomTaxRate] = useState(userTaxRate);
  const [taxType, setTaxType] = useState(userTaxType || 'corporate');
  const [countries, setCountries] = useState([]);
  const [validation, setValidation] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const countryList = taxCalculatorService.getCountries();
    setCountries(countryList);
  }, []);

  useEffect(() => {
    setSelectedCountry(userCountry);
    setCustomTaxRate(userTaxRate);
    setTaxType(userTaxType || 'corporate');
  }, [userCountry, userTaxRate, userTaxType]);

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    const taxInfo = taxCalculatorService.getTaxInfo(country);
    if (taxInfo) {
      const rate = taxType === 'personal' ? taxInfo.personal :
                   taxType === 'vat' ? taxInfo.vat :
                   taxInfo.rate;
      setCustomTaxRate(rate);
    }
    setSaved(false);
  };

  const handleTaxTypeChange = (type) => {
    setTaxType(type);
    const taxInfo = taxCalculatorService.getTaxInfo(selectedCountry);
    if (taxInfo) {
      const rate = type === 'personal' ? taxInfo.personal :
                   type === 'vat' ? taxInfo.vat :
                   taxInfo.rate;
      setCustomTaxRate(rate);
    }
    setSaved(false);
  };

  const handleTaxRateChange = (rate) => {
    setCustomTaxRate(parseFloat(rate));
    const validation = validationService.validateTaxRate(rate, selectedCountry);
    setValidation(validation);
    setSaved(false);
  };

  const handleSave = async () => {
    await updateUserCountry(selectedCountry);
    await updateUserTaxType(taxType);
    const success = await updateUserTaxRate(customTaxRate);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const getTaxInfo = () => {
    return taxCalculatorService.getTaxInfo(selectedCountry);
  };

  const taxInfo = getTaxInfo();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Financial Settings</h1>
        <p className="page-subtitle">Configure your location and tax settings for accurate calculations</p>
      </div>

      {saved && (
        <div className="save-notification">
          Settings saved successfully! All calculations have been updated.
        </div>
      )}

      {/* Country Selection */}
      <div className="card settings-card">
        <h2>Country & Location</h2>
        <p className="setting-description">Select your country to automatically apply the correct tax rates and currency.
        </p>

        <div className="form-group">
          <label htmlFor="country">Country</label>
          <select
            id="country"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="form-control"
          >
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {taxInfo && (
          <div className="country-info">
            <div className="info-row">
              <span className="info-label">Country Code:</span>
              <span className="info-value">{taxInfo.code || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Currency:</span>
              <span className="info-value">
                {taxInfo.currency || 'USD'} ({taxInfo.currencySymbol || '$'})
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Last Updated:</span>
              <span className="info-value">{taxInfo.lastUpdated}</span>
            </div>
            {taxInfo.aiVerified && (
              <div className="info-row">
                <span className="ai-badge">AI Verified</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tax Settings */}
      <div className="card settings-card">
        <h2>Tax Configuration</h2>
        <p className="setting-description">Choose your tax type and rate. This affects all income and expense calculations.
        </p>

        <div className="form-group">
          <label htmlFor="taxType">Tax Type</label>
          <select
            id="taxType"
            value={taxType}
            onChange={(e) => handleTaxTypeChange(e.target.value)}
            className="form-control"
          >
            <option value="corporate">Corporate Tax</option>
            <option value="personal">Personal Income Tax</option>
            <option value="vat">VAT/Sales Tax</option>
          </select>
        </div>

        {taxInfo && (
          <div className="tax-rates-display">
            <div className="rate-item">
              <span>Corporate:</span>
              <strong>{taxInfo.rate}%</strong>
            </div>
            <div className="rate-item">
              <span>Personal:</span>
              <strong>{taxInfo.personal}%</strong>
            </div>
            <div className="rate-item">
              <span>VAT:</span>
              <strong>{taxInfo.vat}%</strong>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="taxRate">Custom Tax Rate (%)</label>
          <input
            type="number"
            id="taxRate"
            value={customTaxRate}
            onChange={(e) => handleTaxRateChange(e.target.value)}
            min="0"
            max="100"
            step="0.1"
            className="form-control"
          />
          <small className="form-hint">Adjust if your actual rate differs from the standard rate
          </small>
        </div>

        {validation && (
          <div className={`validation-message ${validation.isValid ? 'valid' : 'invalid'}`}>
            {validation.isValid ? (
              <span>Valid tax rate</span>
            ) : (
              <span> {validation.errors.join(', ')}</span>
            )}
            {validation.warnings && validation.warnings.length > 0 && (
              <div className="warnings">
                {validation.warnings.map((warning, index) => (
                  <p key={index}> {warning}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {taxInfo && taxInfo.notes && (
          <div className="tax-notes">
            <strong>Note:</strong> {taxInfo.notes}
          </div>
        )}
      </div>

      {/* Current Impact Summary */}
      {financialSummary && (
        <div className="card impact-card">
          <h2>Tax Impact on Your Finances</h2>
          <div className="impact-grid">
            <div className="impact-item">
              <label>Gross Income</label>
              <span className="value">${financialSummary.income.gross.toFixed(2)}</span>
            </div>
            <div className="impact-item highlight">
              <label>Tax Amount ({customTaxRate}%)</label>
              <span className="value tax">${financialSummary.tax.amount.toFixed(2)}</span>
            </div>
            <div className="impact-item">
              <label>Net Income</label>
              <span className="value net">${financialSummary.income.net.toFixed(2)}</span>
            </div>
            <div className="impact-item">
              <label>Effective Rate</label>
              <span className="value">{financialSummary.tax.effectiveRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="settings-actions">
        <button
          className="btn-primary btn-large"
          onClick={handleSave}
        >Save Settings
        </button>
      </div>

      {/* Information Panel */}
      <div className="card info-panel">
        <h3>How This Works</h3>
        <ul>
          <li>All income calculations automatically deduct tax based on your settings</li>
          <li>Budget and expense tracking reflect after-tax amounts</li>
          <li>Dashboard shows both gross and net values</li>
          <li>Changing settings recalculates everything in real-time</li>
          <li>AI validates your tax settings and warns about unusual values</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialSettings;
