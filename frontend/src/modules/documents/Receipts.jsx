import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockReceipts = [
  { id: 'REC-001', merchant: 'Amazon AWS', date: '2025-01-15', amount: '$3,200.00', category: 'Technology', status: 'Matched', bill: 'BILL-0001' },
  { id: 'REC-002', merchant: 'Starbucks', date: '2025-01-18', amount: '$48.50', category: 'Meals & Entertainment', status: 'Pending', bill: '—' },
  { id: 'REC-003', merchant: 'Delta Airlines', date: '2025-01-22', amount: '$1,240.00', category: 'Travel', status: 'Pending', bill: '—' },
  { id: 'REC-004', merchant: 'Office Depot', date: '2025-01-25', amount: '$680.00', category: 'Supplies', status: 'Matched', bill: 'BILL-0002' },
];

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

export default function Receipts() {
  const [showModal, setShowModal] = useState(false);

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
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Matched</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>2</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Pending Review</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>2</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockReceipts} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Upload Receipt" size="medium">
        <div className="form-grid">
          <Input label="Merchant" required />
          <Input label="Date" type="date" required />
          <Input label="Amount" type="number" required />
          <Input label="Category" placeholder="Technology, Travel, Meals..." />
          <Input label="Notes" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-midnight)', display: 'block', marginBottom: 6 }}>Receipt Image / PDF</label>
          <input type="file" accept="image/*,.pdf" style={{ fontSize: 13 }} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Upload Receipt</Button>
        </div>
      </Modal>
    </div>
  );
}
