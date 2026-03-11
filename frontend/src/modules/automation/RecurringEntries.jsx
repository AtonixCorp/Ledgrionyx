import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockRecurring = [
  { name: 'Monthly Office Rent', type: 'Journal Entry', frequency: 'Monthly', nextRun: '2025-02-01', amount: '$5,500.00', status: 'Active' },
  { name: 'Quarterly Insurance Premium', type: 'Bill', frequency: 'Quarterly', nextRun: '2025-04-01', amount: '$12,000.00', status: 'Active' },
  { name: 'Annual Software Subscription', type: 'Expense', frequency: 'Annual', nextRun: '2025-06-15', amount: '$8,400.00', status: 'Active' },
  { name: 'Bi-Weekly Payroll JE', type: 'Journal Entry', frequency: 'Bi-Weekly', nextRun: '2025-02-07', amount: '$38,000.00', status: 'Paused' },
];

const STATUS_COLORS = { Active: '#27ae60', Paused: '#f39c12' };

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'frequency', header: 'Frequency' },
  { key: 'nextRun', header: 'Next Run' },
  { key: 'amount', header: 'Amount' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function RecurringEntries() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Recurring Entries"
        subtitle="Configure recurring journal entries, bills, and expenses"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Recurring Entry
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Active Entries</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Next 7 Days</div>
          <div className="stat-value">1 entry</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Monthly Recurring Value</div>
          <div className="stat-value">$43,500.00</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockRecurring} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Recurring Entry" size="medium">
        <div className="form-grid">
          <Input label="Entry Name" required />
          <Input label="Type" placeholder="Journal Entry, Bill, Expense..." />
          <Input label="Frequency" placeholder="Daily / Weekly / Monthly / Annual" required />
          <Input label="Start Date" type="date" required />
          <Input label="Amount" type="number" required />
          <Input label="GL Account" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Entry</Button>
        </div>
      </Modal>
    </div>
  );
}
