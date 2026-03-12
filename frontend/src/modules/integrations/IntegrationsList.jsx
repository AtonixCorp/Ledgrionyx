import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const integrations = [
  { id: 'INT-001', name: 'Chase Bank (Direct Feed)', type: 'Banking', method: 'Plaid API', lastSync: '2025-01-31 06:02', status: 'Connected' },
  { id: 'INT-002', name: 'Stripe Payments', type: 'Payment Processor', method: 'Stripe API', lastSync: '2025-01-31 09:15', status: 'Connected' },
  { id: 'INT-003', name: 'ADP Payroll', type: 'Payroll', method: 'ADP API', lastSync: '2025-01-30 18:00', status: 'Connected' },
  { id: 'INT-004', name: 'Salesforce CRM', type: 'CRM', method: 'OAuth 2.0', lastSync: '—', status: 'Disconnected' },
];

const STATUS_COLORS = { Connected: 'var(--color-success)', Disconnected: 'var(--color-silver-dark)', Error: 'var(--color-error)' };

const columns = [
  { key: 'name', header: 'Integration' },
  { key: 'type', header: 'Type' },
  { key: 'method', header: 'Auth Method' },
  { key: 'lastSync', header: 'Last Sync' },
  { key: 'status', header: 'Status', render: (row) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>

      <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
    </div>
  )},
];

export default function IntegrationsList() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Integrations"
        subtitle="Connect your accounting platform with banks, payment processors, and third-party tools"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Add Integration
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Connected</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Disconnected</div>
          <div className="stat-value" style={{ color: 'var(--color-silver-dark)' }}>1</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Sync Errors</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>0</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={integrations} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Integration" size="medium">
        <div className="form-grid">
          <Input label="Integration Name" required placeholder="e.g. Chase Bank" />
          <Input label="Integration Type" placeholder="Banking, Payroll, CRM, Payment..." />
          <Input label="API Key / Client ID" />
          <Input label="API Secret / Client Secret" type="password" />
          <Input label="Webhook URL (if applicable)" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Connect</Button>
        </div>
      </Modal>
    </div>
  );
}
