import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';
import { billsAPI, vendorsAPI, entitiesAPI } from '../../../services/api';

const BASE_PATH = '/app/subledgers/accounts-payable';
const EMPTY_FORM = {
  entity: '',
  vendor: '',
  bill_number: '',
  bill_date: '',
  due_date: '',
  subtotal: '',
  tax_amount: '0',
  total_amount: '',
  currency: 'USD',
  status: 'draft',
  description: '',
  notes: '',
};

const STATUS_COLORS = {
  draft: '#6b7280',
  posted: '#2563eb',
  partially_paid: '#d97706',
  paid: '#059669',
  overdue: '#dc2626',
  cancelled: '#9ca3af',
  pending_review: '#f59e0b',
  pending_approval: '#fb7185',
  rejected: '#dc2626',
  approved: '#059669',
};

const parseList = (response) => response.data.results || response.data;
const formatMoney = (value) => `$${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const formatApprovalStatus = (value) => String(value || 'draft').replace(/_/g, ' ');
const formatError = (error, fallback) => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  return Object.entries(data).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`).join(' | ');
};

export default function AccountsPayable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [billRes, vendorRes, entityRes] = await Promise.all([
        billsAPI.getAll(),
        vendorsAPI.getAll(),
        entitiesAPI.getAll(),
      ]);
      setRecords(parseList(billRes));
      setVendors(parseList(vendorRes));
      setEntities(parseList(entityRes));
      setError('');
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to load accounts payable.'));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setViewOnly(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
    if (location.pathname !== BASE_PATH) {
      navigate(BASE_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === `${BASE_PATH}/create`) {
      setEditItem(null);
      setViewOnly(false);
      setForm(EMPTY_FORM);
      setShowModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!id || !records.length) return;
    const match = records.find((record) => String(record.id) === String(id));
    if (!match) return;
    setEditItem(match);
    setViewOnly(location.pathname.includes('/view/'));
    setForm({
      entity: match.entity || '',
      vendor: match.vendor || '',
      bill_number: match.bill_number || '',
      bill_date: match.bill_date || '',
      due_date: match.due_date || '',
      subtotal: match.subtotal || '',
      tax_amount: match.tax_amount || '0',
      total_amount: match.total_amount || '',
      currency: match.currency || 'USD',
      status: match.status || 'draft',
      description: match.description || '',
      notes: match.notes || '',
    });
    setShowModal(true);
  }, [id, location.pathname, records]);

  const setField = (field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.entity) {
      setError('Entity is required.');
      return;
    }
    if (!form.vendor) {
      setError('Vendor is required.');
      return;
    }
    if (!form.bill_number.trim()) {
      setError('Bill number is required.');
      return;
    }
    if (!form.bill_date || !form.due_date) {
      setError('Bill date and due date are required.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const subtotal = Number(form.subtotal || 0);
      const taxAmount = Number(form.tax_amount || 0);
      const payload = {
        ...form,
        total_amount: form.total_amount || (subtotal + taxAmount).toFixed(2),
      };

      if (editItem) {
        await billsAPI.update(editItem.id, payload);
      } else {
        await billsAPI.create(payload);
      }
      await load();
      closeModal();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to save bill.'));
    }
    setSaving(false);
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await billsAPI.delete(recordId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to delete bill.'));
    }
  };

  const handleSubmit = async (recordId) => {
    try {
      await billsAPI.submit(recordId);
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to submit bill for approval.'));
    }
  };

  const handleApprove = async (recordId) => {
    const comments = window.prompt('Approval note (optional):', '') || '';
    try {
      await billsAPI.approve(recordId, { comments });
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to approve bill.'));
    }
  };

  const handleReject = async (recordId) => {
    const comments = window.prompt('Rejection reason:', '');
    if (comments === null) return;
    try {
      await billsAPI.reject(recordId, { comments });
      await load();
    } catch (requestError) {
      setError(formatError(requestError, 'Failed to reject bill.'));
    }
  };

  const totalOutstanding = records.reduce((sum, record) => sum + Number(record.outstanding_amount || 0), 0);
  const overdueCount = records.filter((record) => record.status === 'overdue').length;
  const paidCount = records.filter((record) => record.status === 'paid').length;

  const columns = [
    { key: 'bill_number', label: 'Bill #', render: (value) => <code style={{ fontSize: 12 }}>{value}</code> },
    { key: 'vendor_name', label: 'Vendor', render: (value) => value || '—' },
    { key: 'bill_date', label: 'Bill Date' },
    { key: 'due_date', label: 'Due Date' },
    { key: 'total_amount', label: 'Total', render: (value) => <span style={{ fontFamily: 'monospace' }}>{formatMoney(value)}</span> },
    { key: 'outstanding_amount', label: 'Outstanding', render: (value) => <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{formatMoney(value)}</span> },
    {
      key: 'approval_status',
      label: 'Approval',
      render: (value) => (
        <span style={{ color: STATUS_COLORS[value] || '#6b7280', fontWeight: 700, textTransform: 'capitalize' }}>
          {formatApprovalStatus(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Accounts Payable"
        subtitle="Track vendor bills and payable balances"
        actions={
          <>
            <Button variant="secondary" size="small" onClick={() => navigate('/app/billing/vendors/create')}>New Vendor</Button>
            <Button variant="primary" size="small" onClick={() => navigate(`${BASE_PATH}/create`)}>Record Bill</Button>
          </>
        }
      />

      {error && <div className="error-banner" style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Card className="stat-card"><div className="stat-label">Open Bills</div><div className="stat-value">{records.length}</div></Card>
        <Card className="stat-card"><div className="stat-label">Outstanding</div><div className="stat-value">{formatMoney(totalOutstanding)}</div></Card>
        <Card className="stat-card"><div className="stat-label">Overdue</div><div className="stat-value" style={{ color: '#dc2626' }}>{overdueCount}</div></Card>
        <Card className="stat-card"><div className="stat-label">Paid</div><div className="stat-value" style={{ color: '#059669' }}>{paidCount}</div></Card>
      </div>

      <Card title="Payables Ledger">
        {loading ? <div style={{ padding: 32, textAlign: 'center' }}>Loading payables...</div> : (
          <Table
            columns={columns}
            data={records}
            actions={(row) => (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => navigate(`${BASE_PATH}/view/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>View</button>
                {['draft', 'rejected'].includes(row.approval_status) ? <button type="button" onClick={() => navigate(`${BASE_PATH}/edit/${row.id}`)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border-color-default)', background: 'transparent', cursor: 'pointer' }}>Edit</button> : null}
                {['draft', 'rejected'].includes(row.approval_status) ? <button type="button" onClick={() => handleSubmit(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #c084fc', background: 'transparent', cursor: 'pointer', color: '#7c3aed' }}>Submit</button> : null}
                {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button type="button" onClick={() => handleApprove(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #86efac', background: 'transparent', cursor: 'pointer', color: '#15803d' }}>Approve</button> : null}
                {['pending_review', 'pending_approval'].includes(row.approval_status) ? <button type="button" onClick={() => handleReject(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', cursor: 'pointer', color: '#dc2626' }}>Reject</button> : null}
                {['draft', 'rejected'].includes(row.approval_status) ? <button type="button" onClick={() => handleDelete(row.id)} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 4, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', cursor: 'pointer' }}>Delete</button> : null}
              </div>
            )}
          />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={viewOnly ? 'Bill Details' : editItem ? 'Edit Bill' : 'Record Bill'}
        footer={viewOnly ? <Button variant="secondary" onClick={closeModal}>Close</Button> : <><Button variant="secondary" onClick={closeModal}>Cancel</Button><Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Bill'}</Button></>}
      >
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Entity *</label>
            <select disabled={viewOnly} value={form.entity} onChange={setField('entity')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">Select entity</option>
              {entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Vendor *</label>
            <select disabled={viewOnly} value={form.vendor} onChange={setField('vendor')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
              <option value="">Select vendor</option>
              {vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>)}
            </select>
          </div>
          <Input label="Bill Number *" value={form.bill_number} onChange={setField('bill_number')} disabled={viewOnly} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Bill Date *" type="date" value={form.bill_date} onChange={setField('bill_date')} disabled={viewOnly} />
            <Input label="Due Date *" type="date" value={form.due_date} onChange={setField('due_date')} disabled={viewOnly} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Input label="Subtotal" type="number" step="0.01" value={form.subtotal} onChange={setField('subtotal')} disabled={viewOnly} />
            <Input label="Tax Amount" type="number" step="0.01" value={form.tax_amount} onChange={setField('tax_amount')} disabled={viewOnly} />
            <Input label="Total Amount" type="number" step="0.01" value={form.total_amount} onChange={setField('total_amount')} disabled={viewOnly} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Currency" value={form.currency} onChange={setField('currency')} disabled={viewOnly} />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Status</label>
              <select disabled={viewOnly} value={form.status} onChange={setField('status')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }}>
                {['draft', 'posted', 'partially_paid', 'paid', 'overdue', 'cancelled'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
          <Input label="Description" value={form.description} onChange={setField('description')} disabled={viewOnly} />
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Notes</label>
            <textarea disabled={viewOnly} rows={3} value={form.notes} onChange={setField('notes')} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border-color-default)' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
