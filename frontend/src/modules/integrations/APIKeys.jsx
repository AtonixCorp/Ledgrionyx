import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';
import { FaKey, FaPlus, FaTrash, FaEye } from 'react-icons/fa';

const mockKeys = [
  { id: 'key_live_***4f8a', name: 'Production API', created: '2024-09-15', lastUsed: '2025-01-31', permissions: 'Read + Write', status: 'Active' },
  { id: 'key_test_***2b1c', name: 'Development / Testing', created: '2024-11-01', lastUsed: '2025-01-28', permissions: 'Read + Write', status: 'Active' },
  { id: 'key_live_***9e3d', name: 'Reporting Webhook', created: '2025-01-01', lastUsed: '2025-01-30', permissions: 'Read Only', status: 'Active' },
];

const columns = [
  { key: 'id', header: 'API Key' },
  { key: 'name', header: 'Name' },
  { key: 'created', header: 'Created' },
  { key: 'lastUsed', header: 'Last Used' },
  { key: 'permissions', header: 'Permissions' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: '#27ae60' }}>{row.status}</span>
  )},
];

export default function APIKeys() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="API Keys"
        subtitle="Create and manage API keys for external integrations"
        icon={<FaKey />}
        actions={
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={() => setShowModal(true)}>
            Generate New Key
          </Button>
        }
      />

      <Card style={{ marginBottom: 16, padding: '12px 20px', background: '#fffbf0', border: '1px solid #f39c12' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e67e22' }}>
          <FaEye />
          <span><strong>Security Notice:</strong> API keys provide full access to your account data. Never share keys publicly or commit them to source control.</span>
        </div>
      </Card>

      <Card>
        <Table columns={columns} data={mockKeys} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate API Key" size="medium">
        <div className="form-grid">
          <Input label="Key Name / Label" required placeholder="e.g. Production Integration" />
          <Input label="Permissions" placeholder="Read Only / Read + Write" />
          <Input label="IP Allowlist (optional)" placeholder="Comma-separated IP addresses" />
          <Input label="Expiry Date (optional)" type="date" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" icon={<FaKey />}>Generate Key</Button>
        </div>
      </Modal>
    </div>
  );
}
