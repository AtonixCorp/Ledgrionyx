import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { customersAPI, invoicesAPI, creditNotesAPI, paymentsAPI } from '../../../services/api';

const STATUS_COLORS = {
  draft: '#a0aec0', posted: '#4299e1', partially_paid: '#ed8936',
  paid: '#48bb78', overdue: '#e53e3e', cancelled: '#718096',
  active: '#48bb78', inactive: '#a0aec0', blacklisted: '#e53e3e'
};

const TABS = [
  { id: 'customers', label: 'Customers', },
  { id: 'invoices', label: 'Invoices', },
  { id: 'payments', label: 'Payments', },
  { id: 'credit-notes', label: 'Credit Notes', },
];

const fmt = (v, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(v || 0));
};

//  Customers Tab
const CustomersTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customer_code: '', customer_name: '', email: '', phone: '', country: '', currency: 'USD', payment_terms: 'net_30', credit_limit: '0', tax_id: '', status: 'active' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await customersAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(c => !search || c.customer_name.toLowerCase().includes(search.toLowerCase()) || c.customer_code.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (c) => { setEditing(c); setForm({ customer_code: c.customer_code, customer_name: c.customer_name, email: c.email || '', phone: c.phone || '', country: c.country || '', currency: c.currency || 'USD', payment_terms: c.payment_terms || 'net_30', credit_limit: c.credit_limit || '0', tax_id: c.tax_id || '', status: c.status }); setShowForm(true); };
  const handleNew = () => { setEditing(null); setForm({ customer_code: '', customer_name: '', email: '', phone: '', country: '', currency: 'USD', payment_terms: 'net_30', credit_limit: '0', tax_id: '', status: 'active' }); setShowForm(true); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const payload = { ...form, entity: parseInt(entityId) };
      if (editing) { await customersAPI.update(editing.id, payload); } else { await customersAPI.create(payload); }
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer?')) return;
    try { await customersAPI.delete(id); await load(); } catch (e) { alert('Cannot delete'); }
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="acct-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." /></div>
        <button className="btn-primary" onClick={handleNew}>New Customer</button>
      </div>
      <div className="ar-summary-mini">
        <div className="mini-stat"><span>Total</span><strong>{items.length}</strong></div>
        <div className="mini-stat"><span>Active</span><strong style={{ color: '#48bb78' }}>{items.filter(c => c.status === 'active').length}</strong></div>
        <div className="mini-stat"><span>Inactive</span><strong style={{ color: '#a0aec0' }}>{items.filter(c => c.status !== 'active').length}</strong></div>
      </div>
      {loading ? <div className="acct-loading">Loading customers...</div> : (
        <table className="acct-table">
          <thead><tr><th>Code</th><th>Name</th><th>Email</th><th>Country</th><th>Currency</th><th>Payment Terms</th><th>Credit Limit</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={9} className="empty-row">No customers found</td></tr> : filtered.map(c => (
              <tr key={c.id}>
                <td><code className="acct-code">{c.customer_code}</code></td>
                <td><strong>{c.customer_name}</strong></td>
                <td>{c.email || '—'}</td>
                <td>{c.country || '—'}</td>
                <td>{c.currency}</td>
                <td>{c.payment_terms?.replace('_', '')}</td>
                <td>{fmt(c.credit_limit, c.currency)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[c.status], color: 'white' }}>{c.status}</span></td>
                <td className="acct-actions"><button className="btn-icon" onClick={() => handleEdit(c)}></button><button className="btn-icon btn-icon-danger" onClick={() => handleDelete(c.id)}></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editing ? 'Edit Customer' : 'New Customer'}</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Customer Code *</label><input value={form.customer_code} onChange={e => setForm(p => ({ ...p, customer_code: e.target.value }))} placeholder="CUST-001" /></div>
                <div className="form-row"><label>Customer Name *</label><input value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Email</label><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div className="form-row"><label>Phone</label><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Country</label><input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} /></div>
                <div className="form-row"><label>Currency</label><input value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))} placeholder="USD" /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Payment Terms</label><select value={form.payment_terms} onChange={e => setForm(p => ({ ...p, payment_terms: e.target.value }))}><option value="net_30">Net 30</option><option value="net_60">Net 60</option><option value="due_date">Due Date</option><option value="immediate">Immediate</option></select></div>
                <div className="form-row"><label>Credit Limit</label><input type="number" step="0.01" value={form.credit_limit} onChange={e => setForm(p => ({ ...p, credit_limit: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Tax ID</label><input value={form.tax_id} onChange={e => setForm(p => ({ ...p, tax_id: e.target.value }))} /></div>
                <div className="form-row"><label>Status</label><select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option><option value="blacklisted">Blacklisted</option></select></div>
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

//  Invoices Tab
const InvoicesTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ invoice_number: '', customer: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', subtotal: '0', tax_amount: '0', total_amount: '0', status: 'draft' });
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, cr] = await Promise.all([invoicesAPI.getAll({ entity: entityId, status: filterStatus || undefined }), customersAPI.getAll({ entity: entityId })]);
      setItems(r.data.results || r.data);
      setCustomers(cr.data.results || cr.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => !search || i.invoice_number?.toLowerCase().includes(search.toLowerCase()) || i.customer_name?.toLowerCase().includes(search.toLowerCase()));

  const handlePost = async (id) => {
    try { await invoicesAPI.post(id); await load(); } catch (e) { alert(e.response?.data?.detail || 'Post failed'); }
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await invoicesAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false);
      setForm({ invoice_number: '', customer: '', invoice_date: new Date().toISOString().split('T')[0], due_date: '', subtotal: '0', tax_amount: '0', total_amount: '0', status: 'draft' });
      await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  const totalOutstanding = items.reduce((s, i) => s + parseFloat(i.outstanding_amount || 0), 0);
  const totalPaid = items.reduce((s, i) => s + parseFloat(i.paid_amount || 0), 0);

  return (
    <div>
      <div className="tab-toolbar">
        <div className="acct-search"><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." /></div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="acct-select">
          <option value="">All Statuses</option>
          {['draft','posted','partially_paid','paid','overdue','cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g,'')}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setShowForm(true)}>New Invoice</button>
      </div>
      <div className="ar-summary-mini">
        <div className="mini-stat"><span>Total Invoices</span><strong>{items.length}</strong></div>
        <div className="mini-stat"><span>Outstanding</span><strong style={{ color: '#e53e3e' }}>{fmt(totalOutstanding)}</strong></div>
        <div className="mini-stat"><span>Collected</span><strong style={{ color: '#48bb78' }}>{fmt(totalPaid)}</strong></div>
        <div className="mini-stat"><span>Overdue</span><strong style={{ color: '#e53e3e' }}>{items.filter(i => i.status === 'overdue').length}</strong></div>
      </div>
      {loading ? <div className="acct-loading">Loading invoices...</div> : (
        <table className="acct-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Date</th><th>Due Date</th><th>Total</th><th>Paid</th><th>Outstanding</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? <tr><td colSpan={9} className="empty-row">No invoices found</td></tr> : filtered.map(i => (
              <tr key={i.id}>
                <td><code className="acct-code">{i.invoice_number}</code></td>
                <td>{i.customer_name || `Customer ${i.customer}`}</td>
                <td>{i.invoice_date}</td>
                <td>{i.due_date}</td>
                <td>{fmt(i.total_amount)}</td>
                <td style={{ color: '#48bb78' }}>{fmt(i.paid_amount)}</td>
                <td style={{ color: parseFloat(i.outstanding_amount) > 0 ? '#e53e3e' : '#48bb78' }}>{fmt(i.outstanding_amount)}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[i.status], color: 'white' }}>{i.status?.replace(/_/g,'')}</span></td>
                <td className="acct-actions">{i.status === 'draft' && <button className="btn-sm btn-success" onClick={() => handlePost(i.id)}>Post</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>New Invoice</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row-2">
                <div className="form-row"><label>Invoice Number *</label><input value={form.invoice_number} onChange={e => setForm(p => ({ ...p, invoice_number: e.target.value }))} placeholder="INV-001" /></div>
                <div className="form-row"><label>Customer *</label><select value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}</select></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Invoice Date *</label><input type="date" value={form.invoice_date} onChange={e => setForm(p => ({ ...p, invoice_date: e.target.value }))} /></div>
                <div className="form-row"><label>Due Date *</label><input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Subtotal</label><input type="number" step="0.01" value={form.subtotal} onChange={e => setForm(p => ({ ...p, subtotal: e.target.value, total_amount: (parseFloat(e.target.value || 0) + parseFloat(p.tax_amount || 0)).toFixed(2) }))} /></div>
                <div className="form-row"><label>Tax Amount</label><input type="number" step="0.01" value={form.tax_amount} onChange={e => setForm(p => ({ ...p, tax_amount: e.target.value, total_amount: (parseFloat(p.subtotal || 0) + parseFloat(e.target.value || 0)).toFixed(2) }))} /></div>
              </div>
              <div className="form-row"><label>Total Amount</label><input type="number" step="0.01" value={form.total_amount} onChange={e => setForm(p => ({ ...p, total_amount: e.target.value }))} /></div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Create Invoice</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Payments Tab
const PaymentsTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer: '', invoice: '', payment_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'bank_transfer', reference_number: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, cr, ir] = await Promise.all([paymentsAPI.getAll({ entity: entityId }), customersAPI.getAll({ entity: entityId }), invoicesAPI.getAll({ entity: entityId })]);
      setItems(r.data.results || r.data);
      setCustomers(cr.data.results || cr.data);
      setInvoices(ir.data.results || ir.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      await paymentsAPI.create({ ...form, entity: parseInt(entityId) });
      setShowForm(false); await load();
    } catch (e) { setError(JSON.stringify(e.response?.data) || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="tab-toolbar">
        <div className="mini-stat"><span>Total Payments</span><strong>{items.length}</strong></div>
        <div className="mini-stat"><span>Total Received</span><strong style={{ color: '#48bb78' }}>{fmt(items.reduce((s, p) => s + parseFloat(p.amount || 0), 0))}</strong></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>Record Payment</button>
      </div>
      {loading ? <div className="acct-loading">Loading payments...</div> : (
        <table className="acct-table">
          <thead><tr><th>Date</th><th>Customer</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Reference</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={7} className="empty-row">No payments recorded</td></tr> : items.map(p => (
              <tr key={p.id}>
                <td>{p.payment_date}</td>
                <td>{p.customer_name || `Customer ${p.customer}`}</td>
                <td><code className="acct-code">{p.invoice_number || `INV-${p.invoice}`}</code></td>
                <td style={{ color: '#48bb78' }}><strong>{fmt(p.amount)}</strong></td>
                <td><span className="tag">{p.payment_method?.replace(/_/g,'')}</span></td>
                <td>{p.reference_number || '—'}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[p.status] || '#4299e1', color: 'white' }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Record Payment</h2><button onClick={() => setShowForm(false)}></button></div>
            {error && <div className="modal-error">{error}</div>}
            <div className="modal-body">
              <div className="form-row"><label>Customer *</label><select value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}><option value="">Select customer</option>{customers.map(c => <option key={c.id} value={c.id}>{c.customer_name}</option>)}</select></div>
              <div className="form-row"><label>Invoice *</label><select value={form.invoice} onChange={e => setForm(p => ({ ...p, invoice: e.target.value }))}><option value="">Select invoice</option>{invoices.filter(i => !form.customer || i.customer === parseInt(form.customer)).map(i => <option key={i.id} value={i.id}>{i.invoice_number} — {fmt(i.outstanding_amount)} outstanding</option>)}</select></div>
              <div className="form-row-2">
                <div className="form-row"><label>Payment Date *</label><input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} /></div>
                <div className="form-row"><label>Amount *</label><input type="number" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} /></div>
              </div>
              <div className="form-row-2">
                <div className="form-row"><label>Method</label><select value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}><option value="bank_transfer">Bank Transfer</option><option value="check">Check</option><option value="credit_card">Credit Card</option><option value="cash">Cash</option></select></div>
                <div className="form-row"><label>Reference</label><input value={form.reference_number} onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))} placeholder="CHEQ-001 or TXN-..." /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? 'Saving...' : <>Record</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

//  Credit Notes Tab
const CreditNotesTab = ({ entityId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await creditNotesAPI.getAll({ entity: entityId }); setItems(r.data.results || r.data); } catch (e) { console.error(e); }
    setLoading(false);
  }, [entityId]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {loading ? <div className="acct-loading">Loading credit notes...</div> : (
        <table className="acct-table">
          <thead><tr><th>Credit Note #</th><th>Customer</th><th>Invoice</th><th>Date</th><th>Amount</th><th>Reason</th><th>Status</th></tr></thead>
          <tbody>
            {items.length === 0 ? <tr><td colSpan={7} className="empty-row">No credit notes found</td></tr> : items.map(c => (
              <tr key={c.id}>
                <td><code className="acct-code">{c.credit_note_number}</code></td>
                <td>{c.customer_name || `Customer ${c.customer}`}</td>
                <td>{c.invoice_number || '—'}</td>
                <td>{c.credit_note_date}</td>
                <td style={{ color: '#ed8936' }}>{fmt(c.amount)}</td>
                <td>{c.reason}</td>
                <td><span className="status-badge" style={{ background: STATUS_COLORS[c.status] || '#a0aec0', color: 'white' }}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

//  Main AR Module
const ARModule = () => {
  const { entityId } = useParams();
  const [activeTab, setActiveTab] = useState('customers');

  return (
    <div className="acct-page">
      <div className="acct-header">
        <div>
          <h1>Accounts Receivable</h1>
          <p>Manage customers, invoices, payments, and credit notes — track money owed to you</p>
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
        {activeTab === 'customers' && <CustomersTab entityId={entityId} />}
        {activeTab === 'invoices' && <InvoicesTab entityId={entityId} />}
        {activeTab === 'payments' && <PaymentsTab entityId={entityId} />}
        {activeTab === 'credit-notes' && <CreditNotesTab entityId={entityId} />}
      </div>
    </div>
  );
};

export default ARModule;
