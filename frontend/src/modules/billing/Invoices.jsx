import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const STATUS_COLORS = {
  paid: '#27ae60',
  pending: '#f39c12',
  overdue: '#e74c3c',
  draft: '#95a5a6',
};

const mockInvoices = [
  { id: 'INV-0001', customer: 'Acme Corp', amount: '$12,500.00', due: '2025-02-15', issued: '2025-01-15', status: 'pending' },
  { id: 'INV-0002', customer: 'Globex Inc', amount: '$4,200.00', due: '2025-01-30', issued: '2025-01-01', status: 'overdue' },
  { id: 'INV-0003', customer: 'Initech LLC', amount: '$8,750.00', due: '2025-02-28', issued: '2025-01-28', status: 'draft' },
  { id: 'INV-0004', customer: 'Umbrella Co', amount: '$31,000.00', due: '2025-01-20', issued: '2024-12-20', status: 'paid' },
];

const columns = [
  { key: 'id', header: 'Invoice #' },
  { key: 'customer', header: 'Customer' },
  { key: 'issued', header: 'Issue Date' },
  { key: 'due', header: 'Due Date' },
  { key: 'amount', header: 'Amount' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
  },
];

export default function Invoices() {
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? mockInvoices : mockInvoices.filter((i) => i.status === filter);
  const totalOutstanding = '$16,700.00';
  const totalOverdue = '$4,200.00';
  const totalDraft = '$8,750.00';

  return (
    <div className="module-page">
      <PageHeader
        title="Invoices"
        subtitle="Create and manage customer invoices"
        actions={
          <>
            <Button variant="secondary" size="small">Export</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Invoice
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value">{totalOutstanding}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value overdue">{totalOverdue}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value muted">{totalDraft}</div>
        </Card>
      </div>

      <Card>
        <div className="filter-bar">

          {['all', 'paid', 'pending', 'overdue', 'draft'].map((f) => (
            <button
              key={f}
              className={`filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <Table columns={columns} data={filtered} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Invoice" size="medium">
        <div className="form-grid">
          <Input label="Customer" required placeholder="Select customer..." />
          <Input label="Invoice Date" type="date" required />
          <Input label="Due Date" type="date" required />
          <Input label="Reference" placeholder="PO number or reference..." />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Invoice</Button>
        </div>
      </Modal>
    </div>
  );
}
