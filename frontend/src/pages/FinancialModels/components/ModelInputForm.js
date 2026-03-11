import React, { useState } from 'react';

/**
 * Model Input Form Component
 * Handles financial model parameter input
 * Integrates with Phase 2: Input Processing Engine
 */
const ModelInputForm = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState(initialData || {
    modelType: 'dcf', // dcf, comparable, merger
    companyName: '',
    industryCode: '',
    reportingCurrency: 'USD',
    fiscalYearEnd: '12-31',

    // Financial Inputs
    revenue: '',
    revenueGrowth: '',
    operatingMargin: '',
    taxRate: '',
    capex: '',
    workingCapital: '',

    // Assumptions
    discountRate: '',
    terminalGrowthRate: '',
    projectionYears: 5,

    // Entity Structure
    entityType: 'corporation', // corporation, partnership, sole_proprietor
    equityPercentage: 100,
    debtAmount: 0,

    // Country & Compliance
    country: 'US',
    accountingStandard: 'GAAP', // GAAP, IFRS
  });

  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  /**
   * Validate form inputs
   */
  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.revenue) newErrors.revenue = 'Revenue is required';
    if (!formData.operatingMargin && formData.operatingMargin !== 0) newErrors.operatingMargin = 'Operating margin is required';
    if (!formData.discountRate) newErrors.discountRate = 'Discount rate is required';

    // Range validation
    if (formData.revenue < 0) newErrors.revenue = 'Revenue must be positive';
    if (formData.operatingMargin < -100 || formData.operatingMargin > 100) {
      newErrors.operatingMargin = 'Operating margin must be between -100 and 100';
    }
    if (formData.taxRate < 0 || formData.taxRate > 100) {
      newErrors.taxRate = 'Tax rate must be between 0 and 100';
    }
    if (formData.discountRate < 0 || formData.discountRate > 100) {
      newErrors.discountRate = 'Discount rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || '' : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      console.warn('Form validation failed', errors);
      return;
    }

    console.log('Form validation passed, submitting model...', formData);
    onSubmit(formData);
  };

  /**
   * Fill with example data
   */
  const loadExample = () => {
    setFormData({
      ...formData,
      companyName: 'TechCorp Inc.',
      industryCode: 'IT-Software',
      revenue: 500000000,
      revenueGrowth: 15,
      operatingMargin: 25,
      taxRate: 21,
      capex: 50000000,
      workingCapital: 75000000,
      discountRate: 8.5,
      terminalGrowthRate: 2.5,
      projectionYears: 5,
      country: 'US',
    });
  };

  return (
    <div className="model-input-form">
      <div className="form-header">
        <h2>Create Financial Model</h2>
        <button
          type="button"
          className="example-button"
          onClick={loadExample}
          disabled={isLoading}
        >Load Example
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        {/* Section Tabs */}
        <div className="form-sections">
          <button
            type="button"
            className={`section-tab ${activeSection === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveSection('basic')}
          >Basic Info
          </button>
          <button
            type="button"
            className={`section-tab ${activeSection === 'financial' ? 'active' : ''}`}
            onClick={() => setActiveSection('financial')}
          >Financial
          </button>
          <button
            type="button"
            className={`section-tab ${activeSection === 'assumptions' ? 'active' : ''}`}
            onClick={() => setActiveSection('assumptions')}
          >Assumptions
          </button>
          <button
            type="button"
            className={`section-tab ${activeSection === 'structure' ? 'active' : ''}`}
            onClick={() => setActiveSection('structure')}
          >Structure
          </button>
        </div>

        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <div className="form-section active">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label>Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Enter company name"
                disabled={isLoading}
              />
              {errors.companyName && <span className="error-text">{errors.companyName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Model Type</label>
                <select
                  name="modelType"
                  value={formData.modelType}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="dcf">DCF (Discounted Cash Flow)</option>
                  <option value="comparable">Comparable Companies</option>
                  <option value="merger">Merger & Acquisition</option>
                </select>
              </div>

              <div className="form-group">
                <label>Industry Code</label>
                <input
                  type="text"
                  name="industryCode"
                  value={formData.industryCode}
                  onChange={handleInputChange}
                  placeholder="e.g., IT-Software"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Reporting Currency</label>
                <select
                  name="reportingCurrency"
                  value={formData.reportingCurrency}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fiscal Year End</label>
                <input
                  type="text"
                  name="fiscalYearEnd"
                  value={formData.fiscalYearEnd}
                  onChange={handleInputChange}
                  placeholder="MM-DD"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {/* Financial Inputs Section */}
        {activeSection === 'financial' && (
          <div className="form-section active">
            <h3>Financial Inputs</h3>

            <div className="form-group">
              <label>Annual Revenue ({formData.reportingCurrency}) *</label>
              <input
                type="number"
                name="revenue"
                value={formData.revenue}
                onChange={handleInputChange}
                placeholder="0"
                step="1000000"
                disabled={isLoading}
              />
              {errors.revenue && <span className="error-text">{errors.revenue}</span>}
              <small>Last 12 months revenue</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Revenue Growth Rate (%)</label>
                <input
                  type="number"
                  name="revenueGrowth"
                  value={formData.revenueGrowth}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.1"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Operating Margin (%) *</label>
                <input
                  type="number"
                  name="operatingMargin"
                  value={formData.operatingMargin}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="0.1"
                  disabled={isLoading}
                />
                {errors.operatingMargin && <span className="error-text">{errors.operatingMargin}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tax Rate (%)</label>
                <input
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  placeholder="21"
                  step="0.1"
                  disabled={isLoading}
                />
                {errors.taxRate && <span className="error-text">{errors.taxRate}</span>}
              </div>

              <div className="form-group">
                <label>Capital Expenditure ({formData.reportingCurrency})</label>
                <input
                  type="number"
                  name="capex"
                  value={formData.capex}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="1000000"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Working Capital ({formData.reportingCurrency})</label>
              <input
                type="number"
                name="workingCapital"
                value={formData.workingCapital}
                onChange={handleInputChange}
                placeholder="0"
                step="1000000"
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Assumptions Section */}
        {activeSection === 'assumptions' && (
          <div className="form-section active">
            <h3>Valuation Assumptions</h3>

            <div className="form-group">
              <label>Discount Rate (WACC) (%) *</label>
              <input
                type="number"
                name="discountRate"
                value={formData.discountRate}
                onChange={handleInputChange}
                placeholder="8.5"
                step="0.1"
                disabled={isLoading}
              />
              {errors.discountRate && <span className="error-text">{errors.discountRate}</span>}
              <small>Weighted Average Cost of Capital</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Terminal Growth Rate (%)</label>
                <input
                  type="number"
                  name="terminalGrowthRate"
                  value={formData.terminalGrowthRate}
                  onChange={handleInputChange}
                  placeholder="2.5"
                  step="0.1"
                  disabled={isLoading}
                />
                <small>Perpetual growth rate</small>
              </div>

              <div className="form-group">
                <label>Projection Years</label>
                <select
                  name="projectionYears"
                  value={formData.projectionYears}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                  <option value="10">10 Years</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Entity Structure Section */}
        {activeSection === 'structure' && (
          <div className="form-section active">
            <h3>Entity Structure</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Entity Type</label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="corporation">Corporation</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietor">Sole Proprietor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Equity Ownership (%)</label>
                <input
                  type="number"
                  name="equityPercentage"
                  value={formData.equityPercentage}
                  onChange={handleInputChange}
                  placeholder="100"
                  step="0.1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Debt ({formData.reportingCurrency})</label>
                <input
                  type="number"
                  name="debtAmount"
                  value={formData.debtAmount}
                  onChange={handleInputChange}
                  placeholder="0"
                  step="1000000"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="DE">Germany</option>
                  <option value="FR">France</option>
                  <option value="JP">Japan</option>
                  <option value="IN">India</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Accounting Standard</label>
                <select
                  name="accountingStandard"
                  value={formData.accountingStandard}
                  onChange={handleInputChange}
                  disabled={isLoading}
                >
                  <option value="GAAP">GAAP (US)</option>
                  <option value="IFRS">IFRS (International)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Calculating...' : 'Calculate Model'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setFormData({
              ...formData,
              companyName: '',
              revenue: '',
              operatingMargin: '',
              discountRate: '',
            })}
            disabled={isLoading}
          >Clear Form
          </button>
        </div>
      </form>
    </div>
  );
};

export default ModelInputForm;
