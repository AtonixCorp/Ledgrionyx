import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';

const mockVariance = [
  { account: 'Service Revenue', budget: '$280,000', actual: '$284,000', variance: '+$4,000', pct: '+1.4%', type: 'Favorable' },
  { account: 'Product Revenue', budget: '$70,000', actual: '$62,000', variance: '-$8,000', pct: '-11.4%', type: 'Unfavorable' },
  { account: 'Salaries & Wages', budget: '$80,000', actual: '$85,000', variance: '-$5,000', pct: '-6.3%', type: 'Unfavorable' },
  { account: 'Rent & Utilities', budget: '$13,000', actual: '$12,800', variance: '+$200', pct: '+1.5%', type: 'Favorable' },
  { account: 'Technology & SaaS', budget: '$8,000', actual: '$8,200', variance: '-$200', pct: '-2.5%', type: 'Unfavorable' },
  { account: 'Marketing', budget: '$15,000', actual: '$12,500', variance: '+$2,500', pct: '+16.7%', type: 'Favorable' },
  { account: 'Net Income', budget: '$154,000', actual: '$152,000', variance: '-$2,000', pct: '-1.3%', type: 'Unfavorable', isBold: true },
];

const VARIANCE_COLORS = { Favorable: '#27ae60', Unfavorable: '#e74c3c' };

const columns = [
  { key: 'account', header: 'Account' },
  { key: 'budget', header: 'Budget' },
  { key: 'actual', header: 'Actual' },
  { key: 'variance', header: 'Variance ($)', render: (row) => (
    <span style={{ color: row.type === 'Favorable' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{row.variance}</span>
  )},
  { key: 'pct', header: 'Variance (%)', render: (row) => (
    <span style={{ color: row.type === 'Favorable' ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{row.pct}</span>
  )},
  { key: 'type', header: 'Type', render: (row) => (
    <span className="status-badge" style={{ background: VARIANCE_COLORS[row.type] }}>{row.type}</span>
  )},
];

export default function VarianceAnalysis() {
  return (
    <div className="module-page">
      <PageHeader
        title="Variance Analysis"
        subtitle="Budget vs actual performance by account and cost center"
        actions={
          <Button variant="secondary" size="small">Export Analysis</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Revenue Variance</div>
          <div className="stat-value variance-negative">-$4,000</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Expense Variance</div>
          <div className="stat-value variance-negative">-$2,500</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Net Income Variance</div>
          <div className="stat-value variance-negative">-$2,000</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Overall Performance</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>98.7%</div>
        </Card>
      </div>

      <Card title="Budget vs Actual — January 2025">
        <Table columns={columns} data={mockVariance} />
      </Card>
    </div>
  );
}
