import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockCustomers = [
  { id: 'C-001', name: 'Acme Corp', email: 'billing@acme.com', phone: '+1 (555) 100-2000', balance: '$12,500.00', status: 'Active' },
  { id: 'C-002', name: 'Globex Inc', email: 'ap@globex.com', phone: '+1 (555) 200-3000', balance: '$4,200.00', status: 'Active' },
  { id: 'C-003', name: 'Initech LLC', email: 'finance@initech.com', phone: '+1 (555) 300-4000', balance: '$0.00', status: 'Inactive' },
  { id: 'C-004', name: 'Umbrella Co', email: 'accounts@umbrella.com', phone: '+1 (555) 400-5000', balance: '$31,000.00', status: 'Active' },
];

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Customer Name' },
  { key: 'email', header: 'Email', render: (row) => (
    <a href={`mailto:${row.email}`} style={{ color: '#667eea' }}>{row.email}</a>
  )},
  { key: 'phone', header: 'Phone', render: (row) => (
    <span>{row.phone}</span>
  )},
  { key: 'balance', header: 'Balance' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: row.status === 'Active' ? '#27ae60' : '#95a5a6' }}>
      {row.status}
    </span>
  )},
];

export default function Customers() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Customers"
        subtitle="Manage your customer directory and accounts receivable contacts"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Add Customer
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">3</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Receivable</div>
          <div className="stat-value">$47,700.00</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockCustomers} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Customer" size="medium">
        <div className="form-grid">
          <Input label="Company Name" required />
          <Input label="Contact Name" />
          <Input label="Email" type="email" required />
          <Input label="Phone" type="tel" />
          <Input label="Address" />
          <Input label="Tax ID / VAT Number" />
          <Input label="Payment Terms" placeholder="e.g. Net 30" />
          <Input label="Currency" placeholder="USD" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Save Customer</Button>
        </div>
      </Modal>
    </div>
  );
}
