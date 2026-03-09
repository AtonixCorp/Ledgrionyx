import React from 'react';
import { PageHeader, Card, Table, Button } from '../../components/ui';
import { FaList, FaDownload } from 'react-icons/fa';

const mockTB = [
  { code: '1001', account: 'Cash - Operating', type: 'Asset', debit: '$142,300.00', credit: '', balance: '$142,300.00' },
  { code: '1100', account: 'Accounts Receivable', type: 'Asset', debit: '$47,700.00', credit: '', balance: '$47,700.00' },
  { code: '1500', account: 'Fixed Assets (Net)', type: 'Asset', debit: '$2,555,000.00', credit: '', balance: '$2,555,000.00' },
  { code: '2001', account: 'Accounts Payable', type: 'Liability', debit: '', credit: '$9,380.00', balance: '($9,380.00)' },
  { code: '2100', account: 'Accrued Liabilities', type: 'Liability', debit: '', credit: '$18,500.00', balance: '($18,500.00)' },
  { code: '3001', account: "Owner's Equity", type: 'Equity', debit: '', credit: '$2,560,000.00', balance: '($2,560,000.00)' },
  { code: '4001', account: 'Service Revenue', type: 'Revenue', debit: '', credit: '$284,000.00', balance: '($284,000.00)' },
  { code: '5001', account: 'Salaries & Wages', type: 'Expense', debit: '$85,000.00', credit: '', balance: '$85,000.00' },
  { code: '5100', account: 'Rent & Utilities', type: 'Expense', debit: '$12,800.00', credit: '', balance: '$12,800.00' },
];

const columns = [
  { key: 'code', header: 'Code' },
  { key: 'account', header: 'Account Name' },
  { key: 'type', header: 'Type' },
  { key: 'debit', header: 'Debit' },
  { key: 'credit', header: 'Credit' },
  { key: 'balance', header: 'Balance' },
];

export default function TrialBalance() {
  return (
    <div className="module-page">
      <PageHeader
        title="Trial Balance"
        subtitle="Verify debit and credit totals are in balance across all accounts"
        icon={<FaList />}
        actions={
          <Button variant="secondary" size="small" icon={<FaDownload />}>Export</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Debits</div>
          <div className="stat-value">$2,842,800.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Credits</div>
          <div className="stat-value">$2,871,880.00</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Difference</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>$29,080.00</div>
        </Card>
      </div>

      <Card title="Trial Balance — January 31, 2025">
        <Table columns={columns} data={mockTB} />
      </Card>
    </div>
  );
}
