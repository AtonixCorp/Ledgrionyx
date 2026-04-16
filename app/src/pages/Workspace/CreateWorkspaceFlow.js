import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import LedgrionyxLogo from '../../components/branding/LedgrionyxLogo';
import { countryDropdownOptions } from '../../utils/countryDropdowns';
import './CreateWorkspace.css';

/* ─────────────────────────────────────────────────────────────────────────────
   CREATE WORKSPACE FLOW
   Dedicated flow for creating an Operational Workspace.
   Separate from Organization creation and Entity creation.
───────────────────────────────────────────────────────────────────────────── */

const WORKSPACE_TYPES = [
  { value: 'technology',      label: 'Technology' },
  { value: 'retail',          label: 'Retail' },
  { value: 'manufacturing',   label: 'Manufacturing' },
  { value: 'creative_studio', label: 'Creative Studio' },
  { value: 'consulting',      label: 'Consulting' },
  { value: 'finance',         label: 'Finance' },
  { value: 'custom',          label: 'Custom' },
];

const WORKSPACE_MODULES = [
  { key: 'meetings',    label: 'Meetings',    desc: 'Schedule and manage team meetings' },
  { key: 'files',       label: 'Files',       desc: 'Document storage and sharing' },
  { key: 'calendar',    label: 'Calendar',    desc: 'Event and deadline tracking' },
  { key: 'marketing',   label: 'Marketing',   desc: 'Campaign and content management' },
  { key: 'email',       label: 'Email',       desc: 'Internal and external communications' },
  { key: 'hr',          label: 'HR',          desc: 'Staff records and personnel management' },
  { key: 'finance',     label: 'Finance',     desc: 'Budgets, expenses, and reporting' },
  { key: 'compliance',  label: 'Compliance',  desc: 'Regulatory filings and deadlines' },
];

const EMPTY_FORM = {
  name: '',
  workspaceType: '',
  country: '',
  address: '',
  registrationNumber: '',
  industry: '',
  departments: '',
  teams: '',
  staffCount: '',
  ownershipHierarchy: '',
  enabledModules: [],
};

const TOTAL_STEPS = 4;

const STEPS = [
  { number: 1, label: 'Workspace Type' },
  { number: 2, label: 'Business Info' },
  { number: 3, label: 'Structure' },
  { number: 4, label: 'Modules' },
];

export default function CreateWorkspaceFlow() {
  const navigate = useNavigate();
  const { createWorkspace, currentOrganization } = useEnterprise();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleModule = (key) => {
    setForm((prev) => {
      const modules = new Set(prev.enabledModules);
      modules.has(key) ? modules.delete(key) : modules.add(key);
      return { ...prev, enabledModules: Array.from(modules) };
    });
  };

  const canGoNext = () => {
    if (step === 1) return form.name.trim().length >= 2 && !!form.workspaceType;
    if (step === 2) return !!form.country;
    if (step === 3) return true;
    if (step === 4) return form.enabledModules.length > 0;
    return true;
  };

  const handleNext = () => { if (canGoNext()) setStep((s) => s + 1); };
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentOrganization?.id) {
      setError('No active organization found. Please create your organization first.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        organizationId: currentOrganization.id,
        name: form.name.trim(),
        country: form.country,
        currency: 'USD',
        entity_type: 'other',
        workspace_mode: 'workspace',
        workspace_type: form.workspaceType,
        address: form.address.trim(),
        registration_number: form.registrationNumber.trim() || undefined,
        industry: form.industry.trim() || form.workspaceType,
        departments: form.departments.trim(),
        teams: form.teams.trim(),
        staff_count: Number(form.staffCount) || 0,
        ownership_hierarchy: form.ownershipHierarchy.trim(),
        enabled_modules: form.enabledModules,
        status: 'active',
      };
      const newWorkspace = await createWorkspace(payload);
      if (newWorkspace?.id) {
        navigate(`/app/workspace/${newWorkspace.id}/overview`);
      } else {
        navigate('/app/enterprise/org-overview');
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
        <label className="cw-label">Workspace Name <span className="cw-required">*</span></label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. North America Operations"
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
          autoFocus
        />
        <span className="cw-hint">The name of this operational workspace.</span>
      </div>
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Workspace Type <span className="cw-required">*</span></label>
        <div className="cw-tile-grid">
          {WORKSPACE_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`cw-tile${form.workspaceType === t.value ? ' cw-tile--selected' : ''}`}
              onClick={() => update('workspaceType', t.value)}
            >
              <span className="cw-tile-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cw-step-fields">
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Business Address</label>
        <input
          className="cw-input"
          type="text"
          placeholder="Street address"
          value={form.address}
          onChange={(e) => update('address', e.target.value)}
        />
      </div>
      <div className="cw-field">
        <label className="cw-label">Country of Operation <span className="cw-required">*</span></label>
        <select className="cw-select" value={form.country} onChange={(e) => update('country', e.target.value)}>
          <option value="">Select country</option>
          {countryDropdownOptions.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
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
        <label className="cw-label">Industry Classification</label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. Software, Retail, Healthcare"
          value={form.industry}
          onChange={(e) => update('industry', e.target.value)}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="cw-step-fields">
      <div className="cw-field">
        <label className="cw-label">Departments</label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. Finance, Engineering, Sales"
          value={form.departments}
          onChange={(e) => update('departments', e.target.value)}
        />
        <span className="cw-hint">Comma-separated list of departments in this workspace.</span>
      </div>
      <div className="cw-field">
        <label className="cw-label">Teams</label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. Core Team, Advisory, Growth"
          value={form.teams}
          onChange={(e) => update('teams', e.target.value)}
        />
      </div>
      <div className="cw-field">
        <label className="cw-label">Number of Staff</label>
        <input
          className="cw-input"
          type="number"
          min="1"
          placeholder="e.g. 12"
          value={form.staffCount}
          onChange={(e) => update('staffCount', e.target.value)}
        />
      </div>
      <div className="cw-field cw-field-wide">
        <label className="cw-label">Ownership Hierarchy</label>
        <input
          className="cw-input"
          type="text"
          placeholder="e.g. CEO → CFO → Manager"
          value={form.ownershipHierarchy}
          onChange={(e) => update('ownershipHierarchy', e.target.value)}
        />
        <span className="cw-hint">Briefly describe the reporting or ownership structure.</span>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="cw-step-fields">
      <p className="cw-section-desc">Select the modules to activate in this workspace. You can add more later.</p>
      <div className="cw-module-grid">
        {WORKSPACE_MODULES.map((mod) => {
          const active = form.enabledModules.includes(mod.key);
          return (
            <button
              key={mod.key}
              type="button"
              className={`cw-module-card${active ? ' cw-module-card--active' : ''}`}
              onClick={() => toggleModule(mod.key)}
            >
              <span className="cw-module-name">{mod.label}</span>
              <span className="cw-module-desc">{mod.desc}</span>
              {active && <span className="cw-module-check">✓</span>}
            </button>
          );
        })}
      </div>
      {form.enabledModules.length === 0 && (
        <p className="cw-hint cw-hint--warn">Select at least one module to continue.</p>
      )}
    </div>
  );

  const stepContent = [null, renderStep1, renderStep2, renderStep3, renderStep4];

  return (
    <div className="cw-page">
      {/* Top Nav */}
      <nav className="cw-topnav">
        <div className="cw-topnav-brand">
          <LedgrionyxLogo size={28} />
          <span className="cw-topnav-title">Create Workspace</span>
        </div>
        <button className="cw-topnav-cancel" onClick={() => navigate('/app/enterprise/org-overview')}>
          Cancel
        </button>
      </nav>

      {/* Step progress */}
      <div className="cw-progress-bar">
        {STEPS.map((s) => (
          <div key={s.number} className={`cw-progress-step${step >= s.number ? ' cw-progress-step--done' : ''}${step === s.number ? ' cw-progress-step--active' : ''}`}>
            <span className="cw-progress-num">{step > s.number ? '✓' : s.number}</span>
            <span className="cw-progress-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form body */}
      <main className="cw-main">
        <form className="cw-card" onSubmit={handleSubmit}>
          <div className="cw-step-header">
            <span className="cw-step-eyebrow">Step {step} of {TOTAL_STEPS}</span>
            <h2 className="cw-step-title">{STEPS[step - 1].label}</h2>
          </div>

          {stepContent[step]()}

          {error && <p className="cw-error">{error}</p>}

          <div className="cw-actions">
            {step > 1 && (
              <button type="button" className="cw-btn cw-btn--ghost" onClick={handleBack}>
                Back
              </button>
            )}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                className="cw-btn cw-btn--primary"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="cw-btn cw-btn--primary"
                disabled={submitting || !canGoNext()}
              >
                {submitting ? 'Creating Workspace…' : 'Create Workspace'}
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
