import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const INITIAL_CLIENTS = [];

const STATUS_COLORS = { Active: 'var(--color-success)', Inactive: 'var(--color-silver-dark)' };

const BLANK_CLIENT = { name: '', email: '', accessLevel: 'Reports Only' };

export default function ClientPortal() {
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(BLANK_CLIENT);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleInvite = () => {
    setClients(prev => [...prev, {
      name:            form.name,
      email:           form.email,
      lastLogin:       'Never',
      docsShared:      0,
      requestsPending: 0,
      status:          'Inactive',
    }]);
    setForm(BLANK_CLIENT);
    setShowModal(false);
  };

  const totalDocs    = clients.reduce((s, c) => s + c.docsShared, 0);
  const totalPending = clients.reduce((s, c) => s + c.requestsPending, 0);
  const activeCount  = clients.filter(c => c.status === 'Active').length;

  const columns = [
    { key: 'name',            header: 'Client' },
    { key: 'email',           header: 'Email' },
    { key: 'lastLogin',       header: 'Last Login' },
    { key: 'docsShared',      header: 'Docs Shared' },
    { key: 'requestsPending', header: 'Pending Requests', render: (row) => (
      <span style={{ color: row.requestsPending > 0 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 600 }}>
        {row.requestsPending}
      </span>
    )},
    { key: 'status', header: 'Status', render: (row) => (
      <span className="status-badge" style={{ background: STATUS_COLORS[row.status] }}>{row.status}</span>
    )},
    { key: '_actions', header: '', render: () => (
      <Button variant="secondary" size="small">View</Button>
    )},
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Client Portal"
        subtitle="Secure portal for clients to view reports, documents, and submit requests"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Invite Client</Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Portal Users</div>
          <div className="stat-value">{clients.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active Users</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{activeCount}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Documents Shared</div>
          <div className="stat-value">{totalDocs}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Pending Requests</div>
          <div className="stat-value" style={{ color: totalPending > 0 ? 'var(--color-warning)' : 'var(--color-success)' }}>
            {totalPending}
          </div>
        </Card>
      </div>

      <Card title="Portal Clients">
        {clients.length > 0 ? <Table columns={columns} data={clients} /> : <p className="empty-state">No portal clients yet. Invite one to populate this box.</p>}
      </Card>

      <Card title="Portal Security" style={{ marginTop: 20 }}>
        {[
          { label: 'Two-Factor Authentication Required', desc: 'All client portal access requires 2FA via email OTP', active: true },
          { label: 'Document Access Logging', desc: 'All document views and downloads are logged to the audit trail', active: true },
          { label: 'Session Expiry', desc: 'Portal sessions expire after 4 hours of inactivity', active: true },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-color-default)', fontSize: 13 }}>
            <span style={{ color: 'var(--color-success)', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>+</span>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--color-midnight)' }}>{item.label}</div>
              <div style={{ color: 'var(--color-silver-dark)', marginTop: 2 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_CLIENT); }} title="Invite Client to Portal">
        <div className="form-grid">
          <div>
            <label className="input-label">Client Name</label>
            <Input placeholder="Company or person name" value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label className="input-label">Email Address</label>
            <Input type="email" placeholder="finance@client.com" value={form.email} onChange={set('email')} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Access Level</label>
            <select className="filter-select" style={{ width: '100%', height: 40 }} value={form.accessLevel} onChange={set('accessLevel')}>
              <option value="Reports Only">Reports Only</option>
              <option value="Reports & Documents">Reports &amp; Documents</option>
              <option value="Full Portal">Full Portal Access</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_CLIENT); }}>Cancel</Button>
          <Button variant="primary" onClick={handleInvite} disabled={!form.name.trim() || !form.email.trim()}>
            Send Invitation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
