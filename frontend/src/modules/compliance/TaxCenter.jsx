import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';
import { FaPercent, FaDownload, FaCheckCircle } from 'react-icons/fa';

const mockTaxCenter = [
  { tax: 'Federal Income Tax (Q4 2024)', jurisdiction: 'USA', dueDate: '2025-01-15', amount: '$42,000.00', status: 'Filed', filedDate: '2025-01-10' },
  { tax: 'California State Tax (Q4 2024)', jurisdiction: 'CA', dueDate: '2025-01-15', amount: '$9,800.00', status: 'Filed', filedDate: '2025-01-10' },
  { tax: 'Federal Payroll Tax (Jan 2025)', jurisdiction: 'USA', dueDate: '2025-02-15', amount: '$5,508.00', status: 'Upcoming', filedDate: '—' },
  { tax: 'Sales Tax (Jan 2025)', jurisdiction: 'CA', dueDate: '2025-02-28', amount: '$1,250.00', status: 'Upcoming', filedDate: '—' },
  { tax: 'Annual 1099 Filing', jurisdiction: 'USA', dueDate: '2025-02-28', amount: 'N/A', status: 'Action Required', filedDate: '—' },
];

const STATUS_COLORS = { Filed: '#27ae60', Upcoming: '#667eea', 'Action Required': '#e74c3c', Overdue: '#e74c3c' };

const columns = [
  { key: 'tax', header: 'Tax Obligation' },
  { key: 'jurisdiction', header: 'Jurisdiction' },
  { key: 'dueDate', header: 'Due Date' },
  { key: 'amount', header: 'Amount' },
  { key: 'filedDate', header: 'Filed Date' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function TaxCenter() {
  return (
    <div className="module-page">
      <PageHeader
        title="Tax Center"
        subtitle="Manage all tax obligations, filings, and compliance deadlines"
        icon={<FaPercent />}
        actions={
          <>
            <Button variant="secondary" size="small" icon={<FaDownload />}>Tax Summary</Button>
            <Button variant="primary" size="small" icon={<FaCheckCircle />}>Mark as Filed</Button>
          </>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Filings This Quarter</div>
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Tax Paid (QTD)</div>
          <div className="stat-value">$51,800.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Upcoming Deadlines</div>
          <div className="stat-value" style={{ color: '#f39c12' }}>3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Action Required</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>1</div>
        </Card>
      </div>

      <Card title="Tax Obligations">
        <Table columns={columns} data={mockTaxCenter} />
      </Card>
    </div>
  );
}
