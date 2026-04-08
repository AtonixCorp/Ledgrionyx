import React, { useState, useEffect, useCallback } from 'react';
import { Button, Card, PageHeader, Table, Modal, Input } from '../../components/ui';
import { paymentsAPI, invoicesAPI, customersAPI, entitiesAPI } from '../../services/api';

const BLANK = { payment_date: '', amount: '', payment_method: 'bank_transfer', reference_number: '', entity: '', invoice: '', customer: '' };
const STATUS_COLOR = { draft: '#6b7280', pending_review: '#f59e0b', pending_approval: '#fb7185', rejected: '#ef4444', approved: '#10b981' };
const formatApprovalStatus = (value) => String(value || 'draft').replace(/_/g, ' ');

export default function PaymentScheduling() {
  const [list, setList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, iRes, cRes, eRes] = await Promise.all([paymentsAPI.getAll(), invoicesAPI.getAll(), customersAPI.getAll(), entitiesAPI.getAll()]);
      setList(pRes.data.results || pRes.data);
      setInvoices(iRes.data.results || iRes.data);
      setCustomers(cRes.data.results || cRes.data);
      setEntities(eRes.data.results || eRes.data);
    } catch (e) { setError('Failed to load payments'); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Amount is required.'); return; }
    if (!form.entity) { setError('Entity is required.'); return; }
    if (!form.payment_date) { setError('Payment date is required.'); return; }
    if (!form.invoice) { setError('Invoice is required.'); return; }
    if (!form.customer) { setError('Customer is required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { ...form };
      if (editItem) await paymentsAPI.update(editItem.id, payload);
      else await paymentsAPI.create(payload);
      setShowModal(false); load();
    } catch (e) {
      const d = e.response?.data;
      setError(d ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ') : 'Failed to save');
    }
    setSaving(false);
  };

  const openNew = () => { setEditItem(null); setForm(BLANK); setError(''); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ payment_date: item.payment_date || '', amount: item.amount || '', payment_method: item.payment_method || 'bank_transfer', reference_number: item.reference_number || '', entity: item.entity || '', invoice: item.invoice || '', customer: item.customer || '' }); setError(''); setShowModal(true); };
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (id) => {
    try {
      await paymentsAPI.submit(id);
      await load();
    } catch (e) {
      const d = e.response?.data;
      setError(d ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ') : 'Failed to submit payment');
    }
  };

  const handleApprove = async (id) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try {
      await paymentsAPI.approve(id, { comments });
      await load();
    } catch (e) {
      const d = e.response?.data;
      setError(d ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ') : 'Failed to approve payment');
    }
  };

  const handleReject = async (id) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try {
      await paymentsAPI.reject(id, { comments });
      await load();
    } catch (e) {
      const d = e.response?.data;
      setError(d ? Object.entries(d).map(([k,v]) => `${k}: ${Array.isArray(v)?v.join(', '):v}`).join(' | ') : 'Failed to reject payment');
    }
  };

  const columns = [
    { key: 'payment_date', label: 'Date' },
    { key: 'amount', label: 'Amount', render: v => <span style={{ fontFamily: 'monospace' }}>${parseFloat(v||0).toLocaleString('en-US',{minimumFractionDigits:2})}</span> },
    { key: 'payment_method', label: 'Method', render: v => v?.replace(/_/g,' ') },
    { key: 'reference_number', label: 'Reference' },
    { key: 'invoice_number', label: 'Invoice', render: (v, row) => row.invoice_number || '—' },
    { key: 'approval_status', label: 'Approval', render: v => <span style={{ fontSize: 12, fontWeight: 700, color: STATUS_COLOR[v]||'#6b7280', padding: '2px 8px', background: (STATUS_COLOR[v]||'#6b7280')+'22', borderRadius: 4, textTransform: 'capitalize' }}>{formatApprovalStatus(v)}</span> },
  ];

  return (
    <div className="payment-scheduling-page">
      <PageHeader title="Payment Scheduling" subtitle="Manage and schedule payments" actions={<Button variant="primary" onClick={openNew}>+ Schedule Payment</Button>} />
      {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '10px 16px', borderRadius: 8, marginBottom: 16, color: '#dc2626', fontSize: 13 }}>{error}</div>}
      <Card>
        {loading ? <div style={{ textAlign: 'center', padding: 32, color: 'var(--color-silver-dark)' }}>Loading...</div>
        : list.length === 0 ? <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-silver-dark)' }}><p style={{ fontSize: 15, fontWeight: 500 }}>No payments scheduled yet.</p></div>
        : <Table columns={columns} data={list} actions={row => (
            <div style={{ display: 'flex', gap: 6 }}>
              {['draft', 'rejected'].includes(row.approval_status) ? <button onClick={() => openEdit(row)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', cursor: 'pointer', background: 'transparent' }}>Edit</button> : null}
              {['draft', 'rejected'].includes(row.approval_status) ? <button onClick={() => handleSubmit(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #c084fc', cursor: 'pointer', background: 'transparent', color: '#7c3aed' }}>Submit</button> : null}
              {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button onClick={() => handleApprove(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #86efac', cursor: 'pointer', background: 'transparent', color: '#15803d' }}>Approve</button> : null}
              {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button onClick={() => handleReject(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', cursor: 'pointer', background: 'transparent', color: '#dc2626' }}>Reject</button> : null}
            </div>
          )} />}
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Payment' : 'Schedule Payment'}
        footer={<><Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button><Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></>}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '8px 12px', borderRadius: 6, marginBottom: 12, color: '#dc2626', fontSize: 12 }}>{error}</div>}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity *</label>
          <select value={form.entity} onChange={set('entity')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
            <option value="">— Select Entity —</option>
            {entities.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Invoice *</label>
          <select value={form.invoice} onChange={set('invoice')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
            <option value="">— Select Invoice —</option>
            {invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Customer *</label>
          <select value={form.customer} onChange={set('customer')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
            <option value="">— Select Customer —</option>
            {customers.map(customer => <option key={customer.id} value={customer.id}>{customer.customer_name}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Payment Date *</label>
          <input type="date" value={form.payment_date} onChange={set('payment_date')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }} />
        </div>
        <Input label="Amount *" type="number" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Payment Method</label>
          <select value={form.payment_method} onChange={set('payment_method')} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
            {['bank_transfer','check','credit_card','cash','wire_transfer','ach'].map(m => <option key={m} value={m}>{m.replace(/_/g,' ')}</option>)}
          </select>
        </div>
        <Input label="Reference" value={form.reference_number} onChange={set('reference_number')} placeholder="REF-0001" />
      </Modal>
    </div>
  );
}
