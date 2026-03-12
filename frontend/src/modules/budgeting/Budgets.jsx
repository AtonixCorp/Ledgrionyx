import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockBudgets = [
  { name: 'FY2025 Operating Budget', period: '2025-01-01 to 2025-12-31', total: '$4,200,000.00', spent: '$346,000.00', remaining: '$3,854,000.00', pct: 8.2, status: 'Active' },
  { name: 'Q1 2025 Marketing', period: '2025-01-01 to 2025-03-31', total: '$120,000.00', spent: '$38,500.00', remaining: '$81,500.00', pct: 32.1, status: 'Active' },
  { name: 'FY2024 Operating Budget', period: '2024-01-01 to 2024-12-31', total: '$3,800,000.00', spent: '$3,810,000.00', remaining: '($10,000.00)', pct: 100.3, status: 'Closed' },
];

const columns = [
  { key: 'name', header: 'Budget Name' },
  { key: 'period', header: 'Period' },
  { key: 'total', header: 'Total Budget' },
  { key: 'spent', header: 'Spent' },
  { key: 'remaining', header: 'Remaining' },
  { key: 'pct', header: 'Utilization', render: (row) => (
    <div className="progress-bar-wrapper">
      <div className="progress-bar" style={{ width: `${Math.min(row.pct, 100)}%`, background: row.pct > 100 ? 'var(--color-error)' : row.pct > 80 ? 'var(--color-warning)' : 'var(--color-success)' }} />
      <span className="progress-label">{row.pct}%</span>
    </div>
  )},
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: row.status === 'Active' ? 'var(--color-success)' : 'var(--color-silver-dark)' }}>{row.status}</span>
  )},
];

export default function Budgets() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Budgets"
        subtitle="Create, manage, and track departmental and entity budgets"
        actions={
          <>
            <Button variant="secondary" size="small">Export</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Budget
            </Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Active Budgets</div>
          <div className="stat-value">2</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">FY2025 Total</div>
          <div className="stat-value">$4,200,000.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">YTD Spend</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>$346,000.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Budget Utilization</div>
          <div className="stat-value">8.2%</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockBudgets} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Budget" size="medium">
        <div className="form-grid">
          <Input label="Budget Name" required />
          <Input label="Fiscal Year" required placeholder="2025" />
          <Input label="Start Date" type="date" required />
          <Input label="End Date" type="date" required />
          <Input label="Total Amount" type="number" required />
          <Input label="Department / Entity" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create Budget</Button>
        </div>
      </Modal>
    </div>
  );
}
