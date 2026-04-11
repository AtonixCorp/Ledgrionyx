import React, { useState } from 'react';
import { PageHeader, Card, Button } from '../../components/ui';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$49',
    period: '/month',
    features: ['1 Entity', '2 Users', 'Basic Accounting', 'Invoicing', 'Email Support'],
    limit_entities: 1, limit_users: 2,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$149',
    period: '/month',
    features: ['5 Entities', '10 Users', 'Full Accounting Suite', 'Billing & Payments', 'Tax Center', 'Audit Trail', 'Priority Support'],
    limit_entities: 5, limit_users: 10,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$499',
    period: '/month',
    features: ['Unlimited Entities', 'Unlimited Users', 'All Modules', 'Custom Branding', 'API Access', 'Dedicated Manager', 'SLA Guarantee'],
    limit_entities: Infinity, limit_users: Infinity,
    current: true,
  },
];

const invoiceRows = [];

const usage = [
  { label: 'Entities', used: 3, limit: Infinity, display: '3 / Unlimited' },
  { label: 'Users', used: 7, limit: Infinity, display: '7 / Unlimited' },
  { label: 'API Calls (MTD)', used: 12450, limit: Infinity, display: '12,450 / Unlimited' },
  { label: 'Document Storage', used: 2.4, limit: Infinity, display: '2.4 GB / Unlimited' },
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState('enterprise');

  return (
    <div className="module-page">
      <PageHeader
        title="Subscription"
        subtitle="Manage your plan, billing, and usage"
      />

      {/* Current Plan Banner */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-silver-dark)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Current Plan</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-midnight)' }}>Enterprise</div>
            <div style={{ fontSize: 13, color: 'var(--color-silver-dark)', marginTop: 4 }}>
              Next billing date: <strong>Apr 1, 2026</strong> · $499.00/month
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary">Manage Payment Method</Button>
            <Button variant="secondary">Download Invoice</Button>
          </div>
        </div>
      </Card>

      {/* Usage */}
      <Card header="Usage This Month">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {usage.map(u => (
            <div key={u.label} style={{ padding: '12px 16px', border: '1px solid var(--border-color-default)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-silver-dark)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>{u.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-midnight)' }}>{u.display}</div>
              <div style={{ height: 4, background: 'var(--color-silver-very-light)', marginTop: 8 }}>
                <div style={{ height: '100%', background: 'var(--color-cyan)', width: `${u.limit === Infinity ? 20 : Math.round((u.used / u.limit) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Plan Comparison */}
      <Card header="Available Plans">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PLANS.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              style={{
                border: `2px solid ${selectedPlan === plan.id ? 'var(--color-cyan)' : 'var(--border-color-default)'}`,
                padding: 24,
                cursor: 'pointer',
                position: 'relative',
                background: plan.current ? 'var(--color-cyan-very-light)' : 'var(--color-white)',
              }}
            >
              {plan.current && (
                <div style={{
                  position: 'absolute', top: -1, right: -1,
                  background: 'var(--color-cyan)', color: '#fff',
                  fontSize: 10, fontWeight: 700, padding: '3px 10px',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>Current</div>
              )}
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-midnight)', marginBottom: 8 }}>{plan.name}</div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-midnight)' }}>{plan.price}</span>
                <span style={{ fontSize: 13, color: 'var(--color-silver-dark)' }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: 'var(--color-midnight)', padding: '4px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>+</span> {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.current ? 'secondary' : 'primary'}
                style={{ width: '100%' }}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Billing History */}
      <Card header="Billing History">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoiceRows.length > 0 ? (
              invoiceRows.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.date}</td>
                  <td>{inv.amount}</td>
                  <td><span className="status-badge" style={{ background: 'var(--color-success)' }}>{inv.status}</span></td>
                  <td><Button variant="secondary" size="small">Download PDF</Button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  <p className="empty-state" style={{ padding: '16px 0' }}>No invoices yet. Billing history will appear here.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
