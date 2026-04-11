import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const keyRows = [];

const columns = [
  { key: 'id', header: 'API Key' },
  { key: 'name', header: 'Name' },
  { key: 'created', header: 'Created' },
  { key: 'lastUsed', header: 'Last Used' },
  { key: 'permissions', header: 'Permissions' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: 'var(--color-success)' }}>{row.status}</span>
  )},
];

const BLANK_KEY = { keyName: '', permissions: '', ipAllowlist: '', expiryDate: '' };

export default function APIKeys() {
  const [showModal, setShowModal] = useState(false);
  const [keyList, setKeyList] = useState(keyRows);
  const [form, setForm] = useState(BLANK_KEY);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = () => {
    if (!form.keyName.trim()) return;
    const rand = Math.random().toString(36).slice(2, 6);
    const today = new Date().toISOString().slice(0, 10);
    setKeyList(prev => [...prev, { id: `key_live_***${rand}`, name: form.keyName, created: today, lastUsed: '—', permissions: form.permissions || 'Read Only', status: 'Active' }]);
    setForm(BLANK_KEY);
    setShowModal(false);
  };

  return (
    <div className="module-page">
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API keys for external integrations"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Generate New Key
          </Button>
        }
      />

      <Card style={{ marginBottom: 16, padding: '12px 20px', background: 'var(--color-warning-light)', border: '1px solid var(--color-warning)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-warning)' }}>

          <span><strong>Security Notice:</strong>API keys provide full access to your account data. Never share keys publicly or commit them to source control.</span>
        </div>
      </Card>

      <Card>
        {keyList.length > 0 ? <Table columns={columns} data={keyList} /> : <p className="empty-state">No API keys yet. Generate one to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_KEY); }} title="Generate API Key" size="medium">
        <div className="form-grid">
          <Input label="Key Name / Label" required placeholder="e.g. Production Integration" value={form.keyName} onChange={set('keyName')} />
          <Input label="Permissions" placeholder="Read Only / Read + Write" value={form.permissions} onChange={set('permissions')} />
          <Input label="IP Allowlist (optional)" placeholder="Comma-separated IP addresses" value={form.ipAllowlist} onChange={set('ipAllowlist')} />
          <Input label="Expiry Date (optional)" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_KEY); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.keyName.trim()}>Generate Key</Button>
        </div>
      </Modal>
    </div>
  );
}
