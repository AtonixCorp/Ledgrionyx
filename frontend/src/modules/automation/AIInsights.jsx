import React from 'react';
import { PageHeader, Card } from '../../components/ui';

const insights = [
  {
    type: 'anomaly',
    color: 'var(--color-error)',
    title: 'Unusual Expense Spike Detected',
    body: 'Technology expenses increased 42% month-over-month ($5,800 to $8,200). Review recent software subscriptions and AWS usage.',
    action: 'View Technology Expenses',
  },
  {
    type: 'forecast',
    color: 'var(--color-cyan)',
    title: 'Cash Flow Forecast',
    body: 'Based on current AR/AP trends, projected cash position in 30 days: $124,500. Consider accelerating collections on INV-0002 (Globex Inc, $4,200 overdue).',
    action: 'View Cash Flow',
  },
  {
    type: 'insight',
    color: 'var(--color-warning)',
    title: 'Tax Savings Opportunity',
    body: '3 vendor bills totaling $21,200 may be eligible for accelerated depreciation under Section 179. Review with your tax advisor.',
    action: 'Review Bills',
  },
  {
    type: 'insight',
    color: 'var(--color-success)',
    title: 'Budget Performance Strong',
    body: 'You are tracking 8.2% under budget YTD with strong revenue growth (+8.7% in January vs forecast). On pace to exceed annual targets.',
    action: 'View Budget',
  },
];

export default function AIInsights() {
  return (
    <div className="module-page">
      <PageHeader
        title="AI Insights"
        subtitle="AI-powered anomaly detection, forecasting, and financial recommendations"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {insights.map((ins, i) => (
          <Card key={i}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: `${ins.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ins.icon style={{ color: ins.color, fontSize: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-midnight)', marginBottom: 6 }}>{ins.title}</div>
                <div style={{ fontSize: 13, color: 'var(--color-silver-dark)', lineHeight: 1.6, marginBottom: 12 }}>{ins.body}</div>
                <button className="filter-btn active" style={{ background: ins.color, borderColor: ins.color }}>
                  {ins.action}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
