import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';
import { FaUsers, FaPlus } from 'react-icons/fa';

const mockClients = [
  { id: 'CLI-001', name: 'Acme Corporation', industry: 'Manufacturing', entities: 3, engagement: 'Full Service', contact: 'John Smith', email: 'jsmith@acme.com', status: 'Active' },
  { id: 'CLI-002', name: 'Globex Holdings', industry: 'Finance', entities: 7, engagement: 'Tax Only', contact: 'Jane Doe', email: 'jdoe@globex.com', status: 'Active' },
  { id: 'CLI-003', name: 'Initech Group', industry: 'Technology', entities: 2, engagement: 'Bookkeeping', contact: 'Bob Jones', email: 'bjones@initech.com', status: 'Inactive' },
];

const columns = [
  { key: 'id', header: 'Client ID' },
  { key: 'name', header: 'Client Name' },
  { key: 'industry', header: 'Industry' },
  { key: 'entities', header: 'Entities' },
  { key: 'engagement', header: 'Engagement Type' },
  { key: 'contact', header: 'Primary Contact' },
  { key: 'email', header: 'Email' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: row.status === 'Active' ? '#27ae60' : '#95a5a6' }}>{row.status}</span>
  )},
];

export default function ClientDirectory() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Client Directory"
        subtitle="Manage client accounts, engagement types, and contact information"
        icon={<FaUsers />}
        actions={
          <Button variant="primary" size="small" icon={<FaPlus />} onClick={() => setShowModal(true)}>
            Add Client
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value" style={{ color: '#27ae60' }}>2</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Entities Managed</div>
          <div className="stat-value">12</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockClients} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Client" size="medium">
        <div className="form-grid">
          <Input label="Client Name" required />
          <Input label="Industry" />
          <Input label="Engagement Type" placeholder="Full Service, Tax Only, Bookkeeping..." />
          <Input label="Primary Contact Name" required />
          <Input label="Primary Contact Email" type="email" required />
          <Input label="Phone" type="tel" />
          <Input label="Address" />
          <Input label="Tax ID" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Add Client</Button>
        </div>
      </Modal>
    </div>
  );
}
