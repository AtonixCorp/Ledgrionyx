import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { vendorsAPI, purchaseOrdersAPI, billsAPI, billPaymentsAPI } from '../../../services/api';
import { countryDropdownOptions, countryDropdownOptionsByCode, countryDropdownOptionsByName } from '../../../utils/countryDropdowns';
import '../../../styles/EntityPages.css';

const STATUS_COLORS = {
  draft: 'var(--color-silver-dark)', sent: 'var(--color-cyan)', acknowledged: 'var(--color-cyan)', received: 'var(--color-success)', cancelled: 'var(--color-error)',
  posted: 'var(--color-cyan)', partially_paid: 'var(--color-warning)', paid: 'var(--color-success)', overdue: 'var(--color-error)',
  pending_review: 'var(--color-warning)', pending_approval: 'var(--color-cyan)', rejected: 'var(--color-error)', approved: 'var(--color-success)',
  active: 'var(--color-success)', inactive: 'var(--color-silver-dark)', blocked: 'var(--color-error)'
};
const fmt = (v, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));

const APPROVAL_TEXT = (value) => String(value || 'draft').replace(/_/g, ' ');

const TABS = [
  { id: 'vendors', label: 'Vendors', },
  { id: 'purchase-orders', label: 'Purchase Orders', },
  { id: 'bills', label: 'Bills', },
  { id: 'bill-payments', label: 'Bill Payments', },
];

//  Vendors Tab
const VendorsTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ vendor_code: '', vendor_name: '', email: '', phone: '', website: '', service_description: '', country: '', currency: 'USD', payment_terms: 'net_30', contact_person: '', tax_id: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await vendorsAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(v => !search || v.vendor_name.toLowerCase().includes(search.toLowerCase()) || v.vendor_code.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (v) => { setEditing(v); setForm({ vendor_code: v.vendor_code, vendor_name: v.vendor_name, email: v.email || '', phone: v.phone || '', website: v.website || '', service_description: v.service_description || '', country: v.country || '', currency: v.currency || 'USD', payment_terms: v.payment_terms || 'net_30', contact_person: v.contact_person || '', tax_id: v.tax_id || '', status: v.status }); setShowForm(true); };
  const handleNew = () => { setEditing(null); setForm({ vendor_code: '', vendor_name: '', email: '', phone: '', website: '', service_description: '', country: '', currency: 'USD', payment_terms: 'net_30', contact_person: '', tax_id: '', status: 'active' }); setShowForm(true); };

  const selectedCountry = countryDropdownOptionsByCode.get(form.country) || countryDropdownOptionsByName.get(form.country) || null;
  const selectedCountryCode = selectedCountry?.dialCode || (selectedCountry?.code ? `+${selectedCountry.code}` : '');

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, entity: parseInt(entityId) };
      if (editing) { await vendorsAPI.update(editing.id, payload); } else { await vendorsAPI.create(payload); }
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try { await vendorsAPI.delete(id); await load(); } catch (e) { alert('Cannot delete'); }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="acct-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..." /></div>
        <button className="btn-primary" onClick={handleNew}>New Vendor</button>
      </div>
      {loading ? <div className="acct-loading">Loading vendors...</div> : (
        <div className="acct-table-wrap ap-table-wrap">
        <table className="acct-table">
          <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Website</th><th>Services</th><th>Country</th><th>Currency</th><th>Payment Terms</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={10} className="empty-row">No vendors found</td></tr> : filtered.map(v => (
              <tr key={v.id}>
                <td><code className="acct-code">{v.vendor_code}</code></td>
                <td><strong>{v.vendor_name}</strong>{v.contact_person && <div className="acct-desc">{v.contact_person}</div>}</td>
                <td>{v.email || '—'}</td>
                <td>{v.website ? <a href={v.website} target="_blank" rel="noreferrer">{v.website}</a> : '—'}</td>
                <td>{v.service_description || '—'}</td>
                <td>
                  {(() => {
                    const country = countryDropdownOptionsByCode.get(v.country) || countryDropdownOptionsByName.get(v.country);
                    if (!country) return v.country || '—';
                    return `${country.name}${country.dialCode ? ` (${country.dialCode})` : ''}`;
                  })()}
                </td>
                <td>{v.currency}</td>
                <td>{v.payment_terms?.replace('_', '')}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[v.status], color: 'white' }}>{v.status}</span></td>
                <td className="acct-actions"><button className="btn-icon" onClick={() => handleEdit(v)}></button><button className="btn-icon btn-icon-danger" onClick={() => handleDelete(v.id)}></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Vendor' : 'New Vendor'}</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Vendor Code</label><input value={editing ? form.vendor_code : 'Auto-generated on save'} readOnly /></div>
                <div className="form-row"><label>Vendor Name *</label><input value={form.vendor_name} onChange={e => setForm(p => ({ ...p, vendor_name: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Vendor Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="form-row">
                  <label>Vendor Contact Number</label>
                  <div className="phone-input-wrapper">
                    <div className="phone-prefix">
                      <span className="country-flag">{selectedCountry?.flag || ''}</span>
                      <span className="dial-code">{selectedCountryCode}</span>
                    </div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="555 123 4567"
                      className="phone-input"
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <label>Contact Person</label>
                <input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} />
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Website</label><input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} placeholder="https://vendor.com" /></div>
                <div className="form-row"><label>Tax ID</label><input value={form.tax_id} onChange={e => setForm(p => ({ ...p, tax_id: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row">
                  <label>Country</label>
                  <select value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}>
                    <option value="">Select country</option>
                    {countryDropdownOptions.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag ? `${country.flag} ` : ''}{country.name}{country.dialCode ? ` (${country.dialCode})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-row"><label>Currency</label><input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Services Provided to the Company</label><textarea rows="4" value={form.service_description} onChange={e => setForm(p => ({ ...p, service_description: e.target.value }))} placeholder="Describe the products or services the vendor provides to the company." /></div>
              <div className="form-row-2">
                <div className="form-row"><label>Payment Terms</label><select value={form.payment_terms} onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}><option value="net_30">Net 30</option><option value="net_60">Net 60</option><option value="due_date">Due Date</option><option value="immediate">Immediate</option></select></div>
                <div className="form-row"><label>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option></select></div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Save</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Bills Tab
const BillsTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bill_number: '', vendor: '', bill_date: new Date().toISOString().split('T')[0], due_date: '', subtotal: '0', tax_amount: '0', total_amount: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, vr] = await Promise.all([billsAPI.getAll({ entity: entityId }), vendorsAPI.getAll({ entity: entityId })]);
      setItems(r.data.results || r.data); setVendors(vr.data.results || vr.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const vendorsById = new Map(vendors.map((vendor) => [String(vendor.id), vendor]));

  const totalOutstanding = items.reduce((s, i) => s + parseFloat(i.outstanding_amount || 0), 0);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await billsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleSubmit = async (id) => {
    try { await billsAPI.submit(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Submit failed'); }
  };

  const handleApprove = async (id) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try { await billsAPI.approve(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Approve failed'); }
  };

  const handleReject = async (id) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try { await billsAPI.reject(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Reject failed'); }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="ar-summary-mini ap-toolbar-stats">
          <div className="mini-stat"><span>Total Bills</span><strong>{items.length}</strong></div>
          <div className="mini-stat"><span>Outstanding AP</span><strong style={{ color: 'var(--color-error)' }}>{fmt(totalOutstanding)}</strong></div>
          <div className="mini-stat"><span>Overdue</span><strong style={{ color: 'var(--color-error)' }}>{items.filter(i => i.status === 'overdue').length}</strong></div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>New Bill</button>
      </div>
      {loading ? <div className="acct-loading">Loading bills...</div> : (
        <div className="acct-table-wrap ap-table-wrap">
        <table className="acct-table">
          <thead><tr><th>Bill #</th><th>Vendor</th><th>Bill Date</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Approval</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={9} className="empty-row">No bills found</td></tr> : items.map(b => (
              <tr key={b.id}>
                <td><code className="acct-code">{b.bill_number}</code></td>
                <td>{b.vendor_name || `Vendor ${b.vendor}`} {vendorsById.get(String(b.vendor))?.vendor_code ? <span className="acct-code">{vendorsById.get(String(b.vendor)).vendor_code}</span> : null}</td>
                <td>{b.bill_date}</td>
                <td>{b.due_date}</td>
                <td>{fmt(b.total_amount)}</td>
                <td style={{ color: 'var(--color-success)' }}>{fmt(b.paid_amount)}</td>
                <td style={{ color: parseFloat(b.outstanding_amount) > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{fmt(b.outstanding_amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[b.approval_status] || 'var(--color-silver-dark)', color: 'white' }}>{APPROVAL_TEXT(b.approval_status)}</span></td>
                <td className="acct-actions">
                  {['draft', 'rejected'].includes(b.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleSubmit(b.id)}>Submit</button> : null}
                  {['pending_review', 'pending_approval'].includes(b.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleApprove(b.id)}>Approve</button> : null}
                  {['pending_review', 'pending_approval'].includes(b.approval_status) ? <button className="btn-sm btn-danger" onClick={() => handleReject(b.id)}>Reject</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Bill</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Bill Number *</label><input value={form.bill_number} onChange={e => setForm(p => ({ ...p, bill_number: e.target.value }))} placeholder="BILL-001" /></div>
                <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name} {v.vendor_code ? `(${v.vendor_code})` : ''}</option>)}</select></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Bill Date *</label><input type="date" value={form.bill_date} onChange={e => setForm(p => ({ ...p, bill_date: e.target.value }))} /></div>
                <div className="form-row"><label>Due Date *</label><input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Subtotal</label><input type="number" step="0.01" value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value, total_amount: (parseFloat(e.target.value || 0) + parseFloat(p.tax_amount || 0)).toFixed(2) }))} /></div>
                <div className="form-row"><label>Tax Amount</label><input type="number" step="0.01" value={form.tax_amount} onChange={e => setForm(p => ({ ...p, tax_amount: e.target.value, total_amount: (parseFloat(p.subtotal || 0) + parseFloat(e.target.value || 0)).toFixed(2) }))} /></div>
              </div>
              <div className="form-row"><label>Total Amount</label><input type="number" step="0.01" value={form.total_amount} readOnly style={{ background: 'var(--color-silver-white)' }} /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Create Bill</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Bill Payments Tab
const BillPaymentsTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendor: '', bill: '', payment_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'bank_transfer', reference_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, vr, br] = await Promise.all([billPaymentsAPI.getAll({ entity: entityId }), vendorsAPI.getAll({ entity: entityId }), billsAPI.getAll({ entity: entityId })]);
      setItems(r.data.results || r.data); setVendors(vr.data.results || vr.data); setBills(br.data.results || br.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const vendorsById = new Map(vendors.map((vendor) => [String(vendor.id), vendor]));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await billPaymentsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleSubmit = async (id) => {
    try { await billPaymentsAPI.submit(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Submit failed'); }
  };

  const handleApprove = async (id) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try { await billPaymentsAPI.approve(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Approve failed'); }
  };

  const handleReject = async (id) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try { await billPaymentsAPI.reject(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Reject failed'); }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="ap-toolbar-stats">
          <div className="mini-stat"><span>Total Payments</span><strong>{items.length}</strong></div>
          <div className="mini-stat"><span>Total Paid Out</span><strong style={{ color: 'var(--color-error)' }}>{fmt(items.reduce((s, p) => s + parseFloat(p.amount || 0), 0))}</strong></div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>Pay Bill</button>
      </div>
      {loading ? <div className="acct-loading">Loading payments...</div> : (
        <div className="acct-table-wrap ap-table-wrap">
        <table className="acct-table">
          <thead><tr><th>Date</th><th>Vendor</th><th>Bill</th><th>Amount</th><th>Method</th><th>Reference</th><th>Approval</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={8} className="empty-row">No bill payments recorded</td></tr> : items.map(p => (
              <tr key={p.id}>
                <td>{p.payment_date}</td>
                <td>{p.vendor_name || `Vendor ${p.vendor}`} {vendorsById.get(String(p.vendor))?.vendor_code ? <span className="acct-code">{vendorsById.get(String(p.vendor)).vendor_code}</span> : null}</td>
                <td><code className="acct-code">{p.bill_number || `BILL-${p.bill}`}</code></td>
                <td style={{ color: 'var(--color-error)' }}><strong>{fmt(p.amount)}</strong></td>
                <td><span className="tag">{p.payment_method?.replace(/_/g,'')}</span></td>
                <td>{p.reference_number || '—'}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[p.approval_status] || 'var(--color-cyan)', color: 'white' }}>{APPROVAL_TEXT(p.approval_status)}</span></td>
                <td className="acct-actions">
                  {['draft', 'rejected'].includes(p.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleSubmit(p.id)}>Submit</button> : null}
                  {['pending_review', 'pending_approval'].includes(p.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleApprove(p.id)}>Approve</button> : null}
                  {['pending_review', 'pending_approval'].includes(p.approval_status) ? <button className="btn-sm btn-danger" onClick={() => handleReject(p.id)}>Reject</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Pay Bill</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name} {v.vendor_code ? `(${v.vendor_code})` : ''}</option>)}</select></div>
              <div className="form-row"><label>Bill *</label><select value={form.bill} onChange={e => setForm(p => ({ ...p, bill: e.target.value }))}><option value="">Select bill</option>{bills.filter(b => !form.vendor || b.vendor === parseInt(form.vendor)).map(b => <option key={b.id} value={b.id}>{b.bill_number} — {fmt(b.outstanding_amount)} outstanding</option>)}</select></div>
              <div className="form-row-2">
                <div className="form-row"><label>Payment Date *</label><input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} /></div>
                <div className="form-row"><label>Amount *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Method</label><select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}><option value="bank_transfer">Bank Transfer</option><option value="check">Check</option><option value="credit_card">Credit Card</option><option value="cash">Cash</option></select></div>
                <div className="form-row"><label>Reference</label><input value={form.reference_number} onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Pay</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Main AP Module
const APModule = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('vendors');

  return (
    <div className="acct-page ap-module-page">
      <div className="acct-header">
        <div className="ap-header-copy">
          <h1>Accounts Payable</h1>
          <p className="ap-subtitle">Manage vendors, purchase orders, bills, and payments — track money you owe.</p>
          <div className="ap-meta-row">
            <span className="ap-meta-pill">4 workflows</span>
            <span className="ap-meta-pill">Vendor to payment lifecycle</span>
          </div>
        </div>
        <button className="btn-secondary">Export</button>
      </div>

      <div className="module-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`module-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="module-tab-content">
        {activeTab === 'vendors' && <VendorsTab entityId={entityId} />}
        {activeTab === 'purchase-orders' && <PurchaseOrdersTab entityId={entityId} />}
        {activeTab === 'bills' && <BillsTab entityId={entityId} />}
        {activeTab === 'bill-payments' && <BillPaymentsTab entityId={entityId} />}
      </div>
    </div>
  );
};

//  Purchase Orders Tab
const PurchaseOrdersTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ po_number: '', vendor: '', po_date: new Date().toISOString().split('T')[0], expected_delivery_date: '', total_amount: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, vr] = await Promise.all([purchaseOrdersAPI.getAll({ entity: entityId }), vendorsAPI.getAll({ entity: entityId })]);
      setItems(r.data.results || r.data); setVendors(vr.data.results || vr.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const vendorsById = new Map(vendors.map((vendor) => [String(vendor.id), vendor]));

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await purchaseOrdersAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleSubmit = async (id) => {
    try { await purchaseOrdersAPI.submit(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Submit failed'); }
  };

  const handleApprove = async (id) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try { await purchaseOrdersAPI.approve(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Approve failed'); }
  };

  const handleReject = async (id) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try { await purchaseOrdersAPI.reject(id, { comments }); await load(); } catch (e) { alert(e.response?.data?.detail || 'Reject failed'); }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="ap-toolbar-stats">
          <div className="mini-stat"><span>Total POs</span><strong>{items.length}</strong></div>
          <div className="mini-stat"><span>Open</span><strong style={{ color: 'var(--color-cyan)' }}>{items.filter(p => !['received','cancelled'].includes(p.status)).length}</strong></div>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>New PO</button>
      </div>
      {loading ? <div className="acct-loading">Loading purchase orders...</div> : (
        <div className="acct-table-wrap ap-table-wrap">
        <table className="acct-table">
          <thead><tr><th>PO #</th><th>Vendor</th><th>Date</th><th>Expected Delivery</th><th>Total</th><th>Approval</th><th>Actions</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={7} className="empty-row">No purchase orders found</td></tr> : items.map(p => (
              <tr key={p.id}>
                <td><code className="acct-code">{p.po_number}</code></td>
                <td>{p.vendor_name || `Vendor ${p.vendor}`} {vendorsById.get(String(p.vendor))?.vendor_code ? <span className="acct-code">{vendorsById.get(String(p.vendor)).vendor_code}</span> : null}</td>
                <td>{p.po_date}</td>
                <td>{p.expected_delivery_date || '—'}</td>
                <td>{fmt(p.total_amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[p.approval_status] || 'var(--color-silver-dark)', color: 'white' }}>{APPROVAL_TEXT(p.approval_status)}</span></td>
                <td className="acct-actions">
                  {['draft', 'rejected'].includes(p.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleSubmit(p.id)}>Submit</button> : null}
                  {['pending_review', 'pending_approval'].includes(p.approval_status) ? <button className="btn-sm btn-success" onClick={() => handleApprove(p.id)}>Approve</button> : null}
                  {['pending_review', 'pending_approval'].includes(p.approval_status) ? <button className="btn-sm btn-danger" onClick={() => handleReject(p.id)}>Reject</button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Purchase Order</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>PO Number *</label><input value={form.po_number} onChange={e => setForm(p => ({ ...p, po_number: e.target.value }))} placeholder="PO-001" /></div>
                <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name} {v.vendor_code ? `(${v.vendor_code})` : ''}</option>)}</select></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>PO Date *</label><input type="date" value={form.po_date} onChange={e => setForm(p => ({ ...p, po_date: e.target.value }))} /></div>
                <div className="form-row"><label>Expected Delivery</label><input type="date" value={form.expected_delivery_date} onChange={e => setForm(p => ({ ...p, expected_delivery_date: e.target.value }))} /></div>
              </div>
              <div className="form-row"><label>Total Amount</label><input type="number" step="0.01" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Create PO</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APModule;
