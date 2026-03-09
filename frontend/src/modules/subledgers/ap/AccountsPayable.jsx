import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../../components/ui';
import { FaFileAlt, FaPlus, FaDownload } from 'react-icons/fa';

const mockAP = [
  { bill: 'BILL-0001', vendor: 'AWS Cloud', billDate: '2025-01-10', dueDate: '2025-02-10', original: '$3,200.00', balance: '$3,200.00', aging: '0-30', status: 'Pending' },
  { bill: 'BILL-0002', vendor: 'Office Depot', billDate: '2024-12-25', dueDate: '2025-01-25', original: '$680.00', balance: '$680.00', aging: '31-60', status: 'Overdue' },
  { bill: 'BILL-0004', vendor: 'Landlord LLC', billDate: '2025-01-01', dueDate: '2025-02-01', original: '$5,500.00', balance: '$0.00', aging: 'Paid', status: 'Paid' },
];

const STATUS_COLORS = { Pending: '#f39c12', Overdue: '#e74c3c', Paid: '#95a5a6' };

const columns = [
  { key: 'bill', header: 'Bill #' },
  { key: 'vendor', header: 'Vendor' },
  { key: 'billDate', header: 'Bill Date' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'original', header: 'Original Amount' },
  { key: 'balance', header: 'Balance' },
  { key: 'aging', header: 'Aging Bucket' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function AccountsPayable() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Accounts Payable"
        subtitle="Track all outstanding vendor bills and payable balances"
        icon={<FaFileAlt />}
        actions={
          <>
            <Button variant="secondary" size="small" icon={<FaDownload />}>Aging Report</Button>
            <Button variant="primary" size="small" icon={<FaPlus />} onClick={() => setShowModal(true)}>
              Record Bill
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total AP</div>
          <div className="stat-value">$9,380.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Due This Month</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>$3,200.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value overdue">$680.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Paid (MTD)</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>$5,500.00</div>
        </Card>
      </div>

      <Card title="AP Ledger">
        <Table columns={columns} data={mockAP} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Bill" size="medium">
        <div className="form-grid">
          <Input label="Vendor" required />
          <Input label="Bill Number" required />
          <Input label="Bill Date" type="date" required />
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
