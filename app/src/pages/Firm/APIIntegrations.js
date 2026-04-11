import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useEnterprise } from '../../context/EnterpriseContext';
import {
  bankingIntegrationsAPI,
  bankingTransactionsAPI,
  entitiesAPI,
} from '../../services/api';
import './APIIntegrations.css';

const INTEGRATION_CATEGORIES = [
  {
    key: 'banks',
    icon: 'BK',
    label: 'Bank Feeds',
    color: 'var(--color-cyan-dark)',
    description: 'Connect bank accounts for real-time transaction sync and reconciliation',
    providers: [
      { code: 'plaid', name: 'Plaid' },
      { code: 'yodlee', name: 'Yodlee' },
      { code: 'finicity', name: 'Finicity' },
    ],
  },
  {
    key: 'payments',
    icon: 'PM',
    label: 'Payment Processors',
    color: 'var(--color-cyan-dark)',
    description: 'Sync payment data from processors to automate revenue recognition',
    providers: [
      { code: 'stripe', name: 'Stripe' },
      { code: 'paypal', name: 'PayPal' },
      { code: 'square', name: 'Square' },
      { code: 'adyen', name: 'Adyen' },
    ],
  },
  {
    key: 'tax',
    icon: 'TX',
    label: 'Tax Authorities',
    color: 'var(--color-warning)',
    description: 'Direct integration with government tax portals for automated filing',
    providers: [
      { code: 'irs', name: 'IRS (USA)' },
      { code: 'hmrc', name: 'HMRC (UK)' },
      { code: 'ato', name: 'ATO (Australia)' },
      { code: 'cra', name: 'CRA (Canada)' },
    ],
  },
  {
    key: 'payroll',
    icon: 'PR',
    label: 'Payroll Systems',
    color: 'var(--color-cyan-dark)',
    description: 'Sync payroll data for automated journal entries and cost allocation',
    providers: [
      { code: 'gusto', name: 'Gusto' },
      { code: 'adp', name: 'ADP' },
      { code: 'paychex', name: 'Paychex' },
      { code: 'rippling', name: 'Rippling' },
    ],
  },
];

const CATEGORY_OPTIONS = [
  'Uncategorized',
  'Food & Beverage',
  'Food Delivery',
  'Fuel',
  'Insurance',
  'Logistics',
  'Marketing',
  'Meals',
  'Payroll',
  'Software',
  'Transportation',
  'Travel',
  'Utilities',
];

const BUCKET_OPTIONS = [
  'Needs Review',
  'Operating Expenses',
  'Growth',
  'Operations',
  'People Ops',
  'Risk & Compliance',
  'Technology',
  'Transportation',
  'Travel',
  'Treasury Ops',
  'Utilities',
];

const emptyForm = {
  integration_type: 'open_banking',
  provider_code: 'plaid',
  provider_name: 'Plaid',
  entity: '',
  api_key: '',
  api_secret: '',
  webhook_url: '',
  scopes: ['accounts:read', 'transactions:read', 'balances:read'],
};

const normalizeItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.results) ? payload.results : [];
};

const TYPE_TO_CATEGORY = {
  open_banking: 'banks',
  payment_processor: 'payments',
  financial_data: 'tax',
  loan_provider: 'payroll',
};

const CATEGORY_TO_TYPE = {
  banks: 'open_banking',
  payments: 'payment_processor',
  tax: 'financial_data',
  payroll: 'loan_provider',
};

const APIIntegrations = () => {
  const { currentOrganization } = useEnterprise();
  const [integrations, setIntegrations] = useState([]);
  const [entities, setEntities] = useState([]);
  const [bankTransactions, setBankTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('banks');
  const [syncing, setSyncing] = useState({});
  const [selectedIntegrationId, setSelectedIntegrationId] = useState('');
  const [transactionDrafts, setTransactionDrafts] = useState({});
  const [filters, setFilters] = useState({
    entity: '',
    merchant: '',
    category: '',
    accountQuery: '',
    start_date: '',
    end_date: '',
  });

  const loadIntegrations = useCallback(async () => {
    if (!currentOrganization) return;
    setLoading(true);
    try {
      const response = await bankingIntegrationsAPI.getAll({ organization: currentOrganization.id });
      setIntegrations(normalizeItems(response.data));
    } catch (requestError) {
      setError('Failed to load integrations.');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  const loadEntities = useCallback(async () => {
    if (!currentOrganization) return;
    try {
      const response = await entitiesAPI.getAll({ organization_id: currentOrganization.id });
      const items = normalizeItems(response.data);
      setEntities(items);
      setFilters((previous) => ({
        ...previous,
        entity: previous.entity || items[0]?.id || '',
      }));
      setForm((previous) => ({
        ...previous,
        entity: previous.entity || items[0]?.id || '',
      }));
    } catch {
      setError('Failed to load entities for bank connections.');
    }
  }, [currentOrganization]);

  const loadTransactions = useCallback(async () => {
    if (activeCategory !== 'banks') return;
    setTransactionsLoading(true);
    try {
      const params = {
        entity: filters.entity || undefined,
        merchant: filters.merchant || undefined,
        category: filters.category || undefined,
        integration: selectedIntegrationId || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      };
      const response = await bankingTransactionsAPI.getAll(params);
      const items = normalizeItems(response.data);
      setBankTransactions(items);
      setTransactionDrafts(
        items.reduce((accumulator, item) => {
          accumulator[item.id] = {
            category_name: item.normalized_category || 'Uncategorized',
            dashboard_bucket: item.dashboard_bucket || 'Needs Review',
          };
          return accumulator;
        }, {})
      );
    } catch {
      setError('Failed to load bank transactions.');
    } finally {
      setTransactionsLoading(false);
    }
  }, [activeCategory, filters.category, filters.end_date, filters.entity, filters.merchant, filters.start_date, selectedIntegrationId]);

  useEffect(() => {
    loadIntegrations();
    loadEntities();
  }, [loadEntities, loadIntegrations]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const integrationId = params.get('bank_integration');
    const code = params.get('code');
    const state = params.get('state');
    if (!integrationId || !code || !state) return;

    let active = true;
    const finishConsent = async () => {
      try {
        const response = await bankingIntegrationsAPI.completeConsent(integrationId, {
          state,
          code,
          authorization_code: code,
        });
        if (!active) return;
        setSuccess(`${response.data.integration.provider_name} consent completed. Tokens stored securely and ready for sync.`);
        await loadIntegrations();
        await loadTransactions();
      } catch {
        if (!active) return;
        setError('Bank consent callback could not be completed.');
      } finally {
        if (active) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    finishConsent();
    return () => {
      active = false;
    };
  }, [loadIntegrations, loadTransactions]);

  const activeIntegrations = useMemo(() => integrations.filter(
    i => TYPE_TO_CATEGORY[i.integration_type] === activeCategory
  ), [integrations, activeCategory]);

  const displayedTransactions = useMemo(() => {
    const accountQuery = filters.accountQuery.trim().toLowerCase();
    if (!accountQuery) return bankTransactions;
    return bankTransactions.filter((item) => (item.bank_account_name || '').toLowerCase().includes(accountQuery));
  }, [bankTransactions, filters.accountQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        integration_type: CATEGORY_TO_TYPE[activeCategory] || form.integration_type,
        organization: currentOrganization?.id,
      };

      if (activeCategory === 'banks') {
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        const response = await bankingIntegrationsAPI.consentSession({
          ...payload,
          redirect_uri: redirectUri,
        });
        const nextUrl = response.data.consent_url;
        if (nextUrl) {
          window.location.assign(nextUrl);
          return;
        }
      } else {
        await bankingIntegrationsAPI.create(payload);
        setSuccess('Integration added successfully. Credentials are stored encrypted at rest.');
        await loadIntegrations();
      }
    } catch {
      setError(activeCategory === 'banks' ? 'Failed to start bank consent.' : 'Failed to create integration.');
    } finally {
      setForm(emptyForm);
      setShowForm(false);
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this integration?')) return;
    try {
      await bankingIntegrationsAPI.delete(id);
    } catch {}
    setIntegrations(prev => prev.filter(i => i.id !== id));
  };

  const handleSync = async (id) => {
    setSyncing(prev => ({ ...prev, [id]: true }));
    try {
      const response = await bankingIntegrationsAPI.sync(id, {});
      setIntegrations(prev => prev.map(i => (
        i.id === id
          ? { ...i, last_sync: response.data.completed_at || new Date().toISOString(), status: 'active', is_active: true }
          : i
      )));
      await loadTransactions();
      setSuccess(`Sync completed. ${response.data.transactions_processed || 0} transactions processed.`);
    } catch {
      setError('Sync failed. The integration has been left in a safe state for retry.');
    } finally {
      setSyncing(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const handleDraftChange = (transactionId, field, value) => {
    setTransactionDrafts((previous) => ({
      ...previous,
      [transactionId]: {
        ...(previous[transactionId] || {}),
        [field]: value,
      },
    }));
  };

  const handleOverride = async (transactionId) => {
    const draft = transactionDrafts[transactionId] || {};
    try {
      const response = await bankingTransactionsAPI.overrideCategory(transactionId, {
        category_name: draft.category_name,
        dashboard_bucket: draft.dashboard_bucket,
        explanation: 'Category override submitted from the integrations review console.',
      });
      setBankTransactions((previous) => previous.map((item) => (item.id === transactionId ? response.data : item)));
      setSuccess('Category override saved and added to the learning loop.');
    } catch {
      setError('Failed to save the category override.');
    }
  };

  const activeCat = INTEGRATION_CATEGORIES.find(c => c.key === activeCategory);

  return (
    <div className="api-integrations">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h1>API Integrations</h1>
          <p>Connect your platform with banks, payment processors, tax authorities, and payroll systems.</p>
        </div>
        <button className="btn-add-integration" onClick={() => setShowForm(!showForm)}>
          {activeCategory === 'banks' ? 'Connect Bank' : 'Add Integration'}
        </button>
      </div>

      {success && <div className="ai-alert success"> {success}</div>}
      {error && <div className="ai-alert error"> {error}</div>}

      {/* Category tabs */}
      <div className="ai-categories">
        {INTEGRATION_CATEGORIES.map(cat => {
          const count = integrations.filter(i => TYPE_TO_CATEGORY[i.integration_type] === cat.key).length;
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
          <h3>Add {activeCat?.label} Integration</h3>
          <form onSubmit={handleSubmit} className="ai-form">
            <div className="ai-field">
              <label>Provider</label>
              <select
                value={form.provider_code}
                onChange={e => {
                  const provider = activeCat?.providers.find((item) => item.code === e.target.value);
                  setForm((previous) => ({
                    ...previous,
                    provider_code: e.target.value,
                    provider_name: provider?.name || e.target.value,
                  }));
                }}
                required
              >
                <option value="">— Select Provider —</option>
                {activeCat?.providers.map((provider) => (
                  <option key={provider.code} value={provider.code}>{provider.name}</option>
                ))}
              </select>
            </div>
            {activeCategory === 'banks' && (
              <div className="ai-field">
                <label>Entity</label>
                <select
                  value={form.entity}
                  onChange={(e) => setForm((previous) => ({ ...previous, entity: e.target.value }))}
                  required
                >
                  <option value="">— Select Entity —</option>
                  {entities.map((entity) => (
                    <option key={entity.id} value={entity.id}>{entity.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="ai-field">
              <label>{activeCategory === 'banks' ? 'Client ID / Public Token (optional)' : 'API Key'}</label>
              <input
                type="text"
                value={form.api_key}
                onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                placeholder={activeCategory === 'banks' ? 'Optional override; defaults to environment config' : 'Enter API key or access token'}
              />
            </div>
            <div className="ai-field">
              <label>{activeCategory === 'banks' ? 'Client Secret (optional)' : 'API Secret (optional)'}</label>
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
              Tokens and credentials are encrypted at rest using AES-256. Explicit consent is logged for audit and compliance review.
            </div>
            <div className="ai-form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-save-int" disabled={saving}>
                {saving ? 'Connecting…' : activeCategory === 'banks' ? 'Start Consent Flow' : 'Connect Integration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Integration List */}
      <div className="ai-integrations-section">
        <h3>Active {activeCat?.label} ({activeIntegrations.length})</h3>
        {loading ? (
          <div className="ai-loading"><div className="spinner" />Loading integrations…</div>
        ) : activeIntegrations.length === 0 ? (
          <div className="ai-empty">
            <span className="ai-empty-icon" style={{ color: activeCat?.color }}>{activeCat?.icon}</span>
            <h4>No {activeCat?.label} connected yet</h4>
            <p>Click the action above to connect your first {activeCat?.label.toLowerCase()} integration.</p>
            <button className="btn-add-integration sm" onClick={() => setShowForm(true)}>
              Connect Now
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
                    <div className="aic-type">{integration.entity_name ? `${integration.entity_name} · ${activeCat?.label}` : activeCat?.label}</div>
                    {integration.last_sync && (
                      <div className="aic-sync">
                        Last sync: {new Date(integration.last_sync).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="aic-right">
                  <span className={`status-badge ${integration.status === 'active' ? 'active' : integration.status === 'pending' ? 'pending' : 'inactive'}`}>

                    {integration.status}
                  </span>
                  {integration.masked_api_key && <div className="aic-key">Key: {integration.masked_api_key}</div>}
                  {activeCategory === 'banks' && integration.consent_granted_at && (
                    <div className="aic-key">Consent: {new Date(integration.consent_granted_at).toLocaleString()}</div>
                  )}
                  <div className="aic-actions">
                    {activeCategory === 'banks' && (
                      <button
                        className="btn-sync"
                        onClick={() => setSelectedIntegrationId((current) => (current === String(integration.id) ? '' : String(integration.id)))}
                      >
                        {selectedIntegrationId === String(integration.id) ? 'Show All' : 'Review Feed'}
                      </button>
                    )}
                    <button
                      className="btn-sync"
                      onClick={() => handleSync(integration.id)}
                      disabled={!!syncing[integration.id]}
                    >

                      {syncing[integration.id] ? 'Syncing…' : 'Sync Now'}
                    </button>
                    <button className="btn-remove" onClick={() => handleDelete(integration.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeCategory === 'banks' && (
        <div className="ai-integrations-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div>
              <h3>Imported Transactions</h3>
              <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
                Review imported activity, apply filters, and override categories. Each decision is added to the audit trail and learning loop.
              </p>
            </div>
          </div>

          <div className="ai-form" style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            <div className="ai-field">
              <label>Entity</label>
              <select value={filters.entity} onChange={(e) => setFilters((previous) => ({ ...previous, entity: e.target.value }))}>
                <option value="">All accessible entities</option>
                {entities.map((entity) => (
                  <option key={entity.id} value={entity.id}>{entity.name}</option>
                ))}
              </select>
            </div>
            <div className="ai-field">
              <label>Merchant</label>
              <input value={filters.merchant} onChange={(e) => setFilters((previous) => ({ ...previous, merchant: e.target.value }))} placeholder="Starbucks, Uber, AWS" />
            </div>
            <div className="ai-field">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => setFilters((previous) => ({ ...previous, category: e.target.value }))}>
                <option value="">All categories</option>
                {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="ai-field">
              <label>Account</label>
              <input value={filters.accountQuery} onChange={(e) => setFilters((previous) => ({ ...previous, accountQuery: e.target.value }))} placeholder="Checking, Treasury" />
            </div>
            <div className="ai-field">
              <label>Start Date</label>
              <input type="date" value={filters.start_date} onChange={(e) => setFilters((previous) => ({ ...previous, start_date: e.target.value }))} />
            </div>
            <div className="ai-field">
              <label>End Date</label>
              <input type="date" value={filters.end_date} onChange={(e) => setFilters((previous) => ({ ...previous, end_date: e.target.value }))} />
            </div>
          </div>

          {transactionsLoading ? (
            <div className="ai-loading"><div className="spinner" />Loading transactions…</div>
          ) : displayedTransactions.length === 0 ? (
            <div className="ai-empty">
              <h4>No imported bank transactions match the current filters.</h4>
              <p>Run a sync or clear the filters to review the current bank feed.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: 18 }}>
              <table className="expenses-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Merchant</th>
                    <th>Account</th>
                    <th>Raw Category</th>
                    <th>Assigned Category</th>
                    <th>Dashboard Bucket</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTransactions.map((transaction) => {
                    const draft = transactionDrafts[transaction.id] || {};
                    return (
                      <tr key={transaction.id}>
                        <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                        <td>
                          <strong>{transaction.merchant_name || transaction.counterparty_name || 'Unknown merchant'}</strong>
                          <div style={{ opacity: 0.7, marginTop: 4 }}>{transaction.description}</div>
                        </td>
                        <td>{transaction.bank_account_name || 'Unlinked account'}</td>
                        <td>{transaction.raw_category || 'n/a'}</td>
                        <td>
                          <select
                            value={draft.category_name || transaction.normalized_category || 'Uncategorized'}
                            onChange={(e) => handleDraftChange(transaction.id, 'category_name', e.target.value)}
                          >
                            {CATEGORY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </td>
                        <td>
                          <select
                            value={draft.dashboard_bucket || transaction.dashboard_bucket || 'Needs Review'}
                            onChange={(e) => handleDraftChange(transaction.id, 'dashboard_bucket', e.target.value)}
                          >
                            {BUCKET_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                          </select>
                        </td>
                        <td>{Number(transaction.amount || 0).toFixed(2)} {transaction.currency}</td>
                        <td>
                          <span className={`status-badge ${transaction.status === 'completed' ? 'active' : transaction.status === 'pending' ? 'pending' : 'inactive'}`}>
                            {transaction.categorization_source ? `${transaction.status} · ${transaction.categorization_source}` : transaction.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-sync" onClick={() => handleOverride(transaction.id)}>Save</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Supported providers preview */}
      <div className="ai-providers-section">
        <h3>Supported {activeCat?.label} Providers</h3>
        <div className="ai-providers-grid">
          {activeCat?.providers.map(provider => (
            <div className="ai-provider-chip" key={provider.code}>
              <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
              {provider.name}
            </div>
          ))}
          <div className="ai-provider-chip more">+ More on request</div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrations;
