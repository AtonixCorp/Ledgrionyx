import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import { useAuth } from '../../context/AuthContext';
import ATCLogo from '../../components/branding/ATCLogo';
import './CreateWorkspace.css';

/* ─────────────────────────────────────────────────────────────────────────────
   ATC Capital — Create Workspace
   Form to create a new company workspace (entity).
   On success: activates the new workspace and redirects to overview.
───────────────────────────────────────────────────────────────────────────── */

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
];

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar' },
];

const ENTITY_TYPES = [
  { value: 'corporation', label: 'Corporation' },
  { value: 'llc', label: 'LLC' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'non_profit', label: 'Non-Profit' },
  { value: 'holding_company', label: 'Holding Company' },
  { value: 'branch', label: 'Branch / Subsidiary' },
  { value: 'trust', label: 'Trust' },
];

const INDUSTRIES = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'retail', label: 'Retail & E-Commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
  { value: 'hospitality', label: 'Hospitality & Tourism' },
  { value: 'education', label: 'Education' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'logistics', label: 'Logistics & Supply Chain' },
  { value: 'energy', label: 'Energy & Utilities' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];

const FISCAL_YEAR_ENDS = [
  { value: '12-31', label: 'December 31 (Calendar Year)' },
  { value: '03-31', label: 'March 31' },
  { value: '06-30', label: 'June 30' },
  { value: '09-30', label: 'September 30' },
];

/* ─── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Company Identity' },
  { id: 2, label: 'Jurisdiction & Currency' },
  { id: 3, label: 'Fiscal & Structure' },
];

const EMPTY_FORM = {
  name: '',
  registrationNumber: '',
  businessType: 'corporation',
  industry: '',
  country: '',
  currency: 'USD',
  fiscalYearEnd: '12-31',
  taxRegime: '',
};

const CreateWorkspace = () => {
  const navigate = useNavigate();
  const { createWorkspace, createEntity, currentOrganization, setActiveWorkspace } = useEnterprise();
  const { user, logout } = useAuth();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const canGoNext = () => {
    if (step === 1) return form.name.trim().length >= 2;
    if (step === 2) return !!form.country && !!form.currency;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Company name is required'); return; }
    if (!form.country)     { setError('Country is required'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        country: form.country,
        entity_type: form.businessType,
        local_currency: form.currency,
        fiscal_year_end: form.fiscalYearEnd,
        status: 'active',
        organization_id: currentOrganization?.id,
        registration_number: form.registrationNumber || undefined,
      };

      // Use createWorkspace if available (wraps createEntity + activates), otherwise fall back
      let newWorkspace;
      if (typeof createWorkspace === 'function') {
        newWorkspace = await createWorkspace({
          organizationId: currentOrganization?.id,
          ...form,
        });
      } else {
        newWorkspace = await createEntity(payload);
        if (newWorkspace && typeof setActiveWorkspace === 'function') {
          setActiveWorkspace(newWorkspace);
        }
      }

      if (newWorkspace) {
        navigate('/app/overview/dashboard');
      }
    } catch (err) {
      setError(err?.message || 'Failed to create workspace. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="cw-step-fields">
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Company Name <span className="cw-required">*</span></label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. Acme Holdings Ltd"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoFocus
        />
        <span className="cw-hint">This will be displayed as the workspace name throughout ATC Capital.</span>
      </div>
      <div className="cw-field">
        <label className="cw-label">Registration Number <span className="cw-optional">(optional)</span></label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. 12345678"
          value={form.registrationNumber}
          onChange={(e) => update('registrationNumber', e.target.value)}
        />
      </div>
      <div className="cw-field">
        <label className="cw-label">Business Type</label>
        <select className="cw-select" value={form.businessType} onChange={(e) => update('businessType', e.target.value)}>
          {ENTITY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Industry</label>
        <select className="cw-select" value={form.industry} onChange={(e) => update('industry', e.target.value)}>
          <option value="">Select industry…</option>
          {INDUSTRIES.map((i) => <option key={i.value} value={i.value}>{i.label}</option>)}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cw-step-fields">
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Country of Incorporation <span className="cw-required">*</span></label>
        <select className="cw-select" value={form.country} onChange={(e) => update('country', e.target.value)}>
          <option value="">Select country…</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <span className="cw-hint">Determines the default tax jurisdiction and compliance requirements.</span>
      </div>
      <div className="cw-field">
        <label className="cw-label">Functional Currency <span className="cw-required">*</span></label>
        <select className="cw-select" value={form.currency} onChange={(e) => update('currency', e.target.value)}>
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cw-step-fields">
      <div className="cw-field">
        <label className="cw-label">Fiscal Year End</label>
        <select className="cw-select" value={form.fiscalYearEnd} onChange={(e) => update('fiscalYearEnd', e.target.value)}>
          {FISCAL_YEAR_ENDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <span className="cw-hint">Determines your accounting period and tax return windows.</span>
      </div>
      <div className="cw-field">
        <label className="cw-label">Tax Regime <span className="cw-optional">(optional)</span></label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. Corporate Income Tax, VAT"
          value={form.taxRegime}
          onChange={(e) => update('taxRegime', e.target.value)}
        />
      </div>

      {/* Summary Review */}
      <div className="cw-field cw-field-wide">
        <div className="cw-review-card">
          <h4 className="cw-review-title">Review — New Workspace</h4>
          <div className="cw-review-rows">
            <div className="cw-review-row"><span>Name</span><strong>{form.name}</strong></div>
            <div className="cw-review-row"><span>Type</span><strong>{ENTITY_TYPES.find(t => t.value === form.businessType)?.label}</strong></div>
            {form.industry && <div className="cw-review-row"><span>Industry</span><strong>{INDUSTRIES.find(i => i.value === form.industry)?.label}</strong></div>}
            <div className="cw-review-row"><span>Country</span><strong>{COUNTRIES.find(c => c.code === form.country)?.name || form.country}</strong></div>
            <div className="cw-review-row"><span>Currency</span><strong>{form.currency}</strong></div>
            <div className="cw-review-row"><span>Fiscal Year End</span><strong>{FISCAL_YEAR_ENDS.find(f => f.value === form.fiscalYearEnd)?.label}</strong></div>
          </div>
          <div className="cw-review-note">
            ATC Capital will automatically set up your chart of accounts and default tax profile based on the country and business type selected.
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cw-page">
      {/* Top Navbar */}
      <header className="cw-topnav">
        <div className="cw-topnav-brand">
          <ATCLogo variant="dark" size="small" withText text="ATC Capital" />
        </div>
        <button className="cw-topnav-back" onClick={() => navigate('/app/console')}>
          ← All Workspaces
        </button>
      </header>

      <div className="create-workspace">
      {/* Back link — hidden (kept for CSS compat) */}
      <button className="cw-back-btn" style={{display:'none'}} onClick={() => navigate('/app/console')}>
        ← Back to Console
      </button>

      <div className="cw-card">
        {/* Header */}
        <div className="cw-header">
          <span className="cw-kicker">New Workspace</span>
          <h1 className="cw-title">Create a Workspace</h1>
          <p className="cw-subtitle">
            A workspace represents one company or entity. All financial data — ledger entries, invoices, tax filings — is scoped to this workspace.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="cw-steps">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className={`cw-step-dot ${step === s.id ? 'cw-step-active' : step > s.id ? 'cw-step-done' : ''}`}>
                <span>{step > s.id ? '✓' : s.id}</span>
                <span className="cw-step-label">{s.label}</span>
              </div>
              {idx < STEPS.length - 1 && <div className={`cw-step-line ${step > s.id ? 'cw-step-line-done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Error */}
        {error && <div className="cw-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="cw-form">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          {/* Navigation */}
          <div className="cw-nav">
            {step > 1 && (
              <button type="button" className="cw-btn cw-btn-secondary" onClick={() => setStep(step - 1)}>
                ← Previous
              </button>
            )}
            <div className="cw-nav-spacer" />
            {step < STEPS.length ? (
              <button
                type="button"
                className="cw-btn cw-btn-primary"
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="cw-btn cw-btn-create"
                disabled={submitting || !form.name || !form.country}
              >
                {submitting ? 'Creating Workspace…' : 'Create Workspace'}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Info sidebar */}
      <aside className="cw-sidebar">
        <h3>What happens next</h3>
        <ul className="cw-info-list">
          <li>
            <span className="cw-info-icon">📊</span>
            <div>
              <strong>Chart of Accounts</strong>
              <p>A default chart of accounts based on your country and business type will be created automatically.</p>
            </div>
          </li>
          <li>
            <span className="cw-info-icon">🧾</span>
            <div>
              <strong>Tax Profile</strong>
              <p>A default tax profile will be set up for the selected jurisdiction.</p>
            </div>
          </li>
          <li>
            <span className="cw-info-icon">🔒</span>
            <div>
              <strong>You are the Owner</strong>
              <p>You will be assigned the Owner role. You can invite team members and configure permissions later.</p>
            </div>
          </li>
          <li>
            <span className="cw-info-icon">🌐</span>
            <div>
              <strong>Scoped Environment</strong>
              <p>All financial data — ledger entries, invoices, budgets, tax filings — is scoped exclusively to this workspace.</p>
            </div>
          </li>
        </ul>
      </aside>
    </div>{/* /.create-workspace */}
    </div>
  );
};

export default CreateWorkspace;
