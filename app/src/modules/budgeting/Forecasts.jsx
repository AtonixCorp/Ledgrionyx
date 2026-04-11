import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const formatPoints = (series) => {
  const safeSeries = series.length ? series : [0];
  const max = Math.max(...safeSeries, 0);
  const min = Math.min(...safeSeries, 0);
  const range = max - min || 1;
  return safeSeries
    .map((v, i) => {
      const x = (i / (safeSeries.length - 1 || 1)) * 100;
      const y = 100 - ((v - min) / range) * 78 - 10;
      return `${x},${y}`;
    })
    .join(' ');
};

const MONTHS = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

const SCENARIOS = {
  best:  { label: 'Best Case',  color: 'var(--color-success)', revenue: [], expenses: [] },
  base:  { label: 'Base Case',  color: 'var(--color-cyan)',    revenue: [], expenses: [] },
  worst: { label: 'Worst Case', color: 'var(--color-error)',   revenue: [], expenses: [] },
};

const forecastRows = [];

const CONFIDENCE_COLORS = { High: 'var(--color-success)', Medium: 'var(--color-warning)', Low: 'var(--color-error)' };

const columns = [
  { key: 'month', header: 'Month' },
  { key: 'revenue', header: 'Projected Revenue' },
  { key: 'expenses', header: 'Projected Expenses' },
  { key: 'netIncome', header: 'Net Income' },
  { key: 'cashFlow', header: 'Cash Flow' },
  { key: 'confidence', header: 'Confidence', render: (row) => (
    <span className="status-badge" style={{ background: CONFIDENCE_COLORS[row.confidence] }}>{row.confidence}</span>
  )},
];

const BLANK_FORECAST = { name: '', startMonth: '', revGrowth: '', expGrowth: '', notes: '' };

export default function Forecasts() {
  const [activeScenario, setActiveScenario] = useState('base');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK_FORECAST);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const scenario = SCENARIOS[activeScenario];
  const netIncome = scenario.revenue.map((r, i) => r - scenario.expenses[i]);
  const totalRev = (scenario.revenue.reduce((s, v) => s + v, 0) * 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const avgNet = netIncome.length > 0
    ? Math.round(netIncome.reduce((s, v) => s + v, 0) / netIncome.length * 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
    : '$0';

  const handleCreate = () => { setForm(BLANK_FORECAST); setShowModal(false); };

  return (
    <div className="module-page">
      <PageHeader
        title="Forecasts"
        subtitle="AI-assisted financial projections and scenario modeling"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" size="small">Export Forecast</Button>
            <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Scenario</Button>
          </div>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">6-Month Revenue ({scenario.label})</div>
          <div className="stat-value">{totalRev}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Avg Monthly Net Income</div>
          <div className="stat-value">{avgNet}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Forecast Accuracy (TTM)</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>94.2%</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active Scenario</div>
          <div className="stat-value" style={{ color: scenario.color, fontSize: 16 }}>{scenario.label}</div>
        </Card>
      </div>

      {/* Scenario Chart */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-midnight)' }}>Revenue &amp; Net Income Forecast</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(SCENARIOS).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setActiveScenario(key)}
                style={{
                  padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', borderRadius: 4,
                  border: `1px solid ${activeScenario === key ? s.color : 'var(--border-color-default)'}`,
                  background: activeScenario === key ? s.color : 'var(--color-white)',
                  color: activeScenario === key ? '#fff' : 'var(--color-midnight)',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 200, border: '1px solid var(--border-color-default)', borderRadius: 4, overflow: 'hidden', background: 'var(--color-silver-very-light)' }}>
          {scenario.revenue.length > 0 ? (
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <polyline fill="none" stroke={scenario.color} strokeWidth="2" points={formatPoints(scenario.revenue)} />
              <polyline fill="none" stroke="var(--color-silver-dark)" strokeWidth="2" strokeDasharray="3 2" points={formatPoints(netIncome)} />
            </svg>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>No forecast data yet. Create a scenario to populate this box.</div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          {MONTHS.map(m => <span key={m} style={{ fontSize: 10, color: 'var(--color-silver-dark)', fontWeight: 600 }}>{m}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ display: 'inline-block', width: 14, height: 2, background: scenario.color }} /> Revenue
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ display: 'inline-block', width: 14, height: 2, borderTop: '2px dashed var(--color-silver-dark)' }} /> Net Income
          </div>
        </div>
      </Card>

      <Card title="Monthly Projections">
        {forecastRows.length > 0 ? <Table columns={columns} data={forecastRows} /> : <p className="empty-state">No projections yet. Add a scenario to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_FORECAST); }} title="New Forecast Scenario">
        <div className="form-grid">
          <div>
            <label className="input-label">Scenario Name</label>
            <Input placeholder="e.g. Downside Q2 2025" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="input-label">Start Month</label>
            <Input type="month" value={form.startMonth} onChange={set('startMonth')} />
          </div>
          <div>
            <label className="input-label">Revenue Growth Assumption (%)</label>
            <Input placeholder="e.g. 5.5" value={form.revGrowth} onChange={set('revGrowth')} />
          </div>
          <div>
            <label className="input-label">Expense Growth Assumption (%)</label>
            <Input placeholder="e.g. 3.0" value={form.expGrowth} onChange={set('expGrowth')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Notes / Assumptions</label>
            <Input placeholder="Key drivers and assumptions…" value={form.notes} onChange={set('notes')} />
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_FORECAST); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim()}>Create Scenario</Button>
        </div>
      </Modal>
    </div>
  );
}
