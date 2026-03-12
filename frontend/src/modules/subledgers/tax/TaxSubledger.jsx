import React from 'react';
import { PageHeader, Card, Table, Button } from '../../../components/ui';

const mockTax = [
  { period: 'Q4 2024', type: 'Federal Income Tax', jurisdiction: 'USA — Federal', liability: '$42,000.00', paid: '$42,000.00', balance: '$0.00', dueDate: '2025-01-15', status: 'Filed' },
  { period: 'Q4 2024', type: 'State Income Tax', jurisdiction: 'CA — State', liability: '$9,800.00', paid: '$9,800.00', balance: '$0.00', dueDate: '2025-01-15', status: 'Filed' },
  { period: 'Jan 2025', type: 'Payroll Tax (FICA)', jurisdiction: 'USA — Federal', liability: '$5,508.00', paid: '$0.00', balance: '$5,508.00', dueDate: '2025-02-15', status: 'Pending' },
  { period: 'Jan 2025', type: 'Sales Tax', jurisdiction: 'CA — State', liability: '$1,250.00', paid: '$0.00', balance: '$1,250.00', dueDate: '2025-02-28', status: 'Pending' },
];

const STATUS_COLORS = { Filed: 'var(--color-success)', Pending: 'var(--color-warning)', Overdue: 'var(--color-error)' };

const columns = [
  { key: 'period', header: 'Period' },
  { key: 'type', header: 'Tax Type' },
  { key: 'jurisdiction', header: 'Jurisdiction' },
  { key: 'liability', header: 'Liability' },
  { key: 'paid', header: 'Paid' },
  { key: 'balance', header: 'Remaining' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function TaxSubledger() {
  return (
    <div className="module-page">
      <PageHeader
        title="Tax Subledger"
        subtitle="Track tax liabilities, payments, and filing status by jurisdiction"
        actions={
          <Button variant="secondary" size="small">Tax Summary</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total YTD Liability</div>
          <div className="stat-value">$58,558.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>$51,800.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Outstanding</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>$6,758.00</div>
        </Card>
      </div>

      <Card title="Tax Ledger">
        <Table columns={columns} data={mockTax} />
      </Card>
    </div>
  );
}
