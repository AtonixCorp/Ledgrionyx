import React, { useState } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';
import { FaChartBar, FaDownload, FaFileAlt } from 'react-icons/fa';

const STATEMENTS = [
  { id: 'income', title: 'Income Statement', subtitle: 'P&L for the period', icon: FaChartBar },
  { id: 'balance', title: 'Balance Sheet', subtitle: 'Assets, liabilities, equity', icon: FaFileAlt },
  { id: 'cashflow', title: 'Cash Flow Statement', subtitle: 'Operating, investing, financing', icon: FaChartBar },
  { id: 'equity', title: "Statement of Owners' Equity", subtitle: 'Changes in equity', icon: FaFileAlt },
  { id: 'retained', title: 'Retained Earnings', subtitle: 'Accumulated earnings', icon: FaChartBar },
];

const mockPL = [
  { category: 'Revenue', account: 'Service Revenue', current: '$284,000', ytd: '$1,420,000' },
  { category: 'Revenue', account: 'Product Revenue', current: '$62,000', ytd: '$310,000' },
  { category: 'COGS', account: 'Cost of Services', current: '($88,000)', ytd: '($440,000)' },
  { category: 'Expenses', account: 'Salaries & Wages', current: '($85,000)', ytd: '($425,000)' },
  { category: 'Expenses', account: 'Rent & Utilities', current: '($12,800)', ytd: '($64,000)' },
  { category: 'Expenses', account: 'Technology & SaaS', current: '($8,200)', ytd: '($41,000)' },
  { category: 'Net Income', account: 'Net Income', current: '$152,000', ytd: '$760,000', isBold: true },
];

export default function Statements() {
  const [selected, setSelected] = useState('income');

  return (
    <div className="module-page">
      <PageHeader
        title="Financial Statements"
        subtitle="GAAP-compliant income statement, balance sheet, and cash flow reports"
        icon={<FaFileAlt />}
        actions={
          <Button variant="secondary" size="small" icon={<FaDownload />}>Export PDF</Button>
        }
      />

      <div className="statement-tabs">
        {STATEMENTS.map((s) => (
          <button
            key={s.id}
            className={`stmt-tab${selected === s.id ? ' active' : ''}`}
            onClick={() => setSelected(s.id)}
          >
            <s.icon className="stmt-icon" />
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      <Card title="Income Statement — January 2025">
        <div className="statement-header-row">
          <span className="stmt-col-account">Account</span>
          <span className="stmt-col-num">Current Period</span>
          <span className="stmt-col-num">YTD</span>
        </div>
        {['Revenue', 'COGS', 'Expenses', 'Net Income'].map((cat) => {
          const rows = mockPL.filter((r) => r.category === cat);
          if (!rows.length) return null;
          return (
            <div key={cat} className="stmt-section">
              <div className="stmt-category">{cat}</div>
              {rows.map((r, i) => (
                <div key={i} className={`stmt-row${r.isBold ? ' bold' : ''}`}>
                  <span className="stmt-col-account">{r.account}</span>
                  <span className="stmt-col-num">{r.current}</span>
                  <span className="stmt-col-num">{r.ytd}</span>
                </div>
              ))}
            </div>
          );
        })}
      </Card>
    </div>
  );
}
