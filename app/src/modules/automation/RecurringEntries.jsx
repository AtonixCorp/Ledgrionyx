import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const recurringRows = [];

const STATUS_COLORS = { Active: 'var(--color-success)', Paused: 'var(--color-warning)' };

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'type', header: 'Type' },
  { key: 'frequency', header: 'Frequency' },
  { key: 'nextRun', header: 'Next Run' },
  { key: 'amount', header: 'Amount' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

const BLANK_ENTRY = { name: '', type: '', frequency: '', startDate: '', amount: '', glAccount: '' };

export default function RecurringEntries() {
  const [showModal, setShowModal] = useState(false);
  const [recurringList, setRecurringList] = useState(recurringRows);
  const [form, setForm] = useState(BLANK_ENTRY);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = () => {
    if (!form.name.trim() || !form.frequency.trim()) return;
    const amtNum = parseFloat(form.amount) || 0;
    setRecurringList(prev => [...prev, {
      name: form.name,
      type: form.type || 'Journal Entry',
      frequency: form.frequency,
      nextRun: form.startDate || '—',
      amount: amtNum ? `$${amtNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—',
      status: 'Active',
    }]);
    setForm(BLANK_ENTRY);
    setShowModal(false);
  };

  return (
    <div className="module-page">
      <PageHeader
        title="Recurring Entries"
        subtitle="Configure recurring journal entries, bills, and expenses"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Recurring Entry
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Active Entries</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{recurringList.filter((entry) => entry.status === 'Active').length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Next 7 Days</div>
          <div className="stat-value">0 entries</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Monthly Recurring Value</div>
          <div className="stat-value">$0.00</div>
        </Card>
      </div>

      <Card>
        {recurringList.length > 0 ? <Table columns={columns} data={recurringList} /> : <p className="empty-state">No recurring entries yet. Create one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_ENTRY); }} title="New Recurring Entry" size="medium">
        <div className="form-grid">
          <Input label="Entry Name" required value={form.name} onChange={set('name')} />
          <Input label="Type" placeholder="Journal Entry, Bill, Expense..." value={form.type} onChange={set('type')} />
          <Input label="Frequency" placeholder="Daily / Weekly / Monthly / Annual" required value={form.frequency} onChange={set('frequency')} />
          <Input label="Start Date" type="date" required value={form.startDate} onChange={set('startDate')} />
          <Input label="Amount" type="number" required value={form.amount} onChange={set('amount')} />
          <Input label="GL Account" value={form.glAccount} onChange={set('glAccount')} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_ENTRY); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim() || !form.frequency.trim()}>Create Entry</Button>
        </div>
      </Modal>
    </div>
  );
}
