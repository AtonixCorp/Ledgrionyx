import React, { useState } from 'react';
import { PageHeader, Card, Table, Button, Modal, Input } from '../../components/ui';

const mockVendors = [
  { id: 'V-001', name: 'AWS Cloud', email: 'billing@aws.com', category: 'Technology', balance: '$3,200.00', status: 'Active' },
  { id: 'V-002', name: 'Office Depot', email: 'corp@officedepot.com', category: 'Supplies', balance: '$680.00', status: 'Active' },
  { id: 'V-003', name: 'KPMG Advisory', email: 'invoices@kpmg.com', category: 'Professional Services', balance: '$15,000.00', status: 'Active' },
  { id: 'V-004', name: 'Landlord LLC', email: 'rent@landlord.com', category: 'Rent', balance: '$0.00', status: 'Active' },
];

const columns = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Vendor Name' },
  { key: 'email', header: 'Email' },
  { key: 'category', header: 'Category' },
  { key: 'balance', header: 'Outstanding' },
  { key: 'status', header: 'Status', render: (row) => (
    <span className="status-badge" style={{ background: '#27ae60' }}>{row.status}</span>
  )},
];

export default function Vendors() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="module-page">
      <PageHeader
        title="Vendors"
        subtitle="Manage your vendor directory and accounts payable contacts"
        actions={
          <Button variant="primary" size="small" onClick={() => setShowModal(true)}>Add Vendor
          </Button>
        }
      />

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Vendors</div>
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Active</div>
          <div className="stat-value">4</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Total Payable</div>
          <div className="stat-value">$18,880.00</div>
        </Card>
      </div>

      <Card>
        <Table columns={columns} data={mockVendors} />
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Vendor" size="medium">
        <div className="form-grid">
          <Input label="Company Name" required />
          <Input label="Contact Name" />
          <Input label="Email" type="email" />
          <Input label="Phone" type="tel" />
          <Input label="Category" placeholder="e.g. Technology, Supplies..." />
          <Input label="Tax ID / W-9" />
          <Input label="Payment Terms" placeholder="e.g. Net 30" />
          <Input label="Bank / ACH Info" />
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary">Save Vendor</Button>
        </div>
      </Modal>
    </div>
  );
}
