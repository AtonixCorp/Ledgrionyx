import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnterprise } from '../../context/EnterpriseContext';
import LedgrionyxLogo from '../../components/branding/LedgrionyxLogo';
import { countryDropdownOptions } from '../../utils/countryDropdowns';
import {
  ACCOUNTING_MODULE_KEYS,
  EQUITY_MODULE_KEYS,
  WORKSPACE_PACKAGE_OPTIONS,
} from '../../utils/workspaceModules';
import './CreateWorkspace.css';

/* ─────────────────────────────────────────────────────────────────────────────
   Ledgrionyx — Create Workspace
   Form to create a new company workspace (entity).
   On success: activates the new workspace and redirects to overview.
───────────────────────────────────────────────────────────────────────────── */

const COUNTRIES = countryDropdownOptions;

const CURRENCIES = [
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'AFN', label: 'AFN — Afghan Afghani' },
  { code: 'ALL', label: 'ALL — Albanian Lek' },
  { code: 'AMD', label: 'AMD — Armenian Dram' },
  { code: 'AOA', label: 'AOA — Angolan Kwanza' },
  { code: 'ARS', label: 'ARS — Argentine Peso' },
  { code: 'AUD', label: 'AUD — Australian Dollar' },
  { code: 'AZN', label: 'AZN — Azerbaijani Manat' },
  { code: 'BAM', label: 'BAM — Bosnia Mark' },
  { code: 'BBD', label: 'BBD — Barbadian Dollar' },
  { code: 'BDT', label: 'BDT — Bangladeshi Taka' },
  { code: 'BGN', label: 'BGN — Bulgarian Lev' },
  { code: 'BHD', label: 'BHD — Bahraini Dinar' },
  { code: 'BIF', label: 'BIF — Burundian Franc' },
  { code: 'BMD', label: 'BMD — Bermudian Dollar' },
  { code: 'BND', label: 'BND — Brunei Dollar' },
  { code: 'BOB', label: 'BOB — Bolivian Boliviano' },
  { code: 'BRL', label: 'BRL — Brazilian Real' },
  { code: 'BSD', label: 'BSD — Bahamian Dollar' },
  { code: 'BTN', label: 'BTN — Bhutanese Ngultrum' },
  { code: 'BWP', label: 'BWP — Botswana Pula' },
  { code: 'BYN', label: 'BYN — Belarusian Ruble' },
  { code: 'BZD', label: 'BZD — Belize Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'CDF', label: 'CDF — Congolese Franc' },
  { code: 'CHF', label: 'CHF — Swiss Franc' },
  { code: 'CLP', label: 'CLP — Chilean Peso' },
  { code: 'CNY', label: 'CNY — Chinese Yuan' },
  { code: 'COP', label: 'COP — Colombian Peso' },
  { code: 'CRC', label: 'CRC — Costa Rican Colón' },
  { code: 'CUP', label: 'CUP — Cuban Peso' },
  { code: 'CVE', label: 'CVE — Cape Verdean Escudo' },
  { code: 'CZK', label: 'CZK — Czech Koruna' },
  { code: 'DJF', label: 'DJF — Djiboutian Franc' },
  { code: 'DKK', label: 'DKK — Danish Krone' },
  { code: 'DOP', label: 'DOP — Dominican Peso' },
  { code: 'DZD', label: 'DZD — Algerian Dinar' },
  { code: 'EGP', label: 'EGP — Egyptian Pound' },
  { code: 'ERN', label: 'ERN — Eritrean Nakfa' },
  { code: 'ETB', label: 'ETB — Ethiopian Birr' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'FJD', label: 'FJD — Fijian Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'GEL', label: 'GEL — Georgian Lari' },
  { code: 'GHS', label: 'GHS — Ghanaian Cedi' },
  { code: 'GMD', label: 'GMD — Gambian Dalasi' },
  { code: 'GNF', label: 'GNF — Guinean Franc' },
  { code: 'GTQ', label: 'GTQ — Guatemalan Quetzal' },
  { code: 'GYD', label: 'GYD — Guyanese Dollar' },
  { code: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { code: 'HNL', label: 'HNL — Honduran Lempira' },
  { code: 'HRK', label: 'HRK — Croatian Kuna' },
  { code: 'HTG', label: 'HTG — Haitian Gourde' },
  { code: 'HUF', label: 'HUF — Hungarian Forint' },
  { code: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { code: 'ILS', label: 'ILS — Israeli Shekel' },
  { code: 'INR', label: 'INR — Indian Rupee' },
  { code: 'IQD', label: 'IQD — Iraqi Dinar' },
  { code: 'IRR', label: 'IRR — Iranian Rial' },
  { code: 'ISK', label: 'ISK — Icelandic Króna' },
  { code: 'JMD', label: 'JMD — Jamaican Dollar' },
  { code: 'JOD', label: 'JOD — Jordanian Dinar' },
  { code: 'JPY', label: 'JPY — Japanese Yen' },
  { code: 'KES', label: 'KES — Kenyan Shilling' },
  { code: 'KGS', label: 'KGS — Kyrgyzstani Som' },
  { code: 'KHR', label: 'KHR — Cambodian Riel' },
  { code: 'KMF', label: 'KMF — Comorian Franc' },
  { code: 'KRW', label: 'KRW — South Korean Won' },
  { code: 'KWD', label: 'KWD — Kuwaiti Dinar' },
  { code: 'KZT', label: 'KZT — Kazakhstani Tenge' },
  { code: 'LAK', label: 'LAK — Lao Kip' },
  { code: 'LBP', label: 'LBP — Lebanese Pound' },
  { code: 'LKR', label: 'LKR — Sri Lankan Rupee' },
  { code: 'LRD', label: 'LRD — Liberian Dollar' },
  { code: 'LSL', label: 'LSL — Lesotho Loti' },
  { code: 'LYD', label: 'LYD — Libyan Dinar' },
  { code: 'MAD', label: 'MAD — Moroccan Dirham' },
  { code: 'MDL', label: 'MDL — Moldovan Leu' },
  { code: 'MGA', label: 'MGA — Malagasy Ariary' },
  { code: 'MKD', label: 'MKD — Macedonian Denar' },
  { code: 'MMK', label: 'MMK — Myanmar Kyat' },
  { code: 'MNT', label: 'MNT — Mongolian Tögrög' },
  { code: 'MOP', label: 'MOP — Macanese Pataca' },
  { code: 'MRU', label: 'MRU — Mauritanian Ouguiya' },
  { code: 'MUR', label: 'MUR — Mauritian Rupee' },
  { code: 'MVR', label: 'MVR — Maldivian Rufiyaa' },
  { code: 'MWK', label: 'MWK — Malawian Kwacha' },
  { code: 'MXN', label: 'MXN — Mexican Peso' },
  { code: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { code: 'MZN', label: 'MZN — Mozambican Metical' },
  { code: 'NAD', label: 'NAD — Namibian Dollar' },
  { code: 'NGN', label: 'NGN — Nigerian Naira' },
  { code: 'NIO', label: 'NIO — Nicaraguan Córdoba' },
  { code: 'NOK', label: 'NOK — Norwegian Krone' },
  { code: 'NPR', label: 'NPR — Nepalese Rupee' },
  { code: 'NZD', label: 'NZD — New Zealand Dollar' },
  { code: 'OMR', label: 'OMR — Omani Rial' },
  { code: 'PAB', label: 'PAB — Panamanian Balboa' },
  { code: 'PEN', label: 'PEN — Peruvian Sol' },
  { code: 'PGK', label: 'PGK — Papua New Guinean Kina' },
  { code: 'PHP', label: 'PHP — Philippine Peso' },
  { code: 'PKR', label: 'PKR — Pakistani Rupee' },
  { code: 'PLN', label: 'PLN — Polish Złoty' },
  { code: 'PYG', label: 'PYG — Paraguayan Guaraní' },
  { code: 'QAR', label: 'QAR — Qatari Riyal' },
  { code: 'RON', label: 'RON — Romanian Leu' },
  { code: 'RSD', label: 'RSD — Serbian Dinar' },
  { code: 'RUB', label: 'RUB — Russian Ruble' },
  { code: 'RWF', label: 'RWF — Rwandan Franc' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
  { code: 'SBD', label: 'SBD — Solomon Islands Dollar' },
  { code: 'SCR', label: 'SCR — Seychellois Rupee' },
  { code: 'SDG', label: 'SDG — Sudanese Pound' },
  { code: 'SEK', label: 'SEK — Swedish Krona' },
  { code: 'SGD', label: 'SGD — Singapore Dollar' },
  { code: 'SLL', label: 'SLL — Sierra Leonean Leone' },
  { code: 'SOS', label: 'SOS — Somali Shilling' },
  { code: 'SRD', label: 'SRD — Surinamese Dollar' },
  { code: 'SSP', label: 'SSP — South Sudanese Pound' },
  { code: 'STN', label: 'STN — São Tomé Dobra' },
  { code: 'SYP', label: 'SYP — Syrian Pound' },
  { code: 'SZL', label: 'SZL — Swazi Lilangeni' },
  { code: 'THB', label: 'THB — Thai Baht' },
  { code: 'TJS', label: 'TJS — Tajikistani Somoni' },
  { code: 'TMT', label: 'TMT — Turkmenistani Manat' },
  { code: 'TND', label: 'TND — Tunisian Dinar' },
  { code: 'TOP', label: 'TOP — Tongan Paʻanga' },
  { code: 'TRY', label: 'TRY — Turkish Lira' },
  { code: 'TTD', label: 'TTD — Trinidad and Tobago Dollar' },
  { code: 'TWD', label: 'TWD — New Taiwan Dollar' },
  { code: 'TZS', label: 'TZS — Tanzanian Shilling' },
  { code: 'UAH', label: 'UAH — Ukrainian Hryvnia' },
  { code: 'UGX', label: 'UGX — Ugandan Shilling' },
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'UYU', label: 'UYU — Uruguayan Peso' },
  { code: 'UZS', label: 'UZS — Uzbekistani Som' },
  { code: 'VES', label: 'VES — Venezuelan Bolívar' },
  { code: 'VND', label: 'VND — Vietnamese Dong' },
  { code: 'VUV', label: 'VUV — Vanuatu Vatu' },
  { code: 'WST', label: 'WST — Samoan Tālā' },
  { code: 'XAF', label: 'XAF — Central African CFA Franc' },
  { code: 'XOF', label: 'XOF — West African CFA Franc' },
  { code: 'YER', label: 'YER — Yemeni Rial' },
  { code: 'ZAR', label: 'ZAR — South African Rand' },
  { code: 'ZMW', label: 'ZMW — Zambian Kwacha' },
  { code: 'ZWL', label: 'ZWL — Zimbabwean Dollar' },
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
  { value: '01-31', label: 'January 31' },
  { value: '02-28', label: 'February 28' },
  { value: '03-31', label: 'March 31' },
  { value: '04-30', label: 'April 30' },
  { value: '05-31', label: 'May 31' },
  { value: '06-30', label: 'June 30' },
  { value: '07-31', label: 'July 31' },
  { value: '08-31', label: 'August 31' },
  { value: '09-30', label: 'September 30' },
  { value: '10-31', label: 'October 31' },
  { value: '11-30', label: 'November 30' },
];

/* Convert MM-DD picker value → YYYY-MM-DD for the API.
   Uses the next upcoming occurrence of that date. */
const toFiscalYearEndDate = (monthDay) => {
  const [mm, dd] = monthDay.split('-').map(Number);
  const now = new Date();
  const curYear = now.getFullYear();
  const candidate = new Date(curYear, mm - 1, dd);
  const year = candidate > now ? curYear : curYear + 1;
  return `${year}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
};

/* ─── Steps ──────────────────────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Company Identity' },
  { id: 2, label: 'Jurisdiction & Currency' },
  { id: 3, label: 'Fiscal & Structure' },
  { id: 4, label: 'Modules & Launch' },
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
  workspaceMode: '',
  enabledModules: [],
};

const ACCOUNTING_MODULE_OPTIONS = [
  { key: 'overview', label: 'Workspace Overview', detail: 'Home dashboard and entity launchpad.' },
  { key: 'members', label: 'Members', detail: 'Team invitations and membership visibility.' },
  { key: 'groups', label: 'Departments', detail: 'Finance department structure, ownership, and access grouping.' },
  { key: 'meetings', label: 'Meetings', detail: 'Meeting scheduling, records, and follow-ups.' },
  { key: 'calendar', label: 'Calendar', detail: 'Operational timeline and key dates.' },
  { key: 'files', label: 'Files', detail: 'Document storage and workspace file access.' },
  { key: 'permissions', label: 'Permissions', detail: 'Workspace access and approval controls.' },
  { key: 'settings', label: 'Settings', detail: 'Workspace-level configuration and policies.' },
  { key: 'email', label: 'Email', detail: 'Messaging and communication workflows.' },
  { key: 'marketing', label: 'Marketing', detail: 'Growth and outbound workspace tools.' },
];

const EQUITY_MODULE_OPTIONS = [
  { key: 'equity_registry', label: 'Ownership Registry', detail: 'Registered holders and beneficial owner records.' },
  { key: 'equity_cap_table', label: 'Cap Table', detail: 'Share classes, issuances, and dilution structure.' },
  { key: 'equity_vesting', label: 'Vesting & Grants', detail: 'Grant schedules, cliffs, accelerations, and forfeiture logic.' },
  { key: 'equity_exercises', label: 'Exercise Center', detail: 'Exercise requests, certificates, approvals, and payroll tax sync.' },
  { key: 'equity_valuation', label: 'Valuation', detail: 'Pricing history and board-approved value points.' },
  { key: 'equity_transactions', label: 'Equity Transactions', detail: 'Issuances, transfers, conversions, and approvals.' },
  { key: 'equity_governance', label: 'Governance & Reporting', detail: 'Board packs, reports, and regulatory artifacts.' },
];

const CreateWorkspace = () => {
  const navigate = useNavigate();
  const { createWorkspace, createEntity, currentOrganization, setActiveWorkspace } = useEnterprise();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [fyOpen, setFyOpen] = useState(false);
  const [fyMonth, setFyMonth] = useState(null); // 1–12 once user picks a month
  const fyRef = React.useRef(null);

  // Close fiscal picker when clicking outside
  React.useEffect(() => {
    if (!fyOpen) return;
    const handler = (e) => {
      if (fyRef.current && !fyRef.current.contains(e.target)) setFyOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [fyOpen]);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  // Parse current MM-DD value
  const [fySelMonth, fySelDay] = form.fiscalYearEnd.split('-').map(Number);
  const fyLabel = (() => {
    const d = new Date(2000, fySelMonth - 1, fySelDay);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  })();

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const MONTH_FULL  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const daysInMonth = (m) => new Date(2000, m, 0).getDate(); // m is 1-based

  const toggleModule = (moduleKey) => {
    setForm((prev) => {
      const next = new Set(prev.enabledModules);
      if (next.has(moduleKey)) {
        next.delete(moduleKey);
      } else {
        next.add(moduleKey);
      }
      return { ...prev, enabledModules: Array.from(next) };
    });
  };

  const selectPackage = (mode) => {
    const selected = WORKSPACE_PACKAGE_OPTIONS.find((option) => option.id === mode);
    setForm((prev) => ({
      ...prev,
      workspaceMode: mode,
      enabledModules: selected ? [...selected.modules] : prev.enabledModules,
    }));
  };

  const canGoNext = () => {
    if (step === 1) return form.name.trim().length >= 2;
    if (step === 2) return !!form.country && !!form.currency;
    if (step === 4) return !!form.workspaceMode && (form.enabledModules.length > 0 || form.workspaceMode === 'standalone');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Company name is required'); return; }
    if (!form.country)     { setError('Country is required'); return; }
    if (!form.workspaceMode) { setError('Select a workspace package before launch.'); return; }
    if (!currentOrganization?.id) { setError('No active organization is selected for this account.'); return; }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        country: form.country,
        entity_type: form.businessType,
        local_currency: form.currency,
        fiscal_year_end: toFiscalYearEndDate(form.fiscalYearEnd),
        status: 'active',
        organization_id: currentOrganization?.id,
        registration_number: form.registrationNumber || undefined,
        workspace_mode: form.workspaceMode,
        enabled_modules: form.enabledModules,
      };

      // Use createWorkspace if available (wraps createEntity + activates), otherwise fall back
      let newWorkspace;
      if (typeof createWorkspace === 'function') {
        newWorkspace = await createWorkspace({
          organizationId: currentOrganization?.id,
          ...form,
          fiscalYearEnd: toFiscalYearEndDate(form.fiscalYearEnd),
          fiscal_year_end: toFiscalYearEndDate(form.fiscalYearEnd),
          workspace_mode: form.workspaceMode,
          enabled_modules: form.enabledModules,
        });
      } else {
        newWorkspace = await createEntity(payload);
        if (newWorkspace && typeof setActiveWorkspace === 'function') {
          setActiveWorkspace(newWorkspace);
        }
      }

      if (newWorkspace) {
        const wsId = newWorkspace.id;
        const launchEquity = ['equity', 'standalone'].includes(form.workspaceMode)
          && form.enabledModules.some((moduleKey) => moduleKey.startsWith('equity_'))
          && !form.enabledModules.some((moduleKey) => ACCOUNTING_MODULE_KEYS.includes(moduleKey));
        navigate(launchEquity ? `/app/equity/${wsId}/registry` : `/app/workspace/${wsId}/overview`);
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
        <span className="cw-hint">This will be displayed as the workspace name throughout Ledgrionyx.</span>
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
      <div className="cw-field" ref={fyRef} style={{ position: 'relative' }}>
        <label className="cw-label">Fiscal Year End</label>

        {/* Trigger button */}
        <button
          type="button"
          className="cw-fy-trigger"
          onClick={() => { setFyOpen(o => !o); setFyMonth(null); }}
        >
          <span>{fyLabel}</span>
          <span className="cw-fy-trigger-arrow">{fyOpen ? '▲' : '▼'}</span>
        </button>
        <span className="cw-hint">Determines your accounting period and tax return windows.</span>

        {/* Picker popover */}
        {fyOpen && (
          <div className="cw-fy-picker">
            {fyMonth === null ? (
              /* ── Month grid ── */
              <>
                <div className="cw-fy-picker-title">Select Month</div>
                <div className="cw-fy-months">
                  {MONTH_NAMES.map((mn, i) => (
                    <button
                      key={mn}
                      type="button"
                      className={`cw-fy-month-btn${fySelMonth === i + 1 ? ' selected' : ''}`}
                      onClick={() => setFyMonth(i + 1)}
                    >
                      {mn}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* ── Day grid ── */
              <>
                <div className="cw-fy-picker-nav">
                  <button type="button" className="cw-fy-back" onClick={() => setFyMonth(null)}>← Months</button>
                  <span className="cw-fy-picker-title" style={{ flex: 1, textAlign: 'center' }}>{MONTH_FULL[fyMonth - 1]}</span>
                </div>
                <div className="cw-fy-days">
                  {Array.from({ length: daysInMonth(fyMonth) }, (_, i) => i + 1).map(d => (
                    <button
                      key={d}
                      type="button"
                      className={`cw-fy-day-btn${fySelMonth === fyMonth && fySelDay === d ? ' selected' : ''}`}
                      onClick={() => {
                        update('fiscalYearEnd', `${String(fyMonth).padStart(2,'0')}-${String(d).padStart(2,'0')}`);
                        setFyOpen(false);
                        setFyMonth(null);
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
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
            Ledgrionyx will automatically set up your chart of accounts and default tax profile based on the country and business type selected.
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedPackage = WORKSPACE_PACKAGE_OPTIONS.find((option) => option.id === form.workspaceMode) || null;
    const packageTitle = selectedPackage?.title || 'Choose a workspace package';
    const packageSelected = Boolean(form.workspaceMode);
    const accountingCount = form.enabledModules.filter((moduleKey) => ACCOUNTING_MODULE_KEYS.includes(moduleKey)).length;
    const equityCount = form.enabledModules.filter((moduleKey) => EQUITY_MODULE_KEYS.includes(moduleKey)).length;
    const launchDestination = ['equity', 'standalone'].includes(form.workspaceMode)
      && equityCount > 0
      && accountingCount === 0
      ? 'Ledgrionyx Equity Management'
      : 'Standard Workspace Overview';

    return (
      <div className="cw-launch-layout">
        <div className="cw-launch-main">
          <div className="cw-field cw-field-wide">
            <label className="cw-label">Workspace Package</label>
            <span className="cw-hint">Choose the operating model first. Module customization opens after you select a package.</span>
            <div className="cw-package-grid">
              {WORKSPACE_PACKAGE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`cw-package-card${form.workspaceMode === option.id ? ' selected' : ''}`}
                  onClick={() => selectPackage(option.id)}
                  aria-pressed={form.workspaceMode === option.id}
                >
                  <span className="cw-package-title">{option.title}</span>
                  <span className="cw-package-desc">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cw-launch-modules">
            <section className="cw-module-section">
              <div className="cw-module-section-head">
                <div>
                  <h4>Accounting Workspace Modules</h4>
                  <p>Core collaboration and finance workspace capabilities.</p>
                </div>
                <span className="cw-module-count">{accountingCount} selected</span>
              </div>
              <div className="cw-module-grid">
                {ACCOUNTING_MODULE_OPTIONS.map((module) => (
                  <label
                    key={module.key}
                    className={`cw-module-toggle${form.enabledModules.includes(module.key) ? ' selected' : ''}${!packageSelected ? ' disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.enabledModules.includes(module.key)}
                      onChange={() => toggleModule(module.key)}
                      disabled={!packageSelected}
                    />
                    <span className="cw-module-copy">
                      <strong>{module.label}</strong>
                      <small>{module.detail}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section className="cw-module-section cw-module-section-equity">
              <div className="cw-module-section-head">
                <div>
                  <h4>Equity Management Modules</h4>
                  <p>Dedicated Ledgrionyx Equity navigation and ownership workflows.</p>
                </div>
                <span className="cw-module-count">{equityCount} selected</span>
              </div>
              <div className="cw-module-grid cw-module-grid-equity">
                {EQUITY_MODULE_OPTIONS.map((module) => (
                  <label
                    key={module.key}
                    className={`cw-module-toggle${form.enabledModules.includes(module.key) ? ' selected' : ''}${!packageSelected ? ' disabled' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={form.enabledModules.includes(module.key)}
                      onChange={() => toggleModule(module.key)}
                      disabled={!packageSelected}
                    />
                    <span className="cw-module-copy">
                      <strong>{module.label}</strong>
                      <small>{module.detail}</small>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {!packageSelected && <span className="cw-hint">Select a workspace package to unlock module customization.</span>}
          <span className="cw-hint">Equity modules launch inside a dedicated Equity Management sidebar while keeping the standard workspace intact.</span>
        </div>

        <div className="cw-launch-sidebar">
          <div className="cw-review-card cw-review-card-accent cw-launch-summary">
            <h4 className="cw-review-title">Launch Configuration</h4>
            <div className="cw-review-rows">
              <div className="cw-review-row"><span>Workspace package</span><strong>{packageTitle}</strong></div>
              <div className="cw-review-row"><span>Organization</span><strong>{currentOrganization?.name || 'No organization selected'}</strong></div>
              <div className="cw-review-row"><span>Accounting modules</span><strong>{accountingCount}</strong></div>
              <div className="cw-review-row"><span>Equity modules</span><strong>{equityCount}</strong></div>
              <div className="cw-review-row"><span>Launch target</span><strong>{launchDestination}</strong></div>
            </div>
            <div className="cw-review-note">
              {selectedPackage?.description || 'Pick a package to preview how this workspace will launch.'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const selectedPackage = WORKSPACE_PACKAGE_OPTIONS.find((option) => option.id === form.workspaceMode) || null;
  const accountingCount = form.enabledModules.filter((moduleKey) => ACCOUNTING_MODULE_KEYS.includes(moduleKey)).length;
  const equityCount = form.enabledModules.filter((moduleKey) => EQUITY_MODULE_KEYS.includes(moduleKey)).length;
  const launchDestination = ['equity', 'standalone'].includes(form.workspaceMode)
    && equityCount > 0
    && accountingCount === 0
    ? 'Ledgrionyx Equity Management'
    : 'Standard Workspace Overview';

  const dashboardGuide = [
    {
      title: 'Primary landing dashboard',
      description: selectedPackage
        ? `${launchDestination} opens first based on the package and module mix you selected.`
        : 'Choose a workspace package to preview the dashboard that opens first after launch.',
    },
    {
      title: 'Operations and team workspace',
      description: 'Every workspace starts with a shared operating layer for members, departments, meetings, permissions, files, and internal coordination.',
    },
    {
      title: 'Ledgrionyx Equity Management routing',
      description: 'When equity modules are enabled, the workspace can launch into Ledgrionyx Equity Management for registry, cap table, vesting, valuation, transactions, and governance workflows.',
    },
  ];

  return (
    <div className="cw-page">
      {/* Top Navbar */}
      <header className="cw-topnav">
        <div className="cw-topnav-brand">
          <LedgrionyxLogo variant="dark" size="small" withText text="Ledgrionyx" />
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
            A workspace represents one company or entity. You can launch it as accounting, equity management, a combined operating system, or a standalone shell.
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="cw-steps">
          {STEPS.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className={`cw-step-dot ${step === s.id ? 'cw-step-active' : step > s.id ? 'cw-step-done' : ''}`}>
                <span>{step > s.id ? '+' : s.id}</span>
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
          {step === 4 && renderStep4()}

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
                disabled={submitting || !form.name || !form.country || !form.workspaceMode || !currentOrganization?.id}
              >
                {submitting ? 'Creating Workspace…' : 'Launch Workspace'}
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
            <div>
              <strong>Chart of Accounts</strong>
              <p>A default chart of accounts based on your country and business type will be created automatically.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Tax Profile</strong>
              <p>A default tax profile will be set up for the selected jurisdiction.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>You are the Owner</strong>
              <p>You will be assigned the Owner role. You can invite team members and configure permissions later.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Scoped Environment</strong>
              <p>All financial data — ledger entries, invoices, budgets, tax filings — is scoped exclusively to this workspace.</p>
            </div>
          </li>
          <li>
            <div>
              <strong>Dedicated Equity Sidebar</strong>
              <p>If you enable equity management, the workspace gets a separate Ledgrionyx Equity Management navigation with registry, cap table, valuation, transactions, and governance flows.</p>
            </div>
          </li>
        </ul>

        <div className="cw-sidebar-panel">
          <h3>Dashboard Journey</h3>
          <div className="cw-dashboard-guide">
            {dashboardGuide.map((item) => (
              <article key={item.title} className="cw-dashboard-guide-card">
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="cw-sidebar-panel cw-sidebar-panel-accent">
          <h3>Current launch preview</h3>
          <div className="cw-sidebar-preview-row"><span>Package</span><strong>{selectedPackage?.title || 'Not selected yet'}</strong></div>
          <div className="cw-sidebar-preview-row"><span>Accounting modules</span><strong>{accountingCount}</strong></div>
          <div className="cw-sidebar-preview-row"><span>Equity modules</span><strong>{equityCount}</strong></div>
          <div className="cw-sidebar-preview-row"><span>First dashboard</span><strong>{selectedPackage ? launchDestination : 'Choose package first'}</strong></div>
        </div>
      </aside>
    </div>{/* /.create-workspace */}
    </div>
  );
};

export default CreateWorkspace;
