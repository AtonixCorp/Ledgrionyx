import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockRules = [
  { id: 'AUTO-001', name: 'Auto-categorize AWS invoices', trigger: 'Bill received from AWS', action: 'Set category: Technology', runs: 24, lastRun: '2025-01-31', status: 'Active' },
  { id: 'AUTO-002', name: 'Overdue invoice reminder', trigger: 'Invoice 7 days past due', action: 'Send reminder email to customer', runs: 8, lastRun: '2025-01-28', status: 'Active' },
  { id: 'AUTO-003', name: 'Monthly payroll journal entry', trigger: '1st of each month', action: 'Create payroll JE from template', runs: 12, lastRun: '2025-01-01', status: 'Paused' },
  { id: 'AUTO-004', name: 'Bank sync - Chase Operating', trigger: 'Daily at 06:00 UTC', action: 'Import new bank transactions', runs: 365, lastRun: '2025-01-31', status: 'Active' },
];

const STATUS_COLORS = { Active: 'var(--color-success)', Paused: 'var(--color-warning)', Error: 'var(--color-error)' };

const columns = [
  { key: 'name', header: 'Rule Name' },
  { key: 'trigger', header: 'Trigger' },
  { key: 'action', header: 'Action' },
  { key: 'runs', header: 'Runs' },
  { key: 'lastRun', header: 'Last Run' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
  )},
];

export default function AutomationRules() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Automation Rules"
        subtitle="Create trigger-based rules to automate repetitive accounting tasks"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>New Rule
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Active Rules</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Paused</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>1</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Runs (All Time)</div>
          <div className="stat-value">409</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockRules} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Automation Rule" size="medium">
        <div className="form-grid">
          <Input label="Rule Name" required />
          <Input label="Trigger Event" required placeholder="e.g. Invoice overdue by 7 days..." />
          <Input label="Action" required placeholder="e.g. Send email, Create journal entry..." />
          <Input label="Schedule" placeholder="e.g. Daily, Weekly, On trigger..." />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Create & Activate</Button>
        </div>
      </Modal>
    </div>
  );
}
