import React, { useState } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';

const periods = [
  { period: 'December 2024', closedDate: '2025-01-15', closedBy: 'Sarah Johnson', status: 'Closed' },
  { period: 'November 2024', closedDate: '2024-12-12', closedBy: 'Sarah Johnson', status: 'Closed' },
  { period: 'October 2024', closedDate: '2024-11-10', closedBy: 'Michael Chen', status: 'Closed' },
  { period: 'January 2025', closedDate: '—', closedBy: '—', status: 'Open' },
];

const checklist = [
  { task: 'All bank accounts reconciled', done: true },
  { task: 'All journal entries posted and reviewed', done: true },
  { task: 'Accounts receivable aging reviewed', done: true },
  { task: 'Accounts payable aging reviewed', done: false },
  { task: 'Fixed asset depreciation posted', done: false },
  { task: 'Payroll entries confirmed', done: true },
  { task: 'Trial balance balanced', done: false },
  { task: 'Management review completed', done: false },
];

export default function PeriodClose() {
  const [items, setItems] = useState(checklist);

  const completedCount = items.filter((i) => i.done).length;
  const canClose = completedCount === items.length;

  const toggle = (idx) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, done: !item.done } : item));
  };

  return (
    <div className="module-page">
      <PageHeader
        title="Period Close"
        subtitle="Manage month-end and year-end close procedures"
        actions={
          <Button variant={canClose ? 'primary' : 'secondary'} size="small" disabled={!canClose}>Close Period
          </Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card title="Close Checklist — January 2025">
          <div style={{ marginBottom: 12, color: 'var(--color-silver-dark)', fontSize: 13 }}>
            {completedCount}/{items.length} tasks completed
          </div>
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => toggle(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 0',
                borderBottom: '1px solid var(--border-color-default)',
                cursor: 'pointer',
              }}
            >

              <span style={{ fontSize: 13, color: item.done ? 'var(--color-silver-dark)' : 'var(--color-midnight)', textDecoration: item.done ? 'line-through' : 'none' }}>
                {item.task}
              </span>
            </div>
          ))}
        </Card>

        <Card title="Period History">
          {periods.map((p, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: '1px solid var(--border-color-default)',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-midnight)' }}>{p.period}</div>
                {p.closedDate !== '—' && (
                  <div style={{ fontSize: 12, color: 'var(--color-silver-dark)' }}>Closed {p.closedDate} by {p.closedBy}</div>
                )}
              </div>
              <span className="status-badge" style={{ background: p.status === 'Closed' ? 'var(--color-success)' : 'var(--color-cyan)' }}>
                {p.status}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
