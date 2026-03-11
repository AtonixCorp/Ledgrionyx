import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';

const mockAR = [
  { invoice: 'INV-0001', customer: 'Acme Corp', invoiceDate: '2025-01-15', dueDate: '2025-02-15', original: '$12,500.00', balance: '$12,500.00', aging: '0-30', status: 'Current' },
  { invoice: 'INV-0002', customer: 'Globex Inc', invoiceDate: '2025-01-01', dueDate: '2025-01-30', original: '$4,200.00', balance: '$4,200.00', aging: '31-60', status: 'Overdue' },
  { invoice: 'INV-0004', customer: 'Umbrella Co', invoiceDate: '2024-12-20', dueDate: '2025-01-20', original: '$31,000.00', balance: '$0.00', aging: 'Paid', status: 'Paid' },
];

const STATUS_COLORS = { Current: '#27ae60', Overdue: '#e74c3c', Paid: '#95a5a6' };

const columns = [
  { key: 'invoice', header: 'Invoice' },
  { key: 'customer', header: 'Customer' },
  { key: 'invoiceDate', header: 'Invoice Date' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'original', header: 'Original Amount' },
  { key: 'balance', header: 'Balance' },
  { key: 'aging', header: 'Aging Bucket' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function AccountsReceivable() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Accounts Receivable"
        subtitle="Track all outstanding customer invoices and aging balances"
        actions={
          <>
            <Button variant="secondary" size="small">Aging Report</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Invoice
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total AR</div>
          <div className="stat-value">$47,700.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">0-30 Days</div>
          <div className="stat-value">$12,500.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">31-60 Days (Overdue)</div>
          <div className="stat-value overdue">$4,200.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Collected (MTD)</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>$31,000.00</div>
        </Card>
      </div>

      <Card title="AR Ledger">
        <Table columns={columns} data={mockAR} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Receivable" size="medium">
        <div className="form-grid">
          <Input label="Customer" required />
          <Input label="Invoice Number" required />
          <Input label="Invoice Date" type="date" required />
          <Input label="Due Date" type="date" required />
          <Input label="Amount" type="number" required />
          <Input label="GL Account" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </Modal>
    </div>
  );
}
