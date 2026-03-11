import React from 'react';
import { PageHeader, Card, Button } from '../../components/ui';

const reports = [
  { id: 1, title: 'Income Statement', desc: 'Revenue, expenses, and net income by period', category: 'Financials' },
  { id: 2, title: 'Balance Sheet', desc: 'Assets, liabilities, and equity snapshot', category: 'Financials' },
  { id: 3, title: 'Cash Flow Statement', desc: 'Operating, investing, and financing cash flows', category: 'Financials' },
  { id: 4, title: 'AR Aging Report', desc: 'Outstanding receivables by age bucket', category: 'Subledger' },
  { id: 5, title: 'AP Aging Report', desc: 'Outstanding payables by age bucket', category: 'Subledger' },
  { id: 6, title: 'Fixed Asset Schedule', desc: 'Depreciation schedule for all fixed assets', category: 'Subledger' },
  { id: 7, title: 'Payroll Summary', desc: 'Gross pay, deductions, and net pay by period', category: 'HR & Payroll' },
  { id: 8, title: 'Budget vs Actual', desc: 'Variance analysis against approved budget', category: 'Budgeting' },
  { id: 9, title: 'Tax Liability Report', desc: 'Detailed breakdown of tax liabilities by jurisdiction', category: 'Tax' },
  { id: 10, title: 'General Ledger Detail', desc: 'All GL transactions by account and date range', category: 'Accounting' },
  { id: 11, title: 'Journal Entry Summary', desc: 'All journal entries by period with audit trail', category: 'Accounting' },
  { id: 12, title: 'Inventory Valuation', desc: 'FIFO/LIFO/Average cost inventory report', category: 'Inventory' },
];

const CATEGORY_COLORS = {
  Financials: '#667eea',
  Subledger: '#27ae60',
  'HR & Payroll': '#f39c12',
  Budgeting: '#9b59b6',
  Tax: '#e74c3c',
  Accounting: '#2c3e50',
  Inventory: '#16a085',
};

export default function Analytics() {
  const categories = [...new Set(reports.map((r) => r.category))];

  return (
    <div className="module-page">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Access and run all pre-built financial reports"
        actions={
          <Button variant="secondary" size="small">Scheduled Reports</Button>
        }
      />

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h3 style={{
            fontSize: 13,
            fontWeight: 700,
            color: CATEGORY_COLORS[cat] || '#667eea',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: `2px solid ${CATEGORY_COLORS[cat] || '#667eea'}`,
          }}>
            {cat}
          </h3>
          <div className="report-grid">
            {reports.filter((r) => r.category === cat).map((r) => (
              <div key={r.id} className="report-card-link">
                <div className="report-card-title">{r.title}</div>
                <div className="report-card-desc">{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
