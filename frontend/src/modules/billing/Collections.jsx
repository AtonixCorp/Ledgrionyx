import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';

const mockCollections = [
  { invoice: 'INV-0002', customer: 'Globex Inc', amount: '$4,200.00', overdueDays: 15, lastContact: '2025-01-25', nextAction: 'Call', priority: 'High' },
  { invoice: 'INV-0005', customer: 'Weyland Corp', amount: '$9,800.00', overdueDays: 32, lastContact: '2025-01-10', nextAction: 'Legal', priority: 'Critical' },
  { invoice: 'INV-0007', customer: 'Tyrell Inc', amount: '$2,100.00', overdueDays: 5, lastContact: '2025-01-28', nextAction: 'Email', priority: 'Medium' },
];

const PRIORITY_COLORS = { Low: 'var(--color-success)', Medium: 'var(--color-warning)', High: 'var(--color-warning)', Critical: 'var(--color-error)' };

const columns = [
  { key: 'invoice', header: 'Invoice' },
  { key: 'customer', header: 'Customer' },
  { key: 'amount', header: 'Amount' },
  { key: 'overdueDays', header: 'Days Overdue', render: (row) => (
    <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>{row.overdueDays} days</span>
  )},
  { key: 'lastContact', header: 'Last Contact' },
  { key: 'nextAction', header: 'Next Action' },
  { key: 'priority', header: 'Priority', render: (row) => (
    <span className="status-badge" style={{ background: PRIORITY_COLORS[row.priority] }}>{row.priority}</span>
  )},
];

export default function Collections() {
  return (
    <div className="module-page">
      <PageHeader
        title="Collections"
        subtitle="Track and manage overdue invoices and collection workflows"
        actions={
          <Button variant="secondary" size="small">Export Report</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Overdue</div>
          <div className="stat-value overdue">$16,100.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Accounts in Collections</div>
          <div className="stat-value">3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Avg Days Overdue</div>
          <div className="stat-value">17.3</div>
        </Card>
      </div>

      <Card title="Overdue Accounts">
        <Table columns={columns} data={mockCollections} />
      </Card>
    </div>
  );
}
