import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const receiptRows = [];

const STATUS_COLORS = { Matched: 'var(--color-success)', Pending: 'var(--color-warning)', Rejected: 'var(--color-error)' };

const columns = [
  { key: 'id', header: 'Receipt ID' },
  { key: 'merchant', header: 'Merchant' },
  { key: 'date', header: 'Date' },
  { key: 'amount', header: 'Amount' },
  { key: 'category', header: 'Category' },
  { key: 'bill', header: 'Linked Bill' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

const BLANK_RECEIPT = { merchant: '', date: '', amount: '', category: '', notes: '' };

export default function Receipts() {
  const [showModal, setShowModal] = useState(false);
  const [receiptList, setReceiptList] = useState(receiptRows);
  const [form, setForm] = useState(BLANK_RECEIPT);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const matchedCount = receiptList.filter((receipt) => receipt.status === 'Matched').length;
  const pendingCount = receiptList.filter((receipt) => receipt.status === 'Pending').length;

  const handleCreate = () => {
    if (!form.merchant.trim()) return;
    const id = `REC-${String(receiptList.length + 1).padStart(3, '0')}`;
    const amtFmt = form.amount ? `$${parseFloat(form.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00';
    setReceiptList(prev => [...prev, { id, merchant: form.merchant, date: form.date || '—', amount: amtFmt, category: form.category || '—', status: 'Pending', bill: '—' }]);
    setForm(BLANK_RECEIPT);
    setShowModal(false);
  };

  return (
    <div className="module-page">
      <PageHeader
        title="Receipts"
        subtitle="Capture, categorize, and match receipts to expense transactions"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Upload Receipt
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Receipts</div>
          <div className="stat-value">{receiptList.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Matched</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{matchedCount}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>{pendingCount}</div>
        </Card>
      </div>

      <Card>
        {receiptList.length > 0 ? <Table columns={columns} data={receiptList} /> : <p className="empty-state">No receipts yet. Upload one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_RECEIPT); }} title="Upload Receipt" size="medium">
        <div className="form-grid">
          <Input label="Merchant" required value={form.merchant} onChange={set('merchant')} />
          <Input label="Date" type="date" required value={form.date} onChange={set('date')} />
          <Input label="Amount" type="number" required value={form.amount} onChange={set('amount')} />
          <Input label="Category" placeholder="Technology, Travel, Meals..." value={form.category} onChange={set('category')} />
          <Input label="Notes" value={form.notes} onChange={set('notes')} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-midnight)', display: 'block', marginBottom: 6 }}>Receipt Image / PDF</label>
          <input type="file" accept="image/*,.pdf" style={{ fontSize: 13 }} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_RECEIPT); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.merchant.trim()}>Upload Receipt</Button>
        </div>
      </Modal>
    </div>
  );
}
