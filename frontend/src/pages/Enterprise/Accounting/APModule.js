import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { vendorsAPI, purchaseOrdersAPI, billsAPI, billPaymentsAPI } from '../../../services/api';
import '../../../styles/EntityPages.css';

const STATUS_COLORS = {
  draft: 'var(--color-silver-dark)', sent: 'var(--color-cyan)', acknowledged: 'var(--color-cyan)', received: 'var(--color-success)', cancelled: 'var(--color-error)',
  posted: 'var(--color-cyan)', partially_paid: 'var(--color-warning)', paid: 'var(--color-success)', overdue: 'var(--color-error)',
  active: 'var(--color-success)', inactive: 'var(--color-silver-dark)', blocked: 'var(--color-error)'
};
const fmt = (v, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));

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
  const [form, setForm] = useState({ vendor_code: '', vendor_name: '', email: '', phone: '', country: '', currency: 'USD', payment_terms: 'net_30', contact_person: '', tax_id: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await vendorsAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(v => !search || v.vendor_name.toLowerCase().includes(search.toLowerCase()) || v.vendor_code.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (v) => { setEditing(v); setForm({ vendor_code: v.vendor_code, vendor_name: v.vendor_name, email: v.email || '', phone: v.phone || '', country: v.country || '', currency: v.currency || 'USD', payment_terms: v.payment_terms || 'net_30', contact_person: v.contact_person || '', tax_id: v.tax_id || '', status: v.status }); setShowForm(true); };
  const handleNew = () => { setEditing(null); setForm({ vendor_code: '', vendor_name: '', email: '', phone: '', country: '', currency: 'USD', payment_terms: 'net_30', contact_person: '', tax_id: '', status: 'active' }); setShowForm(true); };

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
          <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Country</th><th>Currency</th><th>Payment Terms</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={8} className="empty-row">No vendors found</td></tr> : filtered.map(v => (
              <tr key={v.id}>
                <td><code className="acct-code">{v.vendor_code}</code></td>
                <td><strong>{v.vendor_name}</strong>{v.contact_person && <div className="acct-desc">{v.contact_person}</div>}</td>
                <td>{v.email || '—'}</td>
                <td>{v.country || '—'}</td>
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
                <div className="form-row"><label>Vendor Code *</label><input value={form.vendor_code} onChange={e => setForm(p => ({ ...p, vendor_code: e.target.value }))} placeholder="VEND-001" /></div>
                <div className="form-row"><label>Vendor Name *</label><input value={form.vendor_name} onChange={e => setForm(p => ({ ...p, vendor_name: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="form-row"><label>Contact Person</label><input value={form.contact_person} onChange={e => setForm(p => ({ ...p, contact_person: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Country</label><input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                <div className="form-row"><label>Currency</label><input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} /></div>
              </div>
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

  const totalOutstanding = items.reduce((s, i) => s + parseFloat(i.outstanding_amount || 0), 0);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await billsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
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
          <thead><tr><th>Bill #</th><th>Vendor</th><th>Bill Date</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={8} className="empty-row">No bills found</td></tr> : items.map(b => (
              <tr key={b.id}>
                <td><code className="acct-code">{b.bill_number}</code></td>
                <td>{b.vendor_name || `Vendor ${b.vendor}`}</td>
                <td>{b.bill_date}</td>
                <td>{b.due_date}</td>
                <td>{fmt(b.total_amount)}</td>
                <td style={{ color: 'var(--color-success)' }}>{fmt(b.paid_amount)}</td>
                <td style={{ color: parseFloat(b.outstanding_amount) > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>{fmt(b.outstanding_amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[b.status] || 'var(--color-silver-dark)', color: 'white' }}>{b.status?.replace(/_/g,'')}</span></td>
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
                <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}</select></div>
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

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await billPaymentsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
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
          <thead><tr><th>Date</th><th>Vendor</th><th>Bill</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={7} className="empty-row">No bill payments recorded</td></tr> : items.map(p => (
              <tr key={p.id}>
                <td>{p.payment_date}</td>
                <td>{p.vendor_name || `Vendor ${p.vendor}`}</td>
                <td><code className="acct-code">{p.bill_number || `BILL-${p.bill}`}</code></td>
                <td style={{ color: 'var(--color-error)' }}><strong>{fmt(p.amount)}</strong></td>
                <td><span className="tag">{p.payment_method?.replace(/_/g,'')}</span></td>
                <td>{p.reference_number || '—'}</td>
                <td><span className="status-badge" style={{ background: 'var(--color-cyan)', color: 'white' }}>{p.status}</span></td>
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
              <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}</select></div>
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

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await purchaseOrdersAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
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
          <thead><tr><th>PO #</th><th>Vendor</th><th>Date</th><th>Expected Delivery</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={6} className="empty-row">No purchase orders found</td></tr> : items.map(p => (
              <tr key={p.id}>
                <td><code className="acct-code">{p.po_number}</code></td>
                <td>{p.vendor_name || `Vendor ${p.vendor}`}</td>
                <td>{p.po_date}</td>
                <td>{p.expected_delivery_date || '—'}</td>
                <td>{fmt(p.total_amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[p.status] || 'var(--color-silver-dark)', color: 'white' }}>{p.status}</span></td>
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
                <div className="form-row"><label>Vendor *</label><select value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select vendor</option>{vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}</select></div>
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
