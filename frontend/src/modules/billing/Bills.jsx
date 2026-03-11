import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const STATUS_COLORS = { paid: '#27ae60', pending: '#f39c12', overdue: '#e74c3c', draft: '#95a5a6' };

const mockBills = [
  { id: 'BILL-0001', vendor: 'AWS Cloud', amount: '$3,200.00', due: '2025-02-10', status: 'pending', category: 'Technology' },
  { id: 'BILL-0002', vendor: 'Office Depot', amount: '$680.00', due: '2025-01-25', status: 'overdue', category: 'Supplies' },
  { id: 'BILL-0003', vendor: 'KPMG Advisory', amount: '$15,000.00', due: '2025-03-01', status: 'draft', category: 'Professional Services' },
  { id: 'BILL-0004', vendor: 'Landlord LLC', amount: '$5,500.00', due: '2025-02-01', status: 'paid', category: 'Rent' },
];

const columns = [
  { key: 'id', header: 'Bill #' },
  { key: 'vendor', header: 'Vendor' },
  { key: 'category', header: 'Category' },
  { key: 'due', header: 'Due Date' },
  { key: 'amount', header: 'Amount' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>
      {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
    </span>
  )},
];

export default function Bills() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Bills"
        subtitle="Manage vendor bills and payables"
        actions={
          <>
            <Button variant="secondary" size="small">Export</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Bill
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Payable</div>
          <div className="stat-value">$18,900.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value overdue">$680.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Due This Month</div>
          <div className="stat-value">$8,700.00</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockBills} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Bill" size="medium">
        <div className="form-grid">
          <Input label="Vendor" required placeholder="Select vendor..." />
          <Input label="Bill Date" type="date" required />
          <Input label="Due Date" type="date" required />
          <Input label="Amount" type="number" required placeholder="0.00" />
          <Input label="Category" placeholder="Expense category..." />
          <Input label="Reference" placeholder="Vendor invoice number..." />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Bill</Button>
        </div>
      </Modal>
    </div>
  );
}
