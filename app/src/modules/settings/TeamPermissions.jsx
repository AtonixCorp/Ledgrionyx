import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const ROLE_COLORS = { Admin: 'var(--color-error)', Manager: 'var(--color-cyan)', Editor: 'var(--color-success)', Viewer: 'var(--color-silver-dark)' };

const teamRows = [];

const columns = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'role', header: 'Role', render: (row) => (
    <span className="status-badge" style={{ background: ROLE_COLORS[row.role] }}>{row.role}</span>
  )},
  { key: 'entities', header: 'Entity Access' },
  { key: 'lastLogin', header: 'Last Login' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: 'var(--color-success)' }}>{row.status}</span>
  )},
];

const BLANK_TEAM = { name: '', email: '', role: 'Editor', entities: '' };

export default function TeamPermissions() {
  const [showModal, setShowModal] = useState(false);
  const [teamList, setTeamList] = useState(teamRows);
  const [form, setForm] = useState(BLANK_TEAM);
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    const id = `USR-${String(teamList.length + 1).padStart(3, '0')}`;
    setTeamList(prev => [...prev, { id, name: form.name, email: form.email, role: form.role, entities: form.entities || 'All', lastLogin: '—', status: 'Active' }]);
    setForm(BLANK_TEAM);
    setShowModal(false);
  };

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
          <div className="stat-value">{teamList.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Admins</div>
          <div className="stat-value" style={{ color: 'var(--color-error)' }}>{teamList.filter((member) => member.role === 'Admin').length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active (Last 30 Days)</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>{teamList.filter((member) => member.status === 'Active').length}</div>
        </Card>
      </div>

      <Card>
        {teamList.length > 0 ? <Table columns={columns} data={teamList} /> : <p className="empty-state">No team members yet. Invite someone to populate this box.</p>}
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setForm(BLANK_TEAM); }} title="Invite Team Member" size="medium">
        <div className="form-grid">
          <Input label="Full Name" required value={form.name} onChange={set('name')} />
          <Input label="Email Address" type="email" required value={form.email} onChange={set('email')} />
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-midnight)', display: 'block', marginBottom: 6 }}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color-default)', borderRadius: 6, fontSize: 13 }}>
              <option>Admin</option>
              <option>Manager</option>
              <option>Editor</option>
              <option>Viewer</option>
            </select>
          </div>
          <Input label="Entity Access" placeholder="Entity names or 'All'" value={form.entities} onChange={set('entities')} />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => { setShowModal(false); setForm(BLANK_TEAM); }}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!form.name.trim() || !form.email.trim()}>Send Invitation</Button>
        </div>
      </Modal>
    </div>
  );
}
