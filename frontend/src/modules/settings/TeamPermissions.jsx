import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const ROLE_COLORS = { Admin: '#e74c3c', Manager: '#667eea', Editor: '#27ae60', Viewer: '#95a5a6' };

const mockTeam = [
  { id: 'USR-001', name: 'Sarah Johnson', email: 'sarah@atc.com', role: 'Admin', entities: 'All', lastLogin: '2025-01-31', status: 'Active' },
  { id: 'USR-002', name: 'Michael Chen', email: 'michael@atc.com', role: 'Editor', entities: 'Entity A, Entity B', lastLogin: '2025-01-30', status: 'Active' },
  { id: 'USR-003', name: 'Lisa Rodriguez', email: 'lisa@atc.com', role: 'Manager', entities: 'Entity A', lastLogin: '2025-01-28', status: 'Active' },
  { id: 'USR-004', name: 'Guest Auditor', email: 'auditor@external.com', role: 'Viewer', entities: 'All (Read Only)', lastLogin: '2025-01-15', status: 'Active' },
];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: (row) => (
    <span className="status-badge" style={{ background: ROLE_COLORS[row.role] }}>{row.role}</span>
  )},
  { key: 'entities', header: 'Entity Access' },
  { key: 'lastLogin', header: 'Last Login' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: '#27ae60' }}>{row.status}</span>
  )},
];

export default function TeamPermissions() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Team & Permissions"
        subtitle="Manage team members, roles, and entity-level access controls"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Invite User
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-value" style={{ color: '#e74c3c' }}>1</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active (Last 30 Days)</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>4</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockTeam} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Invite Team Member" size="medium">
        <div className="form-grid">
          <Input label="Full Name" required />
          <Input label="Email Address" type="email" required />
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#2c3e50', display: 'block', marginBottom: 6 }}>Role</label>
            <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
          <Input label="Entity Access" placeholder="Entity names or 'All'" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Send Invitation</Button>
        </div>
      </Modal>
    </div>
  );
}
