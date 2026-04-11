import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const budgetRows = [];

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

const BLANK_BUDGET = { name: '', fiscalYear: '', startDate: '', endDate: '', amount: '', department: '' };

export default function Budgets() {
  const [showModal, setShowModal] = useState(false);
  const [budgetList, setBudgetList] = useState(budgetRows);
  const [form, setForm] = useState(BLANK_BUDGET);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const activeBudgets = budgetList.filter((budget) => budget.status === 'Active').length;
  const totalBudgetValue = budgetList.reduce((sum, budget) => sum + (parseFloat(String(budget.total).replace(/[^0-9.-]/g, '')) || 0), 0);
  const totalSpentValue = budgetList.reduce((sum, budget) => sum + (parseFloat(String(budget.spent).replace(/[^0-9.-]/g, '')) || 0), 0);
  const utilizationValue = totalBudgetValue > 0 ? Math.round((totalSpentValue / totalBudgetValue) * 1000) / 10 : 0;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const amtNum = parseFloat(form.amount) || 0;
    const total = amtNum ? `$${amtNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '$0.00';
    const period = form.startDate && form.endDate ? `${form.startDate} to ${form.endDate}` : form.fiscalYear || '—';
    setBudgetList(prev => [...prev, { name: form.name, period, total, spent: '$0.00', remaining: total, pct: 0, status: 'Active' }]);
    setForm(BLANK_BUDGET);
    setShowModal(false);
  };

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
          <div className="stat-value">{activeBudgets}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">FY2025 Total</div>
          <div className="stat-value">{totalBudgetValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">YTD Spend</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>{totalSpentValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Budget Utilization</div>
          <div className="stat-value">{utilizationValue}%</div>
        </Card>
      </div>

      <Card>
        {budgetList.length > 0 ? <Table columns={columns} data={budgetList} /> : <p className="empty-state">No budgets yet. Create one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_BUDGET); }} title="Create Budget" size="medium">
        <div className="form-grid">
          <Input label="Budget Name" required value={form.name} onChange={set('name')} />
          <Input label="Fiscal Year" required placeholder="2025" value={form.fiscalYear} onChange={set('fiscalYear')} />
          <Input label="Start Date" type="date" required value={form.startDate} onChange={set('startDate')} />
          <Input label="End Date" type="date" required value={form.endDate} onChange={set('endDate')} />
          <Input label="Total Amount" type="number" required value={form.amount} onChange={set('amount')} />
          <Input label="Department / Entity" value={form.department} onChange={set('department')} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_BUDGET); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim()}>Create Budget</Button>
        </div>
      </Modal>
    </div>
  );
}
