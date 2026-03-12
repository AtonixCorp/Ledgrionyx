import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';

const mockSchedule = [
  { id: 'PAY-001', type: 'Invoice', ref: 'INV-0001', party: 'Acme Corp', amount: '$12,500.00', date: '2025-02-15', method: 'ACH', status: 'Scheduled' },
  { id: 'PAY-002', type: 'Bill', ref: 'BILL-0001', party: 'AWS Cloud', amount: '$3,200.00', date: '2025-02-10', method: 'Bank Transfer', status: 'Approved' },
  { id: 'PAY-003', type: 'Bill', ref: 'BILL-0004', party: 'Landlord LLC', amount: '$5,500.00', date: '2025-02-01', method: 'ACH', status: 'Completed' },
  { id: 'PAY-004', type: 'Invoice', ref: 'INV-0002', party: 'Globex Inc', amount: '$4,200.00', date: '2025-01-30', method: 'Wire', status: 'Overdue' },
];

const STATUS_COLORS = { Scheduled: 'var(--color-cyan)', Approved: 'var(--color-warning)', Completed: 'var(--color-success)', Overdue: 'var(--color-error)' };

const columns = [
  { key: 'id', header: 'Payment ID' },
  { key: 'type', header: 'Type' },
  { key: 'ref', header: 'Reference' },
  { key: 'party', header: 'Party' },
  { key: 'amount', header: 'Amount' },
  { key: 'date', header: 'Date' },
  { key: 'method', header: 'Method' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function PaymentScheduling() {
  return (
    <div className="module-page">
      <PageHeader
        title="Payment Scheduling"
        subtitle="Schedule, approve and track outgoing and incoming payments"
        actions={
          <Button variant="primary" size="small">Approve Selected</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Scheduled</div>
          <div className="stat-value">$15,700.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Pending Approval</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>$3,200.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value overdue">$4,200.00</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockSchedule} />
      </Card>
    </div>
  );
}
