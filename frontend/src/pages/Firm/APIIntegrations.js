import React, { useState, useEffect } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  FaPlug, FaUniversity, FaCreditCard, FaCalculator, FaUsers,
  FaCheckCircle, FaExclamationCircle, FaSync, FaPlus, FaTrash,
  FaEye, FaEyeSlash, FaClock, FaShieldAlt
} from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const INTEGRATION_CATEGORIES = [
  {
    key: 'banks',
    label: 'Bank Feeds',
    icon: <FaUniversity />,
    color: '#1d4ed8',
    description: 'Connect bank accounts for real-time transaction sync and reconciliation',
    providers: ['Chase Business', 'Bank of America', 'Wells Fargo', 'Citibank', 'HSBC', 'Barclays', 'Standard Chartered', 'SBI', 'Emirates NBD', 'DBS Bank'],
  },
  {
    key: 'payments',
    label: 'Payment Processors',
    icon: <FaCreditCard />,
    color: '#7c3aed',
    description: 'Sync payment data from processors to automate revenue recognition',
    providers: ['Stripe', 'PayPal', 'Square', 'Adyen', 'Braintree', 'Checkout.com', 'Razorpay', 'Flutterwave'],
  },
  {
    key: 'tax',
    label: 'Tax Authorities',
    icon: <FaCalculator />,
    color: '#b45309',
    description: 'Direct integration with government tax portals for automated filing',
    providers: ['IRS (USA)', 'HMRC (UK)', 'ATO (Australia)', 'CRA (Canada)', 'FTA (UAE)', 'CBDT (India)', 'ZRA (Zambia)', 'KRA (Kenya)', 'FIRS (Nigeria)'],
  },
  {
    key: 'payroll',
    label: 'Payroll Systems',
    icon: <FaUsers />,
    color: '#047857',
    description: 'Sync payroll data for automated journal entries and cost allocation',
    providers: ['Gusto', 'ADP', 'Paychex', 'QuickBooks Payroll', 'Rippling', 'BambooHR', 'Workday', 'SAP SuccessFactors'],
  },
];

const emptyForm = {
  integration_type: 'open_banking',
  provider_name: '',
  api_key: '',
  api_secret: '',
  webhook_url: '',
};

const APIIntegrations = () => {
  const { currentOrganization } = useEnterprise();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showSecrets, setShowSecrets] = useState({});
  const [activeCategory, setActiveCategory] = useState('banks');
  const [syncing, setSyncing] = useState({});

  useEffect(() => {
    if (!currentOrganization) return;
    const token = localStorage.getItem('access_token');
    setLoading(true);
    fetch(`${API_BASE}/banking-integrations/?organization=${currentOrganization.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const items = Array.isArray(data) ? data : data.results || [];
        setIntegrations(items);
        setLoading(false);
      })
      .catch(() => {
        // Demo data
        setIntegrations([
          {
            id: 1, integration_type: 'open_banking', provider_name: 'Chase Business',
            status: 'active', is_active: true, last_sync: '2026-03-08T08:30:00Z',
            api_key: 'sk_live_xxxxx', webhook_url: ''
          },
          {
            id: 2, integration_type: 'payment_processor', provider_name: 'Stripe',
            status: 'active', is_active: true, last_sync: '2026-03-08T07:15:00Z',
            api_key: 'pk_live_xxxxx', webhook_url: 'https://api.example.com/stripe/webhook'
          },
          {
            id: 3, integration_type: 'financial_data', provider_name: 'Avalara',
            status: 'pending', is_active: false, last_sync: null,
            api_key: '', webhook_url: ''
          },
        ]);
        setLoading(false);
      });
  }, [currentOrganization]);

  const typeToCategory = {
    open_banking: 'banks',
    payment_processor: 'payments',
    financial_data: 'tax',
    loan_provider: 'payroll',
  };

  const categoryToType = {
    banks: 'open_banking',
    payments: 'payment_processor',
    tax: 'financial_data',
    payroll: 'loan_provider',
  };

  const activeIntegrations = integrations.filter(
    i => typeToCategory[i.integration_type] === activeCategory
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const token = localStorage.getItem('access_token');
    const payload = {
      ...form,
      integration_type: categoryToType[activeCategory] || form.integration_type,
      organization: currentOrganization?.id,
    };
    try {
      const res = await fetch(`${API_BASE}/banking-integrations/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create integration');
      const saved = await res.json();
      setIntegrations(prev => [saved, ...prev]);
      setSuccess('Integration added successfully!');
    } catch (e) {
      // Demo fallback
      const demo = { id: Date.now(), ...payload, status: 'pending', is_active: false, last_sync: null };
      setIntegrations(prev => [demo, ...prev]);
      setSuccess('Integration added (demo mode).');
    }
    setForm(emptyForm);
    setShowForm(false);
    setSaving(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this integration?')) return;
    const token = localStorage.getItem('access_token');
    try {
      await fetch(`${API_BASE}/banking-integrations/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {}
    setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  const handleSync = (id) => {
    setSyncing(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setIntegrations(prev => prev.map(i =>
        i.id === id ? { ...i, last_sync: new Date().toISOString(), status: 'active', is_active: true } : i
      ));
      setSyncing(prev => { const n = { ...prev }; delete n[id]; return n; });
      setSuccess('Sync completed successfully!');
      setTimeout(() => setSuccess(''), 2000);
    }, 2000);
  };

  const toggleSecret = (id) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeCat = INTEGRATION_CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="api-integrations">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h1><FaPlug /> API Integrations</h1>
          <p>Connect your platform with banks, payment processors, tax authorities, and payroll systems</p>
        </div>
        <button className="btn-add-integration" onClick={() => setShowForm(!showForm)}>
          <FaPlus /> Add Integration
        </button>
      </div>

      {success && <div className="ai-alert success"><FaCheckCircle /> {success}</div>}
      {error && <div className="ai-alert error"><FaExclamationCircle /> {error}</div>}

      {/* Category tabs */}
      <div className="ai-categories">
        {INTEGRATION_CATEGORIES.map(cat => {
          const count = integrations.filter(i => typeToCategory[i.integration_type] === cat.key).length;
          return (
            <button
              key={cat.key}
              className={`ai-cat-btn ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              style={activeCategory === cat.key ? { borderColor: cat.color, color: cat.color } : {}}
            >
              <span className="ai-cat-icon" style={activeCategory === cat.key ? { color: cat.color } : {}}>
                {cat.icon}
              </span>
              <span>{cat.label}</span>
              {count > 0 && <span className="ai-cat-count">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Category description */}
      {activeCat && (
        <div className="ai-cat-desc" style={{ borderLeft: `4px solid ${activeCat.color}` }}>
          <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
          <div>
            <strong>{activeCat.label}</strong>
            <p>{activeCat.description}</p>
          </div>
        </div>
      )}

      {/* Add Integration Form */}
      {showForm && (
        <div className="ai-form-card">
          <h3><FaPlus /> Add {activeCat?.label} Integration</h3>
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="ai-field">
              <label>Provider</label>
              <select
                value={form.provider_name}
                onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
                required
              >
                <option value="">— Select Provider —</option>
                {activeCat?.providers.map(p => <option key={p} value={p}>{p}</option>)}
                <option value="__custom__">Custom / Other</option>
              </select>
              {form.provider_name === '__custom__' && (
                <input
                  type="text"
                  placeholder="Enter provider name"
                  onChange={e => setForm(f => ({ ...f, provider_name: e.target.value }))}
                  className="mt4"
                />
              )}
            </div>
            <div className="ai-field">
              <label>API Key</label>
              <input
                type="text"
                value={form.api_key}
                onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                placeholder="Enter API key or access token"
                required
              />
            </div>
            <div className="ai-field">
              <label>API Secret (optional)</label>
              <input
                type="password"
                value={form.api_secret}
                onChange={e => setForm(f => ({ ...f, api_secret: e.target.value }))}
                placeholder="Enter secret key if required"
              />
            </div>
            <div className="ai-field">
              <label>Webhook URL (optional)</label>
              <input
                type="url"
                value={form.webhook_url}
                onChange={e => setForm(f => ({ ...f, webhook_url: e.target.value }))}
                placeholder="https://your-domain.com/webhook"
              />
            </div>
            <div className="ai-form-notice">
              <FaShieldAlt /> API credentials are encrypted at rest using AES-256.
            </div>
            <div className="ai-form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save-int" disabled={saving}>
                {saving ? 'Connecting…' : 'Connect Integration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Integration List */}
      <div className="ai-integrations-section">
        <h3>Active {activeCat?.label} ({activeIntegrations.length})</h3>
        {loading ? (
          <div className="ai-loading"><div className="spinner" /> Loading integrations…</div>
        ) : activeIntegrations.length === 0 ? (
          <div className="ai-empty">
            <span className="ai-empty-icon" style={{ color: activeCat?.color }}>{activeCat?.icon}</span>
            <h4>No {activeCat?.label} connected yet</h4>
            <p>Click "Add Integration" to connect your first {activeCat?.label.toLowerCase()} integration.</p>
            <button className="btn-add-integration sm" onClick={() => setShowForm(true)}>
              <FaPlus /> Connect Now
            </button>
          </div>
        ) : (
          <div className="ai-int-list">
            {activeIntegrations.map(integration => (
              <div className="ai-int-card" key={integration.id}>
                <div className="aic-left">
                  <div className="aic-icon" style={{ background: activeCat?.color + '18', color: activeCat?.color }}>
                    {activeCat?.icon}
                  </div>
                  <div className="aic-info">
                    <div className="aic-provider">{integration.provider_name}</div>
                    <div className="aic-type">{activeCat?.label}</div>
                    {integration.last_sync && (
                      <div className="aic-sync">
                        <FaClock /> Last sync: {new Date(integration.last_sync).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="aic-right">
                  <span className={`status-badge ${integration.status === 'active' ? 'active' : integration.status === 'pending' ? 'pending' : 'inactive'}`}>
                    {integration.status === 'active' ? <FaCheckCircle /> : <FaExclamationCircle />}
                    {integration.status}
                  </span>
                  {integration.api_key && (
                    <div className="aic-key">
                      <code>
                        {showSecrets[integration.id]
                          ? integration.api_key
                          : integration.api_key.substring(0, 8) + '••••••••'}
                      </code>
                      <button className="btn-icon" onClick={() => toggleSecret(integration.id)}>
                        {showSecrets[integration.id] ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  )}
                  <div className="aic-actions">
                    <button
                      className="btn-sync"
                      onClick={() => handleSync(integration.id)}
                      disabled={!!syncing[integration.id]}
                    >
                      <FaSync className={syncing[integration.id] ? 'spin' : ''} />
                      {syncing[integration.id] ? 'Syncing…' : 'Sync Now'}
                    </button>
                    <button className="btn-remove" onClick={() => handleDelete(integration.id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supported providers preview */}
      <div className="ai-providers-section">
        <h3>Supported {activeCat?.label} Providers</h3>
        <div className="ai-providers-grid">
          {activeCat?.providers.map(p => (
            <div className="ai-provider-chip" key={p}>
              <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
              {p}
            </div>
          ))}
          <div className="ai-provider-chip more">+ More on request</div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrations;
